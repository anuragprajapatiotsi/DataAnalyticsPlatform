"use client";

import React, { useState } from "react";
import { Search, MinusCircle } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { TeamsEmptyState } from "./TeamsEmptyState";
import { cn } from "@/shared/utils/cn";

type SubTab = "teams" | "roles" | "policies";

interface Policy {
  id: string;
  name: string;
  description: string;
}

const mockPolicies: Policy[] = [
  {
    id: "1",
    name: "Organization Policy",
    description: "Policy for all the users of an organization.",
  },
];

export function TeamsSubGroupContent() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("policies");

  const tabs = [
    { id: "teams", label: "Teams", count: 0 },
    { id: "roles", label: "Roles", count: 1 },
    { id: "policies", label: "Policies", count: 1 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="flex items-center px-6 py-2 border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors",
                activeSubTab === tab.id
                  ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {tab.label}
              <Badge
                variant={activeSubTab === tab.id ? "primary" : "default"}
                className="ml-1"
              >
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeSubTab === "teams" && <TeamsEmptyState />}
          {activeSubTab === "roles" && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 border-dashed border-2 border-slate-200 rounded-xl">
              <span className="text-slate-500 font-medium">
                Roles section coming soon...
              </span>
            </div>
          )}
          {activeSubTab === "policies" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search for policy..."
                    className="w-[320px] h-10 pl-10 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                        Name
                      </TableHead>
                      <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                        Description
                      </TableHead>
                      <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPolicies.map((policy) => (
                      <TableRow
                        key={policy.id}
                        className="hover:bg-slate-50/30"
                      >
                        <TableCell className="px-6 py-4">
                          <span className="text-[14px] text-blue-600 font-semibold cursor-pointer hover:underline">
                            {policy.name}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-[14px] text-slate-600 font-medium leading-relaxed">
                            {policy.description}
                          </span>
                        </TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <button className="text-slate-300 hover:text-red-500 transition-colors">
                            <MinusCircle className="h-5 w-5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

