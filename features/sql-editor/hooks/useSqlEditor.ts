"use client";

import { useState, useCallback } from "react";

import { queryApi } from "@/shared/api/query";
import { serviceService } from "@/features/services/services/service.service";
import { qualifyColumns } from "../utils/query-parser";

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
  query: string;
  data: any[][];
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

export function useSqlEditor() {
  const [tabs, setTabs] = useState<SqlTab[]>([
    {
      id: "tab-1",
      name: "Query 1",
      query: "SELECT * FROM public.users LIMIT 10",
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
        prev.map((t) => (t.id === id ? { ...t, ...context } : t)),
      );
    },
    [],
  );

  const executeQuery = useCallback(
    async (tabId: string, selectedQuery?: string, options?: { page?: number; pageSize?: number }) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab || (!tab.query && !selectedQuery)) return;

      const activeResult = tab.results.find(r => r.id === tab.activeResultTabId);
      const isAlreadyRunning = activeResult?.status === "loading";
      if (isAlreadyRunning) return;

      const queryToRun = selectedQuery || tab.query;
      const currentPage = options?.page ?? activeResult?.pagination.current ?? 0;
      const currentPageSize = options?.pageSize ?? activeResult?.pagination.pageSize ?? 50;
      
      const resultId = activeResult && options ? activeResult.id : `res-${Date.now()}`;
      
      if (!options) {
        // Initial execution: Create new result
        const newResult: QueryResultState = {
          id: resultId,
          query: queryToRun,
          data: [],
          columns: [],
          totalRows: 0,
          executionTime: 0,
          loading: true,
          error: null,
          queryId: null,
          pagination: { pageSize: currentPageSize, current: currentPage },
          status: "loading",
        };

        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  results: [newResult, ...t.results].slice(0, 5),
                  activeResultTabId: resultId,
                }
              : t,
          ),
        );
      } else {
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
      }

      try {
        const startTime = Date.now();
        
        // Step 4: Execute using Trino API with context
        const hasLimit = /\bLIMIT\s+\d+/i.test(queryToRun);
        const response = await serviceService.executeTrinoQuery({
          sql: queryToRun,
          catalog: tab.catalog || "default",
          schema: tab.schema || "default",
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
      } catch (error: any) {
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
                          error:
                            error.response?.data?.message ||
                            error.message ||
                            "Failed to execute Trino query",
                          status: "error",
                        }
                      : r,
                  ),
                }
              : t,
          ),
        );
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
