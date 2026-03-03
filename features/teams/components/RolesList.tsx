"use client";

import React from "react";
import { Shield, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { useQuery } from "@tanstack/react-query";
import { teamService } from "../services/team.service";
import { Skeleton, Empty } from "antd";

export function RolesList() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => teamService.getAvailableRoles(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-slate-900 m-0">Roles</h2>
        <p className="text-[14px] text-slate-500 m-0">
          Define and manage access roles for your teams.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[200px] text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Role Name
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
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                  <Empty description="No roles found" />
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-slate-800">
                        {role.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-500">
                    {role.description}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Lock className="h-4 w-4 text-slate-300 ml-auto" />
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

