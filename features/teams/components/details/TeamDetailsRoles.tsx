"use client";

import React from "react";
import {
  Shield,
  Plus,
  Trash2,
  MoreVertical,
  Lock,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, Empty, Badge, Popconfirm, Tooltip } from "antd";
import type { Role } from "../../types";

interface TeamDetailsRolesProps {
  roles: Role[];
  isAdmin: boolean;
  onAssignRole: () => void;
  onRemoveRole: (id: string) => void;
  isLoading?: boolean;
}

export function TeamDetailsRoles({
  roles,
  isAdmin,
  onAssignRole,
  onRemoveRole,
  isLoading,
}: TeamDetailsRolesProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-slate-900 m-0">Roles</h2>
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={onAssignRole}
            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-semibold shadow-sm flex items-center gap-2"
          >
            Assign Role
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                Role Name
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                Description
              </TableHead>
              <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-32 text-center text-slate-500"
                >
                  Loading roles...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-medium">
                          No roles assigned to this team
                        </span>
                        <span className="text-slate-400 text-[13px]">
                          Assign roles to define what this team can do.
                        </span>
                      </div>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow
                  key={role.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="font-bold text-slate-900 text-[14px]">
                        {role.display_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-500 text-[14px]">
                    {role.description || "No description provided."}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip title="View Permissions">
                        <Button
                          type="text"
                          icon={
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          }
                        />
                      </Tooltip>
                      {isAdmin && (
                        <Popconfirm
                          title="Remove Role"
                          description="Are you sure you want to remove this role from the team?"
                          onConfirm={() => onRemoveRole(role.id)}
                          okType="danger"
                          okText="Remove"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 className="h-4 w-4" />}
                          />
                        </Popconfirm>
                      )}
                    </div>
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
