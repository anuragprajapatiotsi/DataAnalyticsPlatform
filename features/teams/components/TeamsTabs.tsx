"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { Users, Shield, FileText } from "lucide-react";

export type TeamManagementTab = "teams" | "roles" | "policies";

interface TeamsTabsProps {
  activeTab: TeamManagementTab;
  onTabChange: (tab: TeamManagementTab) => void;
  isAdmin: boolean;
}

export function TeamsTabs({ activeTab, onTabChange, isAdmin }: TeamsTabsProps) {
  const tabs = [
    {
      id: "teams" as TeamManagementTab,
      label: "Teams",
      icon: Users,
    },
    ...(isAdmin
      ? [
          {
            id: "roles" as TeamManagementTab,
            label: "Roles",
            icon: Shield,
          },
          {
            id: "policies" as TeamManagementTab,
            label: "Policies",
            icon: FileText,
          },
        ]
      : []),
  ];

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 mb-8">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-[14px] font-semibold transition-all duration-200 border-b-2 -mb-[2px] outline-none",
              isActive
                ? "border-blue-600 text-blue-600 bg-blue-50/30"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                isActive ? "text-blue-600" : "text-slate-400",
              )}
            />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
