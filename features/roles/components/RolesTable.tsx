"use client";

import React from "react";
import Link from "next/link";
import { Edit2, Trash2, MoreVertical, Shield, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button, Dropdown, MenuProps, Popconfirm } from "antd";
import { Role } from "../types";

interface RolesTableProps {
  roles: Role[];
  isLoading: boolean;
  onEditClick: (role: Role) => void;
  onDeleteConfirm: (id: string) => void;
}

export function RolesTable({
  roles,
  isLoading,
  onEditClick,
  onDeleteConfirm,
}: RolesTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Policies</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-40 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <span className="font-medium text-[14px]">
                    Loading roles...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Shield className="h-10 w-10 opacity-20" />
                  <span className="font-medium">No roles found</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => {
              const menuItems: MenuProps["items"] = [
                {
                  key: "edit",
                  label: "Edit Role",
                  icon: <Edit2 size={14} />,
                  onClick: () => onEditClick(role),
                },
                {
                  key: "delete",
                  label: (
                    <Popconfirm
                      title="Delete Role"
                      description="Are you sure you want to delete this role?"
                      onConfirm={() => onDeleteConfirm(role.id)}
                      okText="Yes"
                      cancelText="No"
                      okType="danger"
                    >
                      <span className="text-red-600">Delete Role</span>
                    </Popconfirm>
                  ),
                  icon: <Trash2 size={14} className="text-red-600" />,
                  danger: true,
                },
              ];

              return (
                <TableRow key={role.id} className="group">
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 flex-shrink-0">
                        <Shield size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/settings/access-control/roles/${role.id}`}
                          className="font-semibold text-slate-900 text-[13px] truncate hover:text-blue-600 transition-colors"
                        >
                          {role.name}
                        </Link>
                        {role.is_system_role && (
                          <Badge
                            variant="outline"
                            className="w-fit h-4 text-[9px] uppercase tracking-tighter bg-blue-50 text-blue-600 border-blue-100"
                          >
                            System Role
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <p className="text-[13px] text-slate-600 m-0 line-clamp-2 leading-snug font-medium max-w-md">
                      {role.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {role.policies && role.policies.length > 0 ? (
                        <>
                          {role.policies.slice(0, 2).map((policy) => (
                            <Badge
                              key={policy.id}
                              variant="secondary"
                              className="bg-slate-100/80 text-slate-600 text-[11px] font-bold border-none py-0 px-2 rounded-md"
                            >
                              {policy.name}
                            </Badge>
                          ))}
                          {role.policies.length > 2 && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-50/50 text-blue-600 text-[11px] font-bold border-none py-0 px-2 rounded-md"
                            >
                              +{role.policies.length - 2} more
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 text-[12px] italic">
                          No policies attached
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {!role.is_system_role && (
                      <Dropdown
                        menu={{ items: menuItems }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          icon={
                            <MoreVertical
                              size={16}
                              className="text-slate-400"
                            />
                          }
                          className="hover:bg-slate-100 rounded-lg h-8 w-8 flex items-center justify-center p-0 ml-auto"
                        />
                      </Dropdown>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
