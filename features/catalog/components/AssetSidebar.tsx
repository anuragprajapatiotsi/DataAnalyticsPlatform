"use client";

import {
  Database,
  LayoutDashboard,
  GitBranch,
  Radar,
  Lightbulb,
  Box,
  Search,
  Cpu,
  HardDrive,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/utils/cn";

const assetTypes = [
  { label: "Databases", icon: Database },
  { label: "Dashboards", icon: LayoutDashboard },
  { label: "Pipelines", icon: GitBranch },
  { label: "Topics", icon: Radar },
  { label: "ML Models", icon: Lightbulb },
  { label: "Containers", icon: Box },
  { label: "Search Indexes", icon: Search },
  { label: "APIs", icon: Cpu },
  { label: "Drives", icon: HardDrive },
  { label: "Governance", icon: ShieldCheck },
  { label: "Domains", icon: Sparkles },
];

export function AssetSidebar() {
  const [activeItem, setActiveItem] = useState("Databases");

  return (
    <aside className="flex h-full w-[280px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300">
      <div className="p-4 border-b border-slate-100 shrink-0">
        <h2 className="text-base font-bold text-slate-800">Data Assets</h2>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-0.5 p-2 custom-scrollbar">
        {assetTypes.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-100 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600",
                )}
              />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight
                className={cn(
                  "h-3 w-3 opacity-0 transition-all",
                  isActive ? "opacity-40" : "group-hover:opacity-20",
                )}
              />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

