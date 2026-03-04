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
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] text-[12px] font-bold text-slate-400 uppercase tracking-wider pl-6">
                Username
              </TableHead>
              <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                Name
              </TableHead>
              <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                Teams
              </TableHead>
              <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                Roles
              </TableHead>
              <TableHead className="text-right text-[12px] font-bold text-slate-400 uppercase tracking-wider pr-8">
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
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-200 shadow-sm border-dashed">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <UserIcon className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-900 m-0">
          No users found
        </h3>
        <p className="text-[14px] text-slate-500 m-0 mt-1 font-medium text-center max-w-[300px]">
          We couldn't find any users matching your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-[300px] text-[12px] font-bold text-slate-500 uppercase tracking-wider pl-6">
              Username
            </TableHead>
            <TableHead className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
              Name
            </TableHead>
            <TableHead className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
              Teams
            </TableHead>
            <TableHead className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
              Roles
            </TableHead>
            <TableHead className="text-right text-[12px] font-bold text-slate-500 uppercase tracking-wider pr-8">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="hover:bg-slate-50/30 transition-all group border-b border-slate-100 last:border-0"
            >
              <TableCell className="pl-6 h-[64px]">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-[12px]">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] text-slate-900 font-bold group-hover:text-blue-600 transition-colors">
                    {user.username}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-[13px] text-slate-600 font-semibold italic">
                  {user.display_name}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.teams.length > 0 ? (
                    <>
                      <span className="text-[12px] text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
                        {user.teams[0].display_name || user.teams[0].name}
                      </span>
                      {user.teams.length > 1 && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
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
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Link
                        key={role.id}
                        href={`/settings/access-control/roles/${role.id}`}
                        className="text-[12px] text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all"
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
              <TableCell className="text-right pr-8">
                <button className="text-slate-300 hover:text-red-500 transition-all p-2.5 hover:bg-red-50 rounded-xl">
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
