"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { Users, Shield, FileText } from "lucide-react";

interface TeamsTabsProps {
  isAdmin: boolean;
}

export function TeamsTabs({ isAdmin }: TeamsTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "teams",
      label: "Teams",
      href: "/settings/organization-team-user-management/teams",
      icon: Users,
    },
    ...(isAdmin
      ? [
          {
            id: "roles",
            label: "Roles",
            href: "/settings/organization-team-user-management/teams/roles",
            icon: Shield,
          },
          {
            id: "policies",
            label: "Policies",
            href: "/settings/organization-team-user-management/teams/policies",
            icon: FileText,
          },
        ]
      : []),
  ];

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 mb-8">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-[14px] font-semibold transition-all duration-200 border-b-2 -mb-[2px]",
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
          </Link>
        );
      })}
    </div>
  );
}
