"use client";

import React from "react";
import { Tooltip } from "antd";
import { Loader2, Table as TableIcon, X } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { useSqlEditorContext } from "../contexts/SqlEditorContext";
import type { QueryResultState, SqlTab } from "../hooks/useSqlEditor";
import { SqlResultViewer } from "./SqlResultViewer";
import { SQL_EDITOR_OPEN_SAVE_QUERY_MODAL_EVENT } from "../constants";

export function ResultPanel() {
  const { tabs, activeTabId, setTabs, cancelQuery, goToPage, updatePageSize } =
    useSqlEditorContext();
  const [activeResultView, setActiveResultView] = React.useState<
    "saved-query" | "visualization"
  >("saved-query");

  const activeTab = tabs.find((tab: SqlTab) => tab.id === activeTabId);
  const activeResultId = activeTab?.activeResultTabId;

  const activeResult =
    activeTab?.results.find(
      (result: QueryResultState) => result.id === activeResultId,
    ) || activeTab?.results[0];

  React.useEffect(() => {
    if (!activeResultId) {
      return;
    }
    setActiveResultView("saved-query");
  }, [activeTabId, activeResultId]);

  if (!activeTab || activeTab.results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white">
        <TableIcon size={48} className="text-slate-100 mb-4" />
        <p className="text-sm font-medium">No results to display</p>
        <p className="text-xs text-slate-300">
          Run a query to see results here
        </p>
      </div>
    );
  }

  const resolvedActiveResult = activeResult || activeTab.results[0];

  const handleCloseResult = (resultId: string) => {
    setTabs((previousTabs: SqlTab[]) =>
      previousTabs.map((tab: SqlTab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              results: tab.results.filter(
                (result: QueryResultState) => result.id !== resultId,
              ),
              activeResultTabId:
                tab.activeResultTabId === resultId
                  ? tab.results.length > 1
                    ? tab.results.find(
                        (result: QueryResultState) => result.id !== resultId,
                      )?.id || null
                    : null
                  : tab.activeResultTabId,
            }
          : tab,
      ),
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center gap-1 px-4 border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
        {activeTab.results.map((result: QueryResultState) => {
          const isActive = resolvedActiveResult.id === result.id;

          return (
            <div
              key={result.id}
              onClick={() => {
                setTabs((previousTabs: SqlTab[]) =>
                  previousTabs.map((tab: SqlTab) =>
                    tab.id === activeTabId
                      ? { ...tab, activeResultTabId: result.id }
                      : tab,
                  ),
                );
              }}
              className={cn(
                "group flex items-center h-9 px-3 min-w-[100px] cursor-pointer rounded-t-lg text-xs font-medium transition-all relative border-b-2",
                isActive
                  ? "bg-white text-blue-600 border-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border-transparent",
              )}
            >
              <Tooltip title={result.query}>
                <span className="truncate flex-1">
                  {result.title ||
                    `Result ${activeTab.results.indexOf(result) + 1}`}
                </span>
              </Tooltip>
              {result.loading && (
                <Loader2
                  size={10}
                  className="animate-spin ml-2 text-blue-500"
                />
              )}
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleCloseResult(result.id);
                }}
                className="p-0.5 rounded-full hover:bg-slate-200 opacity-0 group-hover:opacity-100 ml-2"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveResultView("saved-query");
              window.dispatchEvent(
                new CustomEvent(SQL_EDITOR_OPEN_SAVE_QUERY_MODAL_EVENT, {
                  detail: { queryText: resolvedActiveResult.query },
                }),
              );
            }}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              activeResultView === "saved-query"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            Saved Query
          </button>
          <button
            type="button"
            onClick={() => setActiveResultView("visualization")}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              activeResultView === "visualization"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            Visualization
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {activeResultView === "saved-query" ? (
          <SqlResultViewer
            result={resolvedActiveResult}
            catalog={activeTab.catalog}
            schema={activeTab.schema}
            onCancel={() => cancelQuery(activeTabId, resolvedActiveResult.id)}
            onGoToPage={(page) => goToPage(activeTabId, resolvedActiveResult.id, page)}
            onUpdatePageSize={(pageSize) =>
              updatePageSize(activeTabId, resolvedActiveResult.id, pageSize)
            }
            onDismissError={() => handleCloseResult(resolvedActiveResult.id)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center bg-slate-50/50 p-8">
            <div className="text-center">
              <TableIcon size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">
                No visualization available yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Switch back to Saved Query to inspect rows and pagination.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
