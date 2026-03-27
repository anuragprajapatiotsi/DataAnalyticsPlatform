"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  { id: "database", label: "Database Services", icon: Database },
  { id: "api", label: "API", icon: Cpu },
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "dashboards", label: "Dashboards", icon: LayoutDashboard },
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
  const router = useRouter();
  const [catalogExpanded, setCatalogExpanded] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);

  const handleCategoryClick = (id: string) => {
    // Map sidebar IDs to service_type route parameters
    const typeMap: Record<string, string> = {
      database: "databases",
      api: "apis",
      storages: "storages",
      drives: "drive",
    };
    const serviceType = typeMap[id] || id;
    router.push(`/explore/${serviceType}`);
  };

  return (
    <aside className="w-[200px] flex-shrink-0 border-r border-slate-200 px-4 py-2  flex flex-col h-full bg-white transition-all duration-300">
      <nav className="flex flex-col gap-1.5 overflow-y-auto pr-2 no-scrollbar h-full">
        {/* Catalog Section */}
        <div className="flex flex-col">
          <button
            onClick={() => setCatalogExpanded(!catalogExpanded)}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeView === "catalog" || activeView === "data"
                ? "bg-blue-50/50 text-blue-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Library
              size={18}
              className={
                activeView === "catalog" || activeView === "data" ? "text-blue-600" : "text-slate-400"
              }
            />
            <span className="flex-1 text-left">Catalog</span>
            {catalogExpanded ? (
              <ChevronDown size={14} className="text-slate-400" />
            ) : (
              <ChevronRight size={14} className="text-slate-400" />
            )}
          </button>

          {/* Nested Catalog Menu */}
          {catalogExpanded && (
            <div className="flex flex-col gap-0.5 mt-1 ml-3 pl-2 border-l border-slate-100 px-1">
              <button
                onClick={() => onViewChange("data")}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                  activeView === "data"
                    ? "text-blue-600 font-bold bg-blue-50/30"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  activeView === "data" ? "bg-blue-600" : "bg-slate-300 group-hover:bg-blue-400"
                )} />
                Data
              </button>
            </div>
          )}
        </div>

        {/* Sources Section */}
        <div className="flex flex-col mt-1">
          <button
            onClick={() => setSourcesExpanded(!sourcesExpanded)}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeView === "drives" || activeView === "ftp-servers" || ASSET_CATEGORIES.some(c => c.id === activeView)
                ? "bg-blue-50/50 text-blue-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Zap
              size={18}
              className={
                activeView === "drives" || activeView === "ftp-servers" || ASSET_CATEGORIES.some(c => c.id === activeView) ? "text-blue-600" : "text-slate-400"
              }
            />
            <span className="flex-1 text-left">Sources</span>
            {sourcesExpanded ? (
              <ChevronDown size={14} className="text-slate-400" />
            ) : (
              <ChevronRight size={14} className="text-slate-400" />
            )}
          </button>

          {/* Nested Sources Menu */}
          {sourcesExpanded && (
            <div className="flex flex-col gap-0.5 mt-1 ml-3 pl-2 border-l border-slate-100 px-1">
              {ASSET_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = activeView === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "text-blue-600 font-bold bg-blue-50/30"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
                    )}
                  >
                    <Icon
                      size={14}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-blue-600" : "text-slate-400",
                      )}
                    />
                    {category.label}
                  </button>
                );
              })}

              {/* Drives */}
              <button
                onClick={() => onViewChange("drives")}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                  activeView === "drives"
                    ? "text-blue-600 font-bold bg-blue-50/30"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
                )}
              >
                <HardDrive
                  size={14}
                  className={cn(
                    "transition-colors",
                    activeView === "drives" ? "text-blue-600" : "text-slate-400",
                  )}
                />
                Drives
              </button>

              {/* FTP Servers */}
              <button
                onClick={() => onViewChange("ftp-servers")}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                  activeView === "ftp-servers"
                    ? "text-blue-600 font-bold bg-blue-50/30"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
                )}
              >
                <Globe
                  size={14}
                  className={cn(
                    "transition-colors",
                    activeView === "ftp-servers" ? "text-blue-600" : "text-slate-400",
                  )}
                />
                FTP Servers
              </button>
            </div>
          )}
        </div>

        {/* Pipelines */}
        <button
          onClick={() => onViewChange("pipelines")}
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeView === "pipelines"
              ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/30"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <GitBranch
            size={18}
            className={
              activeView === "pipelines" ? "text-blue-600" : "text-slate-400"
            }
          />
          Pipelines
        </button>

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
