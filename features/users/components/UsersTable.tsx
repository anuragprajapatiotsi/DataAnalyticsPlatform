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
import { Trash2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { AdminUser } from "../types";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] text-[13px] font-semibold text-slate-600 px-4">
                Username
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 px-4">
                Name
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 px-4">
                Teams
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 px-4">
                Roles
              </TableHead>
              <TableHead className="text-right text-[13px] font-semibold text-slate-600 px-4">
                Actions
              </TableHead>
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
        <h3 className="text-[15px] font-semibold text-slate-900 m-0">
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
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-[300px] text-[13px] font-semibold text-slate-600 px-4">
              Username
            </TableHead>
            <TableHead className="text-[13px] font-semibold text-slate-600 px-4">
              Name
            </TableHead>
            <TableHead className="text-[13px] font-semibold text-slate-600 px-4">
              Teams
            </TableHead>
            <TableHead className="text-[13px] font-semibold text-slate-600 px-4">
              Roles
            </TableHead>
            <TableHead className="text-right text-[13px] font-semibold text-slate-600 px-4">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="hover:bg-slate-50/50 transition-colors group h-12"
            >
              <TableCell className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-slate-100">
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-semibold text-[11px]">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">
                    {user.username}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-2">
                <span className="text-[13px] text-slate-500 font-medium italic">
                  {user.display_name}
                </span>
              </TableCell>
              <TableCell className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {user.teams.length > 0 ? (
                    <>
                      <span className="text-[11px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                        {user.teams[0].display_name || user.teams[0].name}
                      </span>
                      {user.teams.length > 1 && (
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                          +{user.teams.length - 1} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[12px] text-slate-300 font-medium italic">
                      No teams
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-2">
                <div className="flex flex-wrap gap-2">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Link
                        key={role.id}
                        href={`/settings/access-control/roles/${role.id}`}
                        className="text-[12px] text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all"
                      >
                        {role.display_name || role.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-[12px] text-slate-300 font-medium italic">
                      No roles
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-2 text-right">
                <button className="text-slate-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
