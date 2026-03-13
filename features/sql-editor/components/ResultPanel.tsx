"use client";

import React from "react";
import {
  Table as TableIcon,
  X,
  Clock,
  Database,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useSqlEditorContext } from "../contexts/SqlEditorContext";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { SqlTab, QueryResultState } from "../hooks/useSqlEditor";

export function ResultPanel() {
  const { tabs, activeTabId, setTabs, cancelQuery } = useSqlEditorContext();

  const activeTab = tabs.find((t: SqlTab) => t.id === activeTabId);

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

  

  const activeResult =
    activeTab.results.find(
      (r: QueryResultState) => r.id === activeTab.activeResultTabId,
    ) || activeTab.results[0];

  const handleCloseResult = (resId: string) => {
    setTabs((prev: SqlTab[]) =>
      prev.map((t: SqlTab) =>
        t.id === activeTabId
          ? {
              ...t,
              results: t.results.filter(
                (r: QueryResultState) => r.id !== resId,
              ),
              activeResultTabId:
                t.activeResultTabId === resId
                  ? t.results.length > 1
                    ? t.results.find((r: QueryResultState) => r.id !== resId)
                        ?.id || null
                    : null
                  : t.activeResultTabId,
            }
          : t,
      ),
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Result Tabs Header */}
      <div className="flex items-center gap-1 px-4 border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
        {activeTab.results.map((res: QueryResultState) => {
          const isActive = activeResult.id === res.id;
          return (
            <div
              key={res.id}
              onClick={() => {
                setTabs((prev: SqlTab[]) =>
                  prev.map((t: SqlTab) =>
                    t.id === activeTabId
                      ? { ...t, activeResultTabId: res.id }
                      : t,
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
              <span className="truncate flex-1">
                Result {activeTab.results.indexOf(res) + 1}
              </span>
              {res.loading && (
                <Loader2
                  size={10}
                  className="animate-spin ml-2 text-blue-500"
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseResult(res.id);
                }}
                className="p-0.5 rounded-full hover:bg-slate-200 opacity-0 group-hover:opacity-100 ml-2"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Result Content */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {activeResult.loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">
                Executing Query...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Fetching data from the server
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 h-7 text-[11px] font-bold border-red-100 text-red-600 hover:bg-red-50"
                onClick={() => cancelQuery(activeTabId, activeResult.id)}
              >
                Cancel Query
              </Button>
            </div>
          </div>
        ) : activeResult.error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              Execution Failed
            </h4>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
              {activeResult.error}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-8 font-bold text-xs"
            >
              Review Query
            </Button>
          </div>
        ) : (
          <>
            {/* Toolbar Info */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Database size={12} className="text-slate-400" />
                  <span>{activeResult.totalRows} rows</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-400" />
                  <span>{activeResult.executionTime}ms</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-4">
                  <p className="text-[11px] text-slate-500">Rows per page</p>
                  <select className="text-[11px] bg-transparent border-none font-bold text-slate-700 cursor-pointer focus:ring-0">
                    <option>50</option>
                    <option>100</option>
                    <option>500</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-slate-200"
                    disabled
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <span className="text-[11px] font-bold text-slate-700 min-w-[3rem] text-center">
                    Page 1
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-slate-200"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              <table className="w-full border-collapse text-[13px] text-slate-700 table-fixed">
                <thead className="sticky top-0 bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)] z-10">
                  <tr>
                    <th className="w-10 px-2 py-2 border-b border-r border-slate-100 bg-slate-50/50 text-slate-400 font-normal text-[11px]">
                      #
                    </th>
                    {activeResult.columns.map((col: string) => (
                      <th
                        key={col}
                        className="px-3 py-2 border-b border-r border-slate-100 text-left bg-slate-50/50 text-slate-500 font-bold uppercase tracking-tighter text-[10px] truncate"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeResult.data.map((row: any[], idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-2 py-1.5 border-b border-r border-slate-50 text-center text-slate-300 text-[10px]">
                        {idx + 1}
                      </td>
                      {row.map((cell: any, cIdx: number) => (
                        <td
                          key={cIdx}
                          className="px-3 py-1.5 border-b border-r border-slate-50 truncate max-w-[300px]"
                          title={String(cell)}
                        >
                          {cell === null ? (
                            <span className="text-slate-300 italic">null</span>
                          ) : (
                            String(cell)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {activeResult.data.length === 0 && (
                    <tr>
                      <td
                        colSpan={activeResult.columns.length + 1}
                        className="p-8 text-center text-slate-400 italic"
                      >
                        No data returned for this query
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
