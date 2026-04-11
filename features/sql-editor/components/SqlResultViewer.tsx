"use client";

import React from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Table as TableIcon,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
import type { QueryResultState } from "../hooks/useSqlEditor";

type SqlResultViewerProps = {
  result: QueryResultState;
  catalog?: string;
  schema?: string;
  onCancel?: () => void;
  onGoToPage?: (page: number) => void;
  onUpdatePageSize?: (pageSize: number) => void;
  onDismissError?: () => void;
};

export function SqlResultViewer({
  result,
  catalog,
  schema,
  onCancel,
  onGoToPage,
  onUpdatePageSize,
  onDismissError,
}: SqlResultViewerProps) {
  if (result.status === "loading") {
    return (
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
            Fetching results from {catalog || "iceberg"}.{schema || "catalog_views"}
          </p>
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              className="mt-6 h-8 text-[11px] font-bold border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
              onClick={onCancel}
            >
              Cancel Execution
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-100/50">
          <AlertCircle size={32} />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-2 tracking-tight">
          Execution Failed
        </h4>
        <div className="max-w-lg mb-6 p-4 bg-white border border-red-100 rounded-xl shadow-sm text-left">
          <p className="text-xs font-mono text-red-600 leading-relaxed break-all">
            {result.error || "An unknown technical error occurred during query execution."}
          </p>
        </div>
        {onDismissError && (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="default"
              className="h-9 font-bold text-xs px-6 bg-slate-900 hover:bg-slate-800 shadow-sm"
              onClick={onDismissError}
            >
              Dismiss Error
            </Button>
          </div>
        )}
      </div>
    );
  }

  const showingFrom = result.pagination.current * result.pagination.pageSize + 1;
  const showingTo =
    result.pagination.current * result.pagination.pageSize + result.data.length;
  const canGoPrevious = result.pagination.current > 0 && Boolean(onGoToPage);
  const canGoNext =
    Boolean(onGoToPage) &&
    (result.totalCount !== undefined
      ? result.pagination.current <
        Math.ceil(result.totalCount / result.pagination.pageSize) - 1
      : result.data.length >= result.pagination.pageSize);

  return (
    <>
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-5 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
            <Database size={13} className="text-blue-500/70" />
            <span className="text-slate-700">
              Showing <span className="font-bold text-slate-900">{showingFrom}</span>
              {" - "}
              <span className="font-bold text-slate-900">{showingTo}</span>
              {" "}of{" "}
              <span className="font-bold text-slate-900">
                {result.totalCount !== undefined ? result.totalCount : "?"}
              </span>{" "}
              rows
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
            <Clock size={13} className="text-amber-500/70" />
            <span className="text-slate-700 font-bold">{result.executionTime}ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onUpdatePageSize && (
            <div className="flex items-center gap-2 mr-6 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Rows per page
              </p>
              <select
                className="text-[11px] bg-transparent border-none font-black text-slate-900 cursor-pointer focus:ring-0 p-0 h-auto"
                value={result.pagination.pageSize}
                onChange={(event) => onUpdatePageSize(Number(event.target.value))}
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
              </select>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-slate-100 hover:text-slate-900 text-slate-500 transition-all disabled:opacity-20 border border-transparent hover:border-slate-200"
              disabled={!canGoPrevious}
              onClick={() => onGoToPage?.(result.pagination.current - 1)}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center justify-center min-w-[80px] h-8 bg-slate-900 rounded-xl text-white shadow-sm ring-1 ring-slate-900/10">
              <span className="text-[11px] font-black tracking-tight">
                Page {result.pagination.current + 1}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-slate-100 hover:text-slate-900 text-slate-500 transition-all disabled:opacity-20 border border-transparent hover:border-slate-200"
              disabled={!canGoNext}
              onClick={() => onGoToPage?.(result.pagination.current + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative bg-white">
        <table className="w-max min-w-full border-collapse text-[13px] text-slate-700 table-auto">
          <thead className="sticky top-0 bg-slate-50 shadow-[0_1px_0_rgba(0,0,0,0.05)] z-10">
            <tr>
              <th className="sticky left-0 z-20 w-12 px-3 py-2.5 border-b border-r border-slate-200 bg-slate-50 text-slate-400 font-medium text-[10px] text-center shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                #
              </th>
              {result.columns.map((col) => {
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
            {result.data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                <td className="sticky left-0 px-3 py-2 border-r border-slate-100 bg-white group-hover:bg-blue-50/40 text-center text-slate-400 text-[10px] font-mono shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                  {idx + 1}
                </td>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 border-r border-slate-100 truncate max-w-[400px] align-top"
                    title={String(cell)}
                  >
                    {cell === null ? (
                      <span className="text-slate-300 italic font-mono text-[11px]">
                        NULL
                      </span>
                    ) : typeof cell === "boolean" ? (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                          cell
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-rose-700 bg-rose-50",
                        )}
                      >
                        {String(cell)}
                      </span>
                    ) : (
                      <span className="leading-relaxed">{String(cell)}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {result.data.length === 0 && (
              <tr>
                <td
                  colSpan={result.columns.length + 1}
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
  );
}
