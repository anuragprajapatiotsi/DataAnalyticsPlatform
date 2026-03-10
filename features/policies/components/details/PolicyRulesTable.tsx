"use client";

import React from "react";
import { Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { PolicyRule } from "../../types";

interface PolicyRulesTableProps {
  ruleName?: string;
  resource?: string;
  operations?: string[];
  isLoading: boolean;
}

export function PolicyRulesTable({
  ruleName,
  resource,
  operations,
  isLoading,
}: PolicyRulesTableProps) {
  const hasRule = ruleName || resource || (operations && operations.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-semibold text-slate-900 m-0 leading-tight">
          Policy Rules
        </h3>
        <p className="text-[13px] text-slate-500 font-medium m-0">
          Review the rules and operations defined for this policy.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Operations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span className="font-medium">Loading rules...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !hasRule ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Shield className="h-10 w-10 opacity-20" />
                    <span className="font-medium text-[14px]">
                      No rules defined
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="group h-12">
                <TableCell className="px-4 py-2">
                  <span className="font-semibold text-slate-900 text-[14px]">
                    {ruleName || "--"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-2">
                  <span className="text-[14px] text-slate-600 font-medium font-mono">
                    {resource || "--"}
                  </span>
                </TableCell>
                <TableCell className="px-8 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {operations && operations.length > 0 ? (
                      operations.map((op) => (
                        <span
                          key={op}
                          className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-semibold border border-blue-100 uppercase tracking-tight"
                        >
                          {op}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
