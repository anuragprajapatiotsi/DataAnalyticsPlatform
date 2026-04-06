import { extractTableContext } from "../services/autocomplete";

/**
 * SQL Result Qualification Utility (v1)
 * -------------------------------------
 * Transforms raw column names into unique, table-qualified identifiers
 * by parsing the SELECT clause of the original query.
 */

/**
 * Qualifies a list of raw column names using the source SQL query.
 * Falls back to index-based uniqueness if parsing fails or is ambiguous.
 */
export function qualifyColumns(query: string, rawColumns: string[]): string[] {
  if (!query || !rawColumns.length) return rawColumns;

  try {
    // 1. Extract the SELECT clause items (using [\s\S] instead of /s flag for compatibility)
    const selectMatch = query.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
    if (!selectMatch) {
      // Fallback for non-standard queries or SELECT *
      return rawColumns.map((col, idx) => `${col}-${idx}`);
    }

    const selectClause = selectMatch[1].trim();
    
    // 2. Split SELECT items by comma (ignoring commas inside parentheses)
    const selectItems = splitSelectItems(selectClause);

    // 3. Map items to raw columns
    // Note: This assumes 1-to-1 mapping which holds for standard SELECT queries.
    // If it's "SELECT *" or count mismatch, we use the fallback.
    if (selectItems.length !== rawColumns.length) {
      return rawColumns.map((col, idx) => `${col}-${idx}`);
    }

    return selectItems.map((item, idx) => {
      const rawCol = rawColumns[idx];
      const trimmedItem = item.trim();
      
      // Handle "expression AS alias"
      const asMatch = trimmedItem.match(/.+?\s+AS\s+([a-zA-Z0-9_\-]+)/i);
      if (asMatch) return asMatch[1];

      // Handle "table.column" or "alias.column"
      if (trimmedItem.includes(".")) {
        const parts = trimmedItem.split(".");
        const columnPart = parts[parts.length - 1].replace(/["`\[\]]/g, "");
        if (columnPart.toLowerCase() === rawCol.toLowerCase()) {
          return trimmedItem;
        }
      }

      // Default fallback for this specific column
      return `${rawCol}-${idx}`;
    });

  } catch (err) {
    console.warn("SQL Column Qualification Failed:", err);
    return rawColumns.map((col, idx) => `${col}-${idx}`);
  }
}

/**
 * Safely splits SELECT items by comma, respecting parentheses.
 */
function splitSelectItems(clause: string): string[] {
  const items: string[] = [];
  let current = "";
  let parenDepth = 0;

  for (let i = 0; i < clause.length; i++) {
    const char = clause[i];
    if (char === "(") parenDepth++;
    if (char === ")") parenDepth--;
    
    if (char === "," && parenDepth === 0) {
      items.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  if (current) items.push(current.trim());
  return items;
}
