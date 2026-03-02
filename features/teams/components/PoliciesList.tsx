"use client";

import React from "react";
import { FileText, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "antd";

export function PoliciesList() {
  const policies = [
    {
      id: "1",
      name: "OrganizationPolicy",
      description: "Standard policy for all organization members.",
    },
    {
      id: "2",
      name: "TeamPolicy",
      description: "Default policy for new teams.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-slate-900 m-0">
          Policies
        </h2>
        <p className="text-[14px] text-slate-500 m-0">
          View and manage security policies for your organizational data.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[200px] text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Policy Name
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
            {policies.map((policy) => (
              <TableRow key={policy.id} className="hover:bg-slate-50/50">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-slate-800">
                      {policy.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-slate-500">
                  {policy.description}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button
                    type="text"
                    icon={<MoreHorizontal className="h-4 w-4 text-slate-400" />}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
