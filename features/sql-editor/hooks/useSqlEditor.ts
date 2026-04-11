"use client";

import { useState, useCallback } from "react";

import { queryApi } from "@/shared/api/query";
import { serviceService } from "@/features/services/services/service.service";
import { qualifyColumns } from "../utils/query-parser";

function extractSchemaFromSql(query: string): string | undefined {
  const schemaPattern =
    /\b(?:FROM|JOIN|UPDATE|INTO)\s+([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\b/i;
  const match = query.match(schemaPattern);
  return match?.[1];
}

function getExecutionErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      apiError.response?.data?.message ||
      apiError.message ||
      "Failed to execute Trino query"
    );
  }

  return "Failed to execute Trino query";
}

export interface SqlTab {
  id: string;
  name: string;
  query: string;
  results: QueryResultState[];
  activeResultTabId: string | null;
  catalog?: string;
  schema?: string;
  table?: string;
}

export interface QueryResultState {
  id: string;
  title: string;
  query: string;
  data: unknown[][];
  columns: string[];
  totalRows: number;
  executionTime: number;
  loading: boolean;
  error: string | null;
  queryId: string | null;
  pagination: {
    pageSize: number;
    current: number;
  };
  status: "loading" | "success" | "error";
  totalCount?: number;
}

function createLoadingResult(
  id: string,
  query: string,
  pageSize: number,
  index: number,
): QueryResultState {
  return {
    id,
    title: getResultTitle(query, index),
    query,
    data: [],
    columns: [],
    totalRows: 0,
    executionTime: 0,
    loading: true,
    error: null,
    queryId: null,
    pagination: { pageSize, current: 0 },
    status: "loading",
  };
}

function cleanSqlStatement(query: string) {
  return query.trim().replace(/;+$/g, "").trim();
}

function splitSqlStatements(query: string) {
  const statements: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < query.length; index += 1) {
    const char = query[index];
    const previousChar = index > 0 ? query[index - 1] : "";

    if (char === "'" && !inDoubleQuote && previousChar !== "\\") {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote && previousChar !== "\\") {
      inDoubleQuote = !inDoubleQuote;
    }

    if (char === ";" && !inSingleQuote && !inDoubleQuote) {
      const normalized = cleanSqlStatement(current);
      if (normalized) {
        statements.push(normalized);
      }
      current = "";
      continue;
    }

    current += char;
  }

  const trailing = cleanSqlStatement(current);
  if (trailing) {
    statements.push(trailing);
  }

  return statements;
}

function getResultTitle(query: string, index: number) {
  const normalized = query.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return `Result ${index + 1}`;
  }

  return normalized.length > 36
    ? `${normalized.slice(0, 36)}...`
    : normalized;
}

export function useSqlEditor() {
  const [tabs, setTabs] = useState<SqlTab[]>([
    {
      id: "tab-1",
      name: "Query 1",
      query: "",
      results: [],
      activeResultTabId: null,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");

  const addTab = useCallback(() => {
    const newId = `tab-${Date.now()}`;
    const newTab: SqlTab = {
      id: newId,
      name: `Query ${tabs.length + 1}`,
      query: "",
      results: [],
      activeResultTabId: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  }, [tabs.length]);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== id);
        if (activeTabId === id && newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1].id);
        }
        return newTabs;
      });
    },
    [activeTabId],
  );

  const updateTabQuery = useCallback((id: string, query: string) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, query } : t)));
  }, []);

  const updateTabContext = useCallback(
    (id: string, context: { catalog?: string; schema?: string; table?: string }) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...context,
                catalog: "iceberg",
              }
            : t,
        ),
      );
    },
    [],
  );

  const executeQuery = useCallback(
    async (
      tabId: string,
      selectedQuery?: string,
      options?: { page?: number; pageSize?: number; openNewTab?: boolean; queryText?: string },
    ) => {
      const tab = tabs.find((t) => t.id === tabId);
      const querySource = options?.queryText ?? tab?.query ?? "";
      if (!tab || (!querySource && !selectedQuery)) return;

      const activeResult = tab.results.find(r => r.id === tab.activeResultTabId);
      const isAlreadyRunning = activeResult?.status === "loading";
      if (isAlreadyRunning) return;

      const currentPage = options?.page ?? activeResult?.pagination.current ?? 0;
      const currentPageSize = options?.pageSize ?? activeResult?.pagination.pageSize ?? 50;
      
      const isPaging = options?.page !== undefined || options?.pageSize !== undefined;
      const sourceQuery = selectedQuery || querySource;

      if (isPaging) {
        const queryToRun = cleanSqlStatement(sourceQuery);
        if (!queryToRun || !activeResult) return;
        const resultId = activeResult.id;

        // Paging execution: Update existing result status
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  results: t.results.map(r => r.id === resultId ? { 
                    ...r, 
                    status: "loading", 
                    loading: true,
                    pagination: { pageSize: currentPageSize, current: currentPage } 
                  } : r)
                }
              : t,
          ),
        );

        try {
          const startTime = Date.now();
          const executionSchema =
            extractSchemaFromSql(queryToRun) || tab.schema || "catalog_views";
          const hasLimit = /\bLIMIT\s+\d+/i.test(queryToRun);
          const response = await serviceService.executeTrinoQuery({
            sql: queryToRun,
            catalog: "iceberg",
            schema: executionSchema,
            ...(hasLimit ? {} : {
              limit: currentPageSize,
              offset: currentPage * currentPageSize
            }),
          });

          const qualifiedCols = qualifyColumns(queryToRun, response.columns);
          const endTime = Date.now();

          setTabs((prev) =>
            prev.map((t) =>
              t.id === tabId
                ? {
                    ...t,
                    results: t.results.map((r) =>
                      r.id === resultId
                        ? {
                            ...r,
                            query: queryToRun,
                            loading: false,
                            data: response.rows,
                            columns: qualifiedCols,
                            totalRows: response.rows.length,
                            totalCount: r.totalCount ?? (response.rows.length < currentPageSize
                              ? (currentPage * currentPageSize) + response.rows.length
                              : response.stats?.processedRows),
                            executionTime:
                              response.stats?.executionTimeMs || endTime - startTime,
                            status: "success",
                          }
                        : r,
                    ),
                  }
                : t,
            ),
          );
        } catch (error: unknown) {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === tabId
                ? {
                    ...t,
                    results: t.results.map((r) =>
                      r.id === resultId
                        ? {
                            ...r,
                            query: queryToRun,
                            loading: false,
                            error: getExecutionErrorMessage(error),
                            status: "error",
                          }
                        : r,
                    ),
                  }
                : t,
            ),
          );
        }

        return;
      }

      const queries = selectedQuery
        ? [cleanSqlStatement(sourceQuery)].filter(Boolean)
        : splitSqlStatements(sourceQuery);

      if (queries.length === 0) {
        return;
      }

      const shouldReuseActiveResult = !options?.openNewTab && Boolean(activeResult);
      const resultIds = queries.map((_, index) =>
        shouldReuseActiveResult && index === 0 && activeResult
          ? activeResult.id
          : `res-${Date.now()}-${index}`,
      );
      const newResults: QueryResultState[] = queries.map((query, index) =>
        createLoadingResult(resultIds[index], query, currentPageSize, index),
      );

      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? {
                ...t,
                results: (
                  shouldReuseActiveResult && activeResult
                    ? [
                        ...newResults,
                        ...t.results.filter((result) => result.id !== activeResult.id),
                      ]
                    : [...newResults, ...t.results]
                ).slice(0, 10),
                activeResultTabId: newResults[0]?.id || t.activeResultTabId,
              }
            : t,
        ),
      );

      for (let index = 0; index < newResults.length; index += 1) {
        const result = newResults[index];
        const queryToRun = result.query;

        try {
          const startTime = Date.now();
          const executionSchema =
            extractSchemaFromSql(queryToRun) || tab.schema || "catalog_views";
          const hasLimit = /\bLIMIT\s+\d+/i.test(queryToRun);
          const response = await serviceService.executeTrinoQuery({
            sql: queryToRun,
            catalog: "iceberg",
            schema: executionSchema,
            ...(hasLimit ? {} : {
              limit: currentPageSize,
              offset: 0,
            }),
          });

          const qualifiedCols = qualifyColumns(queryToRun, response.columns);
          const endTime = Date.now();

          setTabs((prev) =>
            prev.map((t) =>
              t.id === tabId
                ? {
                    ...t,
                    results: t.results.map((existingResult) =>
                      existingResult.id === result.id
                        ? {
                            ...existingResult,
                            loading: false,
                            data: response.rows,
                            columns: qualifiedCols,
                            totalRows: response.rows.length,
                            totalCount:
                              response.rows.length < currentPageSize
                                ? response.rows.length
                                : response.stats?.processedRows,
                            executionTime:
                              response.stats?.executionTimeMs || endTime - startTime,
                            status: "success",
                          }
                        : existingResult,
                    ),
                  }
                : t,
            ),
          );
        } catch (error: unknown) {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === tabId
                ? {
                    ...t,
                    results: t.results.map((existingResult) =>
                      existingResult.id === result.id
                        ? {
                            ...existingResult,
                            loading: false,
                            error: getExecutionErrorMessage(error),
                            status: "error",
                          }
                        : existingResult,
                    ),
                  }
                : t,
            ),
          );
        }
      }
    },
    [tabs],
  );

  const goToPage = useCallback((tabId: string, resultId: string, page: number) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const result = tab.results.find(r => r.id === resultId);
    if (!result) return;
    
    executeQuery(tabId, result.query, { page, pageSize: result.pagination.pageSize });
  }, [tabs, executeQuery]);

  const updatePageSize = useCallback((tabId: string, resultId: string, pageSize: number) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const result = tab.results.find(r => r.id === resultId);
    if (!result) return;
    
    executeQuery(tabId, result.query, { page: 0, pageSize });
  }, [tabs, executeQuery]);

  const cancelQuery = useCallback(
    async (tabId: string, resultId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      const result = tab?.results.find((r) => r.id === resultId);
      if (!result?.queryId) return;

      try {
        await queryApi.cancel({ query_id: result.queryId });
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  results: t.results.map((r) =>
                    r.id === resultId
                      ? {
                          ...r,
                          loading: false,
                          error: "Query cancelled by user",
                          status: "error",
                        }
                      : r,
                  ),
                }
              : t,
          ),
        );
      } catch (error) {
        console.error("Failed to cancel query", error);
      }
    },
    [tabs],
  );

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    setTabs,
    addTab,
    closeTab,
    updateTabQuery,
    updateTabContext,
    executeQuery,
    goToPage,
    updatePageSize,
    cancelQuery,
  };
}
