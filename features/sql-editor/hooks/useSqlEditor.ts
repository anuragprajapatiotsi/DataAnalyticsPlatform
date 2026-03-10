"use client";

import { useState, useCallback } from "react";
import type { QueryResponse } from "@/shared/types";

import { queryApi } from "@/shared/api/query";

export interface SqlTab {
  id: string;
  name: string;
  query: string;
  results: QueryResultState[];
  activeResultTabId: string | null;
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
}

export function useSqlEditor() {
  const [tabs, setTabs] = useState<SqlTab[]>([
    {
      id: "tab-1",
      name: "Query 1",
      query: "SELECT * FROM public.users LIMIT 10;",
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

  const executeQuery = useCallback(
    async (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab || !tab.query) return;

      const resultId = `res-${Date.now()}`;
      const newResult: QueryResultState = {
        id: resultId,
        query: tab.query,
        data: [],
        columns: [],
        totalRows: 0,
        executionTime: 0,
        loading: true,
        error: null,
        queryId: null,
        pagination: { pageSize: 50, current: 0 },
      };

      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? {
                ...t,
                results: [newResult, ...t.results].slice(0, 5), // Keep last 5 results
                activeResultTabId: resultId,
              }
            : t,
        ),
      );

      try {
        const startTime = Date.now();
        const response = await queryApi.execute({
          query: tab.query,
          limit: newResult.pagination.pageSize,
          offset: newResult.pagination.current * newResult.pagination.pageSize,
        });
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
                          data: response.data,
                          columns: response.columns,
                          totalRows: response.total_rows,
                          executionTime:
                            response.execution_time_ms || endTime - startTime,
                          queryId: response.query_id,
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
                            "Failed to execute query",
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
    executeQuery,
    cancelQuery,
  };
}
