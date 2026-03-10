import * as monaco from "monaco-editor";
import { metadataApi } from "@/shared/api/metadata";

let isRegistered = false;

export async function registerSqlAutocomplete(monacoInstance: typeof monaco) {
  if (isRegistered) return;
  isRegistered = true;

  monacoInstance.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: [" ", "."],
    provideCompletionItems: async (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1);

      const suggestions: any[] = [];

      try {
        // Simple context detection
        const isFromContext =
          /FROM\s+$/i.test(textUntilPosition) ||
          /JOIN\s+$/i.test(textUntilPosition);
        const isDotContext = textUntilPosition.endsWith(".");

        if (isDotContext) {
          const parts = textUntilPosition.split(/\s+/);
          const lastPart = parts[parts.length - 1];
          const schemaName = lastPart.substring(0, lastPart.length - 1);

          if (schemaName) {
            // Fetch tables for this schema
            const tables = await metadataApi.getTables(schemaName);
            tables.forEach((t) => {
              suggestions.push({
                label: t.name,
                kind: monacoInstance.languages.CompletionItemKind.Class,
                detail: "Table",
                insertText: t.name,
                range,
              });
            });
          }
        } else if (isFromContext) {
          // Suggest schemas
          const schemas = await metadataApi.getSchemas();
          schemas.forEach((s) => {
            suggestions.push({
              label: s.name,
              kind: monacoInstance.languages.CompletionItemKind.Module,
              detail: "Schema",
              insertText: s.name,
              range,
            });
          });
        } else {
          // Generic suggestions (Keywords and schemas)
          const keywords = [
            "SELECT",
            "FROM",
            "WHERE",
            "JOIN",
            "LEFT",
            "RIGHT",
            "INNER",
            "GROUP BY",
            "ORDER BY",
            "LIMIT",
            "INSERT",
            "UPDATE",
            "DELETE",
            "TRUNCATE",
          ];
          keywords.forEach((k) => {
            suggestions.push({
              label: k,
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: k,
              range,
            });
          });
        }
      } catch (error) {
        console.error("Autocomplete fetch error", error);
      }

      return { suggestions };
    },
  });
}
