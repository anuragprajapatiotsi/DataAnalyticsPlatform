"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Trash2, User as UserIcon, MoreVertical, Edit2 } from "lucide-react";
import Link from "next/link";
import { AdminUser } from "../types";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Dropdown, MenuProps, Popconfirm, message, Popover } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      message.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      message.error("Failed to delete user");
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(5)].map((_, j) => (
                  <TableCell
                    key={j}
                    className={j === 0 ? "pl-6" : j === 4 ? "pr-8" : ""}
                  >
                    <Skeleton className="h-5 w-full opacity-60" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 shadow-sm border-dashed">
        <div className="bg-slate-50 p-3 rounded-full mb-3">
          <UserIcon size={24} className="text-slate-300" />
        </div>
        <h3 className="text-[14px] font-semibold text-slate-900 m-0">
          No users found
        </h3>
        <p className="text-[13px] text-slate-500 m-0 mt-1 font-medium text-center max-w-[300px]">
          We couldn't find any users matching your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="group">
              <TableCell className="px-4 py-2">
                <div className="flex items-center gap-3 font-medium">
                  <Avatar className="h-8 w-8 border border-slate-100 shrink-0">
                    <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-[11px]">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/settings/organization-team-user-management/users/${user.id}`}
                    className="group-hover:text-blue-600 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-[14px] text-slate-900 font-bold leading-tight">
                        {user.username}
                      </span>
                    </div>
                  </Link>
                </div>
              </TableCell>
              <TableCell className="px-4 py-2">
                <Link
                  href={`/settings/organization-team-user-management/users/${user.id}`}
                  className="group-hover:text-blue-600"
                >
                  <span className="text-[14px] text-slate-500 font-bold italic">
                    {user.display_name}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {user.teams.length > 0 ? (
                    <>
                      <span className="text-[12px] text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 shadow-sm">
                        {user.teams[0].display_name || user.teams[0].name}
                      </span>
                      {user.teams.length > 1 && (
                        <Popover
                          title={
                            <div className="border-b border-slate-100 pb-2 mb-2 font-bold text-slate-900">
                              Teams
                            </div>
                          }
                          content={
                            <div className="flex flex-col gap-1.5 min-w-[150px] p-0.5">
                              {user.teams.map((team) => (
                                <Link
                                  key={team.id}
                                  href={`/settings/organization-team-user-management/teams/${team.id}`}
                                  className="text-[13px] text-slate-600 font-semibold hover:text-blue-600 hover:bg-slate-50 px-2 py-1 rounded transition-all"
                                >
                                  {team.display_name || team.name}
                                </Link>
                              ))}
                            </div>
                          }
                          trigger="click"
                          placement="bottomLeft"
                        >
                          <span className="text-blue-600 cursor-pointer text-xs font-bold hover:underline transition-all flex items-center gap-0.5 ml-1">
                            +{user.teams.length - 1}
                          </span>
                        </Popover>
                      )}
                    </>
                  ) : (
                    <span className="text-[12px] text-slate-300 font-medium italic">
                      —
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {user.roles.length > 0 ? (
                    <>
                      <Link
                        href={`/settings/access-control/roles/${user.roles[0].id}`}
                        className="text-[12px] text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all"
                      >
                        {user.roles[0].display_name || user.roles[0].name}
                      </Link>
                      {user.roles.length > 1 && (
                        <Popover
                          title={
                            <div className="border-b border-slate-100 pb-2 mb-2 font-bold text-slate-900">
                              Roles
                            </div>
                          }
                          content={
                            <div className="flex flex-col gap-1.5 min-w-[150px] p-0.5">
                              {user.roles.map((role) => (
                                <Link
                                  key={role.id}
                                  href={`/settings/access-control/roles/${role.id}`}
                                  className="text-[13px] text-slate-600 font-semibold hover:text-blue-600 hover:bg-slate-50 px-2 py-1 rounded transition-all"
                                >
                                  {role.display_name || role.name}
                                </Link>
                              ))}
                            </div>
                          }
                          trigger="click"
                          placement="bottomLeft"
                        >
                          <span className="text-blue-600 cursor-pointer text-xs font-bold hover:underline transition-all flex items-center gap-0.5 ml-1">
                            +{user.roles.length - 1}
                          </span>
                        </Popover>
                      )}
                    </>
                  ) : (
                    <span className="text-[12px] text-slate-300 font-medium italic">
                      —
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "edit",
                        label: (
                          <Link
                            href={`/settings/organization-team-user-management/users/${user.id}/edit`}
                            className="flex items-center gap-2 px-1"
                          >
                            <Edit2 size={14} />
                            <span>Edit User</span>
                          </Link>
                        ),
                      },
                      {
                        type: "divider",
                      },
                      {
                        key: "delete",
                        danger: true,
                        label: (
                          <Popconfirm
                            title="Delete User"
                            description="Are you sure you want to delete this user? This action cannot be undone."
                            onConfirm={() => deleteMutation.mutate(user.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{
                              danger: true,
                              loading: deleteMutation.isPending,
                            }}
                          >
                            <div
                              className="flex items-center gap-2 px-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 size={14} />
                              <span>Delete User</span>
                            </div>
                          </Popconfirm>
                        ),
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <button className="text-slate-400 hover:text-slate-600 transition-all h-8 w-8 hover:bg-slate-100 rounded-lg flex items-center justify-center p-0 ml-auto">
                    <MoreVertical size={16} />
                  </button>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
