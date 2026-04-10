import * as monaco from "monaco-editor";
import { serviceService } from "@/features/services/services/service.service";

/**
 * SQL Autocomplete Service (v5 - Direct-Table & Alias-Aware Discovery)
 * --------------------------------------------------------------------
 * Implements context-aware SQL suggestions with caching and
 * robust table/alias resolution from query text.
 */

let isRegistered = false;
let currentContext = { catalog: "iceberg", schema: "catalog_views" };

function hasValidContext() {
  return Boolean(currentContext.catalog && currentContext.schema);
}

/**
 * Update the global context for autocomplete (e.g., active catalog/schema).
 */
export function setAutocompleteContext(context: { catalog?: string; schema?: string }) {
  currentContext = {
    catalog: context.catalog || currentContext.catalog || "iceberg",
    schema: context.schema || currentContext.schema || "catalog_views",
  };
}

// Caching layer to avoid redundant API calls
const cache = {
  tables: new Map<string, string[]>(), // Map<"catalog.schema", tableNames[]>
  columns: new Map<string, string[]>(), // Map<"catalog.schema.table", columnNames[]>
  isFetchingTables: false,
};

/**
 * Fetch and cache the list of available tables for current context.
 */
async function getTables(): Promise<string[]> {
  if (!hasValidContext()) {
    return [];
  }

  const cacheKey = `${currentContext.catalog}.${currentContext.schema}`;
  if (cache.tables.has(cacheKey)) return cache.tables.get(cacheKey) || [];

  try {
    let tables: string[] = [];
    if (currentContext.catalog === "iceberg" && currentContext.schema === "catalog_views") {
      const tableData = await serviceService.getTrinoCatalogViewTables();
      tables = tableData.map((t) => t.name);
    } else {
      const tableData = await serviceService.getTrinoTables(currentContext.catalog, currentContext.schema);
      tables = tableData.map((t) => t.name);
    }
    cache.tables.set(cacheKey, tables);
    return tables;
  } catch {
    cache.tables.set(cacheKey, []);
    return [];
  }
}

/**
 * Fetch and cache column names for a specific table.
 */
async function getColumns(tableName: string): Promise<string[]> {
  if (!hasValidContext() || !tableName) {
    return [];
  }

  const cacheKey = `${currentContext.catalog}.${currentContext.schema}.${tableName}`;
  if (cache.columns.has(cacheKey)) return cache.columns.get(cacheKey) || [];

  try {
    const detail = await serviceService.getTrinoTableDetail(
      currentContext.catalog,
      currentContext.schema,
      tableName
    );
    const columns = detail.columns?.map((c) => c.name) || [];
    cache.columns.set(cacheKey, columns);
    return columns;
  } catch {
    cache.columns.set(cacheKey, []);
    return [];
  }
}

/**
 * Parses the query and extracts table and alias mappings.
 * e.g., "FROM table1 AS a1 JOIN table2" -> Map { a1 => table1, table1 => table1, table2 => table2 }
 */
export function extractTableContext(query: string): Map<string, string> {
  const contextMap = new Map<string, string>();
  // Match FROM/JOIN patterns: table [AS] [alias]
  const tableRegex = /(?:FROM|JOIN)\s+([a-zA-Z0-9_\-]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_\-]+))?/gi;
  
  let match;
  while ((match = tableRegex.exec(query)) !== null) {
    const table = match[1];
    const alias = match[2];

    // 1. Always map the table name to itself (direct reference)
    contextMap.set(table, table);

    // 2. Map the alias if present and not a keyword
    if (alias) {
      const keywords = ["ON", "WHERE", "GROUP", "ORDER", "LIMIT", "SELECT", "LEFT", "RIGHT", "INNER", "OUTER", "USING"];
      if (!keywords.includes(alias.toUpperCase())) {
        contextMap.set(alias, table);
      }
    }
  }
  return contextMap;
}

/**
 * Attempts to find the primary table referenced in the current query.
 */
function findTableInQuery(query: string): string | null {
  const fromMatch = query.match(/FROM\s+([a-zA-Z0-9_\-]+)/i);
  if (fromMatch) return fromMatch[1];
  const joinMatch = query.match(/JOIN\s+([a-zA-Z0-9_\-]+)/i);
  if (joinMatch) return joinMatch[1];
  return null;
}

/**
 * Registers the SQL Completion Item Provider with Monaco.
 */
export function registerSqlAutocomplete(monacoInstance: typeof monaco) {
  if (isRegistered) return;
  isRegistered = true;

  monacoInstance.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: [" ", ".", ","],
    provideCompletionItems: async (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const fullText = model.getValue();
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1).trim();
      
      const contextMap = extractTableContext(fullText);
      const suggestions: monaco.languages.CompletionItem[] = [];

      try {
        // --- Context Detection ---
        const lastToken = textUntilPosition.split(/\s+/).pop()?.toUpperCase();
        const isFromContext = lastToken === "FROM" || lastToken === "JOIN";
        const isDotContext = textUntilPosition.endsWith(".");
        const isSelectContext = lastToken === "SELECT" || textUntilPosition.endsWith(",");

        // 1. Table Suggestions (FROM/JOIN)
        if (isFromContext) {
          const tables = await getTables();
          tables.forEach((t) => {
            suggestions.push({
              label: t,
              kind: monacoInstance.languages.CompletionItemKind.Class,
              detail: `Table (${currentContext.schema})`,
              insertText: t,
              range,
            });
          });
        } 
        
        // 2. Direct-Table & Alias-Aware Column Suggestions (Dot Access)
        else if (isDotContext) {
          const parts = textUntilPosition.split(/\s+/);
          const lastPart = parts[parts.length - 1];
          const identifier = lastPart.substring(0, lastPart.length - 1); 
          
          if (identifier) {
            const resolvedTable = contextMap.get(identifier) || identifier;
            const columns = await getColumns(resolvedTable);
            columns.forEach((c) => {
              suggestions.push({
                label: c,
                kind: monacoInstance.languages.CompletionItemKind.Field,
                detail: `Column (${resolvedTable})`,
                insertText: c,
                range,
              });
            });
          }
        }

        // 3. Smart Column Suggestions (SELECT)
        else if (isSelectContext) {
          const activeTable = findTableInQuery(fullText);
          if (activeTable) {
            const columns = await getColumns(activeTable);
            columns.forEach((c) => {
              suggestions.push({
                label: c,
                kind: monacoInstance.languages.CompletionItemKind.Field,
                detail: `Column (from ${activeTable})`,
                insertText: c,
                range,
              });
            });
          }
        }

        // 4. Keywords & Snippets
        if (suggestions.length === 0) {
          const keywords = [
            "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN",
            "GROUP BY", "ORDER BY", "LIMIT", "AS", "IN", "BETWEEN", "LIKE", "IS NULL",
            "CASE", "WHEN", "THEN", "ELSE", "END", "AND", "OR", "DESC", "ASC", "ON"
          ];

          keywords.forEach((k) => {
            suggestions.push({
              label: k,
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: k,
              range,
            });
          });

          // Helpful Snippets
          suggestions.push({
            label: "SELECT ALL",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: "SELECT * FROM ${1:table_name};",
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "Query all columns from a table",
            range,
          });

          suggestions.push({
            label: "SELECT WHERE",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: "SELECT ${1:column} FROM ${2:table} WHERE ${3:condition};",
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "Conditional query snippet",
            range,
          });
        }

      } catch (error) {
        console.error("Monaco SQL Autocomplete Provider Error:", error);
      }

      return { suggestions };
    },
  });
}
