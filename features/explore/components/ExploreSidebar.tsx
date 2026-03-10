"use client";

import React, { useState } from "react";
import {
  Database,
  Cpu,
  MessageSquare,
  LayoutDashboard,
  GitBranch,
  Zap,
  HardDrive,
  Search,
  ChevronDown,
  ChevronRight,
  Library,
  Terminal,
  Files as FilesIcon,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

const ASSET_CATEGORIES = [
  { id: "database", label: "Database", icon: Database },
  { id: "api", label: "API", icon: Cpu },
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "dashboards", label: "Dashboards", icon: LayoutDashboard },
  { id: "pipelines", label: "Pipelines", icon: GitBranch },
  { id: "ml-models", label: "ML Models", icon: Zap },
  { id: "storages", label: "Storages", icon: HardDrive },
  { id: "metadata", label: "Metadata", icon: Search },
];

export type ExploreView = "catalog" | "sql-editor" | "files";

interface ExploreSidebarProps {
  activeView: ExploreView;
  activeCategory: string;
  onViewChange: (view: ExploreView) => void;
  onCategoryChange: (categoryId: string) => void;
}

export function ExploreSidebar({
  activeView,
  activeCategory,
  onViewChange,
  onCategoryChange,
}: ExploreSidebarProps) {
  const [catalogExpanded, setCatalogExpanded] = useState(true);

  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-slate-200 px-4 py-6 flex flex-col h-full bg-white transition-all duration-300">
      <nav className="flex flex-col gap-1.5">
        {/* Catalog Section */}
        <div className="flex flex-col">
          <button
            onClick={() => {
              onViewChange("catalog");
              setCatalogExpanded(!catalogExpanded);
            }}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeView === "catalog"
                ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/30"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Library
              size={18}
              className={
                activeView === "catalog" ? "text-blue-600" : "text-slate-400"
              }
            />
            <span className="flex-1 text-left">Catalog</span>
            {catalogExpanded ? (
              <ChevronDown size={14} className="text-slate-400" />
            ) : (
              <ChevronRight size={14} className="text-slate-400" />
            )}
          </button>

          {/* Nested Assets Menu */}
          {catalogExpanded && (
            <div className="flex flex-col gap-0.5 mt-1 ml-4 pl-3 border-l-2 border-slate-100">
              {ASSET_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive =
                  activeView === "catalog" && activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      onViewChange("catalog");
                      onCategoryChange(category.id);
                    }}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "text-blue-600 font-bold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
                    )}
                  >
                    <Icon
                      size={15}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-600",
                      )}
                    />
                    {category.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SQL Editor */}
        <button
          onClick={() => onViewChange("sql-editor")}
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeView === "sql-editor"
              ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/30"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Terminal
            size={18}
            className={
              activeView === "sql-editor" ? "text-blue-600" : "text-slate-400"
            }
          />
          SQL Editor
        </button>

        {/* Files */}
        <button
          onClick={() => onViewChange("files")}
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeView === "files"
              ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/30"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <FilesIcon
            size={18}
            className={
              activeView === "files" ? "text-blue-600" : "text-slate-400"
            }
          />
          Files
        </button>
      </nav>
    </aside>
  );
}
