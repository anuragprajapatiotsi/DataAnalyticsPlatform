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
  Files as FilesIcon,
  Globe,
  TrendingUp,
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

export type ExploreView =
  | "catalog"
  | "data"
  | "database"
  | "api"
  | "messaging"
  | "dashboards"
  | "pipelines"
  | "ml-models"
  | "storages"
  | "metadata"
  | "kpis"
  | "drives"
  | "ftp-servers"
  | "files";

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
      <nav className="flex flex-col gap-1.5 overflow-y-auto pr-2 custom-scrollbar h-full">
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
            <div className="flex flex-col gap-0.5 mt-1 ml-3 px-1">
              <button
                onClick={() => onViewChange("data")}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                  activeView === "data"
                    ? "text-blue-600 font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-400" />
                Data
              </button>
            </div>
          )}
        </div>

        {/* Root Level Asset Menu */}
        {ASSET_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeView === category.id;

          return (
            <button
              key={category.id}
              onClick={() => {
                onViewChange(category.id as ExploreView);
              }}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400",
                )}
              />
              {category.label}
            </button>
          );
        })}

        {/* KPIs */}
        <button
          onClick={() => onViewChange("kpis")}
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeView === "kpis"
              ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/30"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <TrendingUp
            size={18}
            className={
              activeView === "kpis" ? "text-blue-600" : "text-slate-400"
            }
          />
          KPIs
        </button>

        {/* Drives */}
        <button
          onClick={() => onViewChange("drives")}
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeView === "drives"
              ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/30"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <HardDrive
            size={18}
            className={
              activeView === "drives" ? "text-blue-600" : "text-slate-400"
            }
          />
          Drives
        </button>

        {/* FTP Servers */}
        <button
          onClick={() => onViewChange("ftp-servers")}
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeView === "ftp-servers"
              ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/30"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Globe
            size={18}
            className={
              activeView === "ftp-servers" ? "text-blue-600" : "text-slate-400"
            }
          />
          FTP Servers
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
