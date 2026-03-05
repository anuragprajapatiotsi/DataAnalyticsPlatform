"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "antd";
import { PolicyRole } from "../../types";

interface PolicyRolesTableProps {
  roles: PolicyRole[];
  isLoading: boolean;
}

export function PolicyRolesTable({ roles, isLoading }: PolicyRolesTableProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-semibold text-slate-900 m-0 leading-tight">
          Associated Roles
        </h3>
        <p className="text-[13px] text-slate-500 font-medium m-0">
          List of roles that incorporate this security policy.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span className="font-medium">Loading roles...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !roles || roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <ShieldCheck className="h-10 w-10 opacity-20" />
                    <span className="font-medium text-[14px]">
                      No roles associated
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id} className="group h-12">
                  <TableCell className="px-4 py-2">
                    <Link
                      href={`/settings/access-control/roles/${role.id}`}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold text-[13px] transition-colors"
                    >
                      {role.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <p className="text-[13px] text-slate-600 m-0 line-clamp-1 max-w-md font-medium">
                      {role.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={16} />}
                      className="hover:bg-slate-100 rounded-lg flex items-center justify-center ml-auto h-8 w-8 p-0"
                    />
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
