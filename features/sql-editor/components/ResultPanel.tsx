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
  const { tabs, activeTabId, setTabs, cancelQuery, goToPage, updatePageSize } =
    useSqlEditorContext();

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
        {activeResult.status === "loading" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-[2px] z-20">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-slate-100 rounded-full" />
              <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-sm font-bold text-slate-800 tracking-tight">
                Executing Trino Query...
              </p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                Fetching results from {activeTab.catalog}.{activeTab.schema}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6 h-8 text-[11px] font-bold border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                onClick={() => cancelQuery(activeTabId, activeResult.id)}
              >
                Cancel Execution
              </Button>
            </div>
          </div>
        ) : activeResult.status === "error" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-100/50">
              <AlertCircle size={32} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2 tracking-tight">
              Execution Failed
            </h4>
            <div className="max-w-lg mb-6 p-4 bg-white border border-red-100 rounded-xl shadow-sm text-left">
              <p className="text-xs font-mono text-red-600 leading-relaxed break-all">
                {activeResult.error || "An unknown technical error occurred during query execution."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="h-9 font-bold text-xs px-6 shadow-sm"
              >
                Review Documentation
              </Button>
              <Button
                size="sm"
                variant="default"
                className="h-9 font-bold text-xs px-6 bg-slate-900 hover:bg-slate-800 shadow-sm"
                onClick={() => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, results: t.results.filter(r => r.id !== activeResult.id) } : t))}
              >
                Dismiss Error
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar Info */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-5 text-[11px] font-semibold text-slate-500">
                <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <Database size={13} className="text-blue-500/70" />
                  <span className="text-slate-700">
                    Showing{" "}
                    <span className="font-bold text-slate-900">
                      {activeResult.pagination.current * activeResult.pagination.pageSize + 1}
                    </span>
                    –
                    <span className="font-bold text-slate-900">
                      {activeResult.pagination.current * activeResult.pagination.pageSize + activeResult.data.length}
                    </span>
                    {" "}of{" "}
                    <span className="font-bold text-slate-900">
                      {activeResult.totalCount !== undefined ? activeResult.totalCount : "?"}
                    </span>
                    {" "}rows
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <Clock size={13} className="text-amber-500/70" />
                  <span className="text-slate-700 font-bold">{activeResult.executionTime}ms</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-6 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Rows per page</p>
                  <select 
                    className="text-[11px] bg-transparent border-none font-black text-slate-900 cursor-pointer focus:ring-0 p-0 h-auto"
                    value={activeResult.pagination.pageSize}
                    onChange={(e) => updatePageSize(activeTabId, activeResult.id, Number(e.target.value))}
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl hover:bg-slate-100 hover:text-slate-900 text-slate-500 transition-all disabled:opacity-20 border border-transparent hover:border-slate-200"
                    disabled={activeResult.pagination.current === 0}
                    onClick={() => goToPage(activeTabId, activeResult.id, activeResult.pagination.current - 1)}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  <div className="flex items-center justify-center min-w-[80px] h-8 bg-slate-900 rounded-xl text-white shadow-sm ring-1 ring-slate-900/10">
                    <span className="text-[11px] font-black tracking-tight">
                      Page {activeResult.pagination.current + 1}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl hover:bg-slate-100 hover:text-slate-900 text-slate-500 transition-all disabled:opacity-20 border border-transparent hover:border-slate-200"
                    disabled={
                      activeResult.totalCount !== undefined
                        ? activeResult.pagination.current >= Math.ceil(activeResult.totalCount / activeResult.pagination.pageSize) - 1
                        : activeResult.data.length < activeResult.pagination.pageSize
                    }
                    onClick={() => goToPage(activeTabId, activeResult.id, activeResult.pagination.current + 1)}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto custom-scrollbar relative bg-white">
              <table className="w-max min-w-full border-collapse text-[13px] text-slate-700 table-auto">
                <thead className="sticky top-0 bg-slate-50 shadow-[0_1px_0_rgba(0,0,0,0.05)] z-10">
                  <tr>
                    <th className="sticky left-0 z-20 w-12 px-3 py-2.5 border-b border-r border-slate-200 bg-slate-50 text-slate-400 font-medium text-[10px] text-center shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                      #
                    </th>
                    {activeResult.columns.map((col: string, idx: number) => {
                      const parts = col.split(".");
                      const hasAlias = parts.length > 1 && !col.includes("-");
                      const displayName = col.includes("-") ? col.split("-")[0] : col;

                      return (
                        <th
                          key={col}
                          className="px-4 py-2.5 border-b border-r border-slate-200 text-left bg-slate-50 text-slate-600 font-bold uppercase tracking-tight text-[10px] whitespace-nowrap min-w-[120px]"
                        >
                          {hasAlias ? (
                            <div className="flex items-center gap-0.5">
                              <span className="text-slate-900 font-black">{parts[0]}</span>
                              <span className="text-slate-400">.</span>
                              <span className="text-slate-600 font-bold">{parts[1]}</span>
                            </div>
                          ) : (
                            displayName
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeResult.data.map((row: any[], idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="sticky left-0 px-3 py-2 border-r border-slate-100 bg-white group-hover:bg-blue-50/40 text-center text-slate-400 text-[10px] font-mono shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                        {idx + 1}
                      </td>
                      {row.map((cell: any, cIdx: number) => (
                        <td
                          key={cIdx}
                          className="px-4 py-2 border-r border-slate-100 truncate max-w-[400px] align-top"
                          title={String(cell)}
                        >
                          {cell === null ? (
                            <span className="text-slate-300 italic font-mono text-[11px]">NULL</span>
                          ) : typeof cell === "boolean" ? (
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                              cell ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                            )}>
                              {String(cell)}
                            </span>
                          ) : (
                            <span className="leading-relaxed">{String(cell)}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {activeResult.data.length === 0 && (
                    <tr>
                      <td
                        colSpan={activeResult.columns.length + 1}
                        className="p-12 text-center"
                      >
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <TableIcon size={32} />
                          <p className="text-sm font-medium italic">
                            No data returned for this query
                          </p>
                        </div>
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
