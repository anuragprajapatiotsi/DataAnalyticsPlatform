"use client";

import React from "react";
import { ChevronRight, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button, Skeleton, Empty, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { teamService } from "../services/team.service";

export function PoliciesList() {
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: () => teamService.getAvailablePolicies(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-slate-900 m-0">
          Policies
        </h2>
        <p className="text-[14px] text-slate-500 m-0">
          View and manage security policies for your organizational data.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
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
            {policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                  <Empty description="No policies found" />
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {policy.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3 text-slate-500">
                    {policy.description}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-right">
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "view",
                            label: "View Details",
                            icon: <ChevronRight className="h-4 w-4" />,
                          },
                        ],
                      }}
                      trigger={["click"]}
                    >
                      <Button
                        type="text"
                        icon={
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        }
                      />
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
