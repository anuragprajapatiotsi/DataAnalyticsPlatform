"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { SchemaExplorer } from "@/features/sql-editor/components/SchemaExplorer";
import { SqlEditorProvider } from "@/features/sql-editor/contexts/SqlEditorContext";
import { cn } from "@/shared/utils/cn";

const STORAGE_KEY = "sql_editor_sidebar_width";
const MIN_WIDTH = 220;
const MAX_WIDTH = 450;
const DEFAULT_WIDTH = 280;

export default function SqlEditorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (!isNaN(width)) {
        setSidebarWidth(Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH));
      }
    }
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
          setSidebarWidth(newWidth);
          localStorage.setItem(STORAGE_KEY, newWidth.toString());
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      // Disable text selection during resize
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <SqlEditorProvider>
      <div className="h-full w-full flex bg-slate-50 overflow-hidden relative">
        {/* Left Sidebar */}
        <div 
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px` }}
          className="h-full bg-white border-r border-slate-200 flex flex-col shrink-0 relative overflow-hidden"
        >
          <SchemaExplorer />
        </div>

        {/* Resizer Divider */}
        <div
          onMouseDown={startResizing}
          className={cn(
            "w-1 h-full cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 transition-colors z-50 relative shrink-0",
            isResizing && "bg-blue-600 w-[2px]"
          )}
        >
          {/* Invisible hit area expansion */}
          <div className="absolute inset-y-0 -inset-x-2 z-10" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-white">
          {children}
        </div>
      </div>
    </SqlEditorProvider>
  );
}
