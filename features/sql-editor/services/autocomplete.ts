import * as monaco from "monaco-editor";
import { serviceService } from "@/features/services/services/service.service";

const DEFAULT_CATALOG = "iceberg";
const FETCH_DEBOUNCE_MS = 250;
const PROVIDER_THROTTLE_MS = 200;
const MAX_SUGGESTIONS = 30;

let isRegistered = false;
let currentContext = { catalog: DEFAULT_CATALOG, schema: "" };

type TableReference = {
  catalog: string;
  schema: string;
  table: string;
  reference: string;
};

type CachedValue = string[];

const cache = {
  schemas: null as string[] | null,
  tables: new Map<string, CachedValue>(),
  columns: new Map<string, CachedValue>(),
  pending: new Map<string, Promise<CachedValue>>(),
};

let lastCompletionKey = "";
let lastCompletionAt = 0;
let lastCompletionResult: monaco.languages.CompletionList = { suggestions: [] };

function normalizeIdentifier(value: string) {
  return value.replace(/^["`]|["`]$/g, "").trim();
}

function getCatalog() {
  return DEFAULT_CATALOG;
}

export function setAutocompleteContext(context: { catalog?: string; schema?: string }) {
  currentContext = {
    catalog: DEFAULT_CATALOG,
    schema: context.schema || currentContext.schema || "",
  };
}

function scheduleCachedFetch(
  key: string,
  reader: () => CachedValue | null,
  writer: (value: CachedValue) => void,
  loader: () => Promise<CachedValue>,
) {
  const cached = reader();
  if (cached) {
    return Promise.resolve(cached);
  }

  const pending = cache.pending.get(key);
  if (pending) {
    return pending;
  }

  const promise = new Promise<CachedValue>((resolve) => {
    setTimeout(async () => {
      try {
        const value = await loader();
        writer(value);
        resolve(value);
      } catch {
        writer([]);
        resolve([]);
      } finally {
        cache.pending.delete(key);
      }
    }, FETCH_DEBOUNCE_MS);
  });

  cache.pending.set(key, promise);
  return promise;
}

async function getSchemas() {
  return scheduleCachedFetch(
    "schemas",
    () => cache.schemas,
    (value) => {
      cache.schemas = value;
    },
    async () => {
      const schemas = await serviceService.getTrinoSchemas(DEFAULT_CATALOG);
      return schemas
        .map((schema) => normalizeIdentifier(schema.name))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
    },
  );
}

async function getTables(schema: string) {
  const normalizedSchema = normalizeIdentifier(schema);
  if (!normalizedSchema) {
    return [];
  }

  const key = `tables:${DEFAULT_CATALOG}.${normalizedSchema}`;
  return scheduleCachedFetch(
    key,
    () => cache.tables.get(key) || null,
    (value) => {
      cache.tables.set(key, value);
    },
    async () => {
      const tables = await serviceService.getTrinoTables(DEFAULT_CATALOG, normalizedSchema);
      return tables
        .map((table) => normalizeIdentifier(table.name))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
    },
  );
}

async function getColumns(schema: string, table: string) {
  const normalizedSchema = normalizeIdentifier(schema);
  const normalizedTable = normalizeIdentifier(table);

  if (!normalizedSchema || !normalizedTable) {
    return [];
  }

  const key = `columns:${DEFAULT_CATALOG}.${normalizedSchema}.${normalizedTable}`;
  return scheduleCachedFetch(
    key,
    () => cache.columns.get(key) || null,
    (value) => {
      cache.columns.set(key, value);
    },
    async () => {
      const detail = await serviceService.getTrinoTableDetail(
        DEFAULT_CATALOG,
        normalizedSchema,
        normalizedTable,
      );
      return (detail.columns || [])
        .map((column) => normalizeIdentifier(column.name))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
    },
  );
}

function getSuggestionRange(
  position: monaco.Position,
  startColumn: number,
  endColumn: number,
): monaco.IRange {
  return {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn,
    endColumn,
  };
}

function filterAndLimit(items: string[], prefix = "") {
  const normalizedPrefix = prefix.toLowerCase();
  return items
    .filter((item) => !normalizedPrefix || item.toLowerCase().startsWith(normalizedPrefix))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, MAX_SUGGESTIONS);
}

function toCompletionItems(
  monacoInstance: typeof monaco,
  items: string[],
  kind: monaco.languages.CompletionItemKind,
  detail: string,
  range: monaco.IRange,
) {
  return items.map((item) => ({
    label: item,
    kind,
    insertText: item,
    detail,
    range,
  }));
}

function parseQualifiedReference(
  rawReference: string,
  fallbackSchema?: string,
): TableReference | null {
  const parts = rawReference
    .split(".")
    .map((part) => normalizeIdentifier(part))
    .filter(Boolean);

  if (parts.length === 3) {
    return {
      catalog: parts[0],
      schema: parts[1],
      table: parts[2],
      reference: `${parts[1]}.${parts[2]}`,
    };
  }

  if (parts.length === 2) {
    return {
      catalog: getCatalog(),
      schema: parts[0],
      table: parts[1],
      reference: `${parts[0]}.${parts[1]}`,
    };
  }

  if (parts.length === 1 && fallbackSchema) {
    return {
      catalog: getCatalog(),
      schema: fallbackSchema,
      table: parts[0],
      reference: `${fallbackSchema}.${parts[0]}`,
    };
  }

  return null;
}

export function extractTableContext(query: string) {
  const contextMap = new Map<string, TableReference>();
  const tableRegex =
    /(?:FROM|JOIN|UPDATE|INTO)\s+([a-zA-Z0-9_\-."`]+(?:\.[a-zA-Z0-9_\-."`]+){0,2})(?:\s+(?:AS\s+)?([a-zA-Z0-9_\-]+))?/gi;

  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(query)) !== null) {
    const reference = parseQualifiedReference(match[1], currentContext.schema || undefined);
    if (!reference) {
      continue;
    }

    contextMap.set(reference.table, reference);
    contextMap.set(reference.reference, reference);

    const alias = match[2];
    if (alias) {
      const normalizedAlias = normalizeIdentifier(alias);
      const keywords = new Set([
        "ON",
        "WHERE",
        "GROUP",
        "ORDER",
        "LIMIT",
        "SELECT",
        "LEFT",
        "RIGHT",
        "INNER",
        "OUTER",
        "USING",
      ]);

      if (normalizedAlias && !keywords.has(normalizedAlias.toUpperCase())) {
        contextMap.set(normalizedAlias, reference);
      }
    }
  }

  return contextMap;
}

function getUniqueReferences(contextMap: Map<string, TableReference>) {
  const unique = new Map<string, TableReference>();
  contextMap.forEach((value) => {
    unique.set(`${value.schema}.${value.table}`, value);
  });
  return Array.from(unique.values());
}

function getWordStartColumn(position: monaco.Position, prefixLength: number) {
  return Math.max(1, position.column - prefixLength);
}

function getDotContext(rawTextUntilPosition: string) {
  const match = rawTextUntilPosition.match(
    /([a-zA-Z0-9_\-."`]+(?:\.[a-zA-Z0-9_\-."`]*){0,1})\.([a-zA-Z0-9_\-]*)$/,
  );

  if (!match) {
    return null;
  }

  return {
    target: match[1],
    prefix: match[2] || "",
  };
}

function isTablePathContext(rawTextUntilPosition: string) {
  return /\b(FROM|JOIN|UPDATE|INTO|TABLE)\s+[a-zA-Z0-9_\-."`]*$/i.test(rawTextUntilPosition);
}

function getSchemaContext(rawTextUntilPosition: string) {
  const match = rawTextUntilPosition.match(
    /\b(?:FROM|JOIN|UPDATE|INTO|TABLE)\s+([a-zA-Z0-9_\-]*)$/i,
  );

  if (!match) {
    return null;
  }

  return {
    prefix: normalizeIdentifier(match[1] || ""),
  };
}

function getTableContextAfterSchema(rawTextUntilPosition: string) {
  const match = rawTextUntilPosition.match(
    /\b(?:FROM|JOIN|UPDATE|INTO|TABLE)\s+([a-zA-Z0-9_\-."`]+)\.([a-zA-Z0-9_\-]*)$/i,
  );

  if (!match) {
    return null;
  }

  return {
    schema: normalizeIdentifier(match[1]),
    prefix: normalizeIdentifier(match[2] || ""),
  };
}

function isSelectListContext(rawTextUntilPosition: string) {
  const upper = rawTextUntilPosition.toUpperCase();
  const selectIndex = upper.lastIndexOf("SELECT");
  if (selectIndex === -1) {
    return false;
  }

  const fromIndex = upper.lastIndexOf("FROM");
  return fromIndex < selectIndex;
}

function getStandaloneIdentifierPrefix(rawTextUntilPosition: string) {
  const match = rawTextUntilPosition.match(/([a-zA-Z0-9_\-]*)$/);
  return match?.[1] || "";
}

function buildKeywordSuggestions(
  monacoInstance: typeof monaco,
  range: monaco.IRange,
) {
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "GROUP BY",
    "ORDER BY",
    "LIMIT",
    "AS",
    "IN",
    "BETWEEN",
    "LIKE",
    "IS NULL",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "AND",
    "OR",
    "DESC",
    "ASC",
    "ON",
  ];

  return [
    ...keywords.map((keyword) => ({
      label: keyword,
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: keyword,
      range,
    })),
    {
      label: "SELECT ALL",
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: "SELECT * FROM ${1:schema}.${2:table} LIMIT 10;",
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: "Query all columns from a table",
      range,
    },
    {
      label: "SELECT WHERE",
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: "SELECT ${1:column} FROM ${2:schema}.${3:table} WHERE ${4:condition};",
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: "Conditional query snippet",
      range,
    },
  ];
}

async function resolveCompletionResult(
  key: string,
  producer: () => Promise<monaco.languages.CompletionList>,
) {
  const now = Date.now();
  if (key === lastCompletionKey && now - lastCompletionAt < PROVIDER_THROTTLE_MS) {
    return lastCompletionResult;
  }

  const result = await producer();
  lastCompletionKey = key;
  lastCompletionAt = Date.now();
  lastCompletionResult = result;
  return result;
}

export function registerSqlAutocomplete(monacoInstance: typeof monaco) {
  if (isRegistered) {
    return;
  }

  isRegistered = true;

  monacoInstance.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: ["."],
    provideCompletionItems: async (model, position) => {
      const fullText = model.getValue();
      if (!fullText.trim()) {
        return { suggestions: [] };
      }

      const fullTextUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const lineContent = model.getLineContent(position.lineNumber);
      const lineUntilPosition = lineContent.slice(0, Math.max(position.column - 1, 0));
      const rawTextUntilPosition = fullTextUntilPosition;
      const word = model.getWordUntilPosition(position);
      const defaultRange = getSuggestionRange(
        position,
        word.startColumn,
        word.endColumn,
      );
      const completionKey = `${position.lineNumber}:${position.column}:${lineUntilPosition.trimStart()}`;

      return resolveCompletionResult(completionKey, async () => {
        const contextMap = extractTableContext(fullTextUntilPosition);

        try {
          const dotContext = getDotContext(rawTextUntilPosition);
          const schemaContext = getSchemaContext(rawTextUntilPosition);
          const tableContext = getTableContextAfterSchema(rawTextUntilPosition);

          if (tableContext?.schema) {
            const range = getSuggestionRange(
              position,
              getWordStartColumn(position, tableContext.prefix.length),
              position.column,
            );
            const tables = await getTables(tableContext.schema);
            return {
              suggestions: toCompletionItems(
                monacoInstance,
                filterAndLimit(tables, tableContext.prefix),
                monacoInstance.languages.CompletionItemKind.Class,
                `Table (${tableContext.schema})`,
                range,
              ),
            };
          }

          if (schemaContext) {
            const range = getSuggestionRange(
              position,
              getWordStartColumn(position, schemaContext.prefix.length),
              position.column,
            );
            const schemas = await getSchemas();
            return {
              suggestions: toCompletionItems(
                monacoInstance,
                filterAndLimit(schemas, schemaContext.prefix),
                monacoInstance.languages.CompletionItemKind.Module,
                "Schema",
                range,
              ),
            };
          }

          if (dotContext) {
            const dotRange = getSuggestionRange(
              position,
              getWordStartColumn(position, dotContext.prefix.length),
              position.column,
            );

            const targetParts = dotContext.target
              .split(".")
              .map((part) => normalizeIdentifier(part))
              .filter(Boolean);

            if (isTablePathContext(rawTextUntilPosition) && targetParts.length === 1) {
              const tables = await getTables(targetParts[0]);
              return {
                suggestions: toCompletionItems(
                  monacoInstance,
                  filterAndLimit(tables, dotContext.prefix),
                  monacoInstance.languages.CompletionItemKind.Class,
                  `Table (${targetParts[0]})`,
                  dotRange,
                ),
              };
            }

            let resolvedReference: TableReference | null = null;

            if (targetParts.length === 2) {
              resolvedReference = parseQualifiedReference(
                `${targetParts[0]}.${targetParts[1]}`,
                currentContext.schema || undefined,
              );
            } else if (targetParts.length === 1) {
              resolvedReference =
                contextMap.get(targetParts[0]) ||
                parseQualifiedReference(targetParts[0], currentContext.schema || undefined);
            }

            if (resolvedReference) {
              const columns = await getColumns(
                resolvedReference.schema,
                resolvedReference.table,
              );
              return {
                suggestions: toCompletionItems(
                  monacoInstance,
                  filterAndLimit(columns, dotContext.prefix),
                  monacoInstance.languages.CompletionItemKind.Field,
                  `Column (${resolvedReference.reference})`,
                  dotRange,
                ),
              };
            }
          }

          if (isSelectListContext(rawTextUntilPosition)) {
            const prefix = getStandaloneIdentifierPrefix(rawTextUntilPosition);
            const references = getUniqueReferences(contextMap);

            if (references.length > 0) {
              const columnSets = await Promise.all(
                references.map(async (reference) => ({
                  reference,
                  columns: await getColumns(reference.schema, reference.table),
                })),
              );

              const suggestions = columnSets
                .flatMap(({ reference, columns }) =>
                  columns.map((column) => ({
                    label: column,
                    kind: monacoInstance.languages.CompletionItemKind.Field,
                    detail: `Column (${reference.reference})`,
                    insertText: column,
                    range: defaultRange,
                  })),
                )
                .filter(
                  (item) => !prefix || item.label.toLowerCase().startsWith(prefix.toLowerCase()),
                )
                .sort((a, b) => a.label.localeCompare(b.label))
                .slice(0, MAX_SUGGESTIONS);

              if (suggestions.length > 0) {
                return { suggestions };
              }
            }
          }

          return {
            suggestions: buildKeywordSuggestions(monacoInstance, defaultRange),
          };
        } catch {
          return {
            suggestions: buildKeywordSuggestions(monacoInstance, defaultRange),
          };
        }
      });
    },
  });
}
