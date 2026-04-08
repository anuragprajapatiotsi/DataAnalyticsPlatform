"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import {
  ExploreSidebar,
  type ExploreView,
} from "@/features/explore/components/ExploreSidebar";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Resizer Constants
  const minWidth = 220;
  const maxWidth = 800;
  const defaultWidth = 220;

  // Resizing state
  const [sidebarWidth, setSidebarWidth] = React.useState(defaultWidth);
  const [isResizing, setIsResizing] = React.useState(false);

  // Load width from localStorage on mount
  React.useEffect(() => {
    const savedWidth = localStorage.getItem("explore_sidebar_width");
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10);
      if (!isNaN(parsedWidth)) {
        setSidebarWidth(Math.min(Math.max(parsedWidth, minWidth), maxWidth));
      }
    }
  }, []);

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
    localStorage.setItem("explore_sidebar_width", sidebarWidth.toString());
  }, [sidebarWidth]);

  const resize = React.useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        let newWidth = e.clientX;
        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // Determine active view from pathname
  const getActiveView = (): ExploreView => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 2) return "catalog";

    const viewSlug = segments[1];
    const viewMap: Record<string, ExploreView> = {
      pipelines: "pipelines",
      kpis: "kpis",
      files: "files",
      databases: "database",
      apis: "api",
      storages: "storages",
      messaging: "messaging",
      dashboards: "dashboards",
      "ml-models": "ml-models",
      metadata: "metadata",
      "object-resources": "object-resources",
      "data-assets": "data-assets",
      drives: "drives",
      "ftp-servers": "ftp-servers",
      drive: "drives",
    };

    return viewMap[viewSlug] || "catalog";
  };

  const activeView = getActiveView();
  const [activeCategory, setActiveCategory] = React.useState("database");

  const handleViewChange = (view: ExploreView) => {
    const routeMap: Record<string, string> = {
      database: "databases",
      api: "apis",
      pipelines: "pipelines",
      kpis: "kpis",
      files: "files",
      "object-resources": "object-resources",
      "data-assets": "data-assets",
      catalog: "",
    };
    const route = routeMap[view] || view;
    router.push(`/explore/${route}`);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-700 overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar Wrapper with dynamic width and no-latency drag */}
        <div
          className={cn(
            "relative flex-shrink-0 bg-white border-r border-slate-200",
            !isResizing && "transition-all duration-300 ease-in-out"
          )}
          style={{ width: `${sidebarWidth}px` }}
        >
          <ExploreSidebar
            activeView={activeView}
            activeCategory={activeCategory}
            onViewChange={handleViewChange}
            onCategoryChange={setActiveCategory}
          />

          {/* Professional Draggable Divider */}
          <div
            className={cn(
              "absolute top-0 -right-[2px] w-[4px] h-full cursor-col-resize z-50 group",
              "hover:bg-blue-400/20 active:bg-blue-500/40 transition-colors duration-150",
              isResizing && "bg-blue-500/30"
            )}
            onMouseDown={startResizing}
          >
            {/* The visible line */}
            <div
              className={cn(
                "absolute top-0 right-[1px] w-[1px] h-full bg-slate-200",
                "group-hover:bg-blue-400 group-active:bg-blue-600 transition-all duration-150",
                isResizing && "bg-blue-600 w-[2px]"
              )}
            />
          </div>
        </div>

        {/* Dynamic Content Area - Centered Relative to Space */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-white overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
