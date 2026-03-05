"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { UserTeam, UserRole, UserPolicy } from "../types";
import { Users, Shield, Lock, ChevronRight } from "lucide-react";
import { Empty } from "antd";

// --- UserTeamsTable ---
interface UserTeamsTableProps {
  teams: UserTeam[];
  isLoading: boolean;
}

export function UserTeamsTable({ teams, isLoading }: UserTeamsTableProps) {
  if (isLoading) return <LoadingState />;
  if (teams.length === 0) return <EmptyState label="teams" />;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="px-6 py-4">Team Name</TableHead>
            <TableHead className="px-6 py-4">Description</TableHead>
            <TableHead className="px-6 py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow
              key={team.id}
              className="group hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="px-6 py-4">
                <Link
                  href={`/settings/organization-team-user-management/teams/${team.id}`}
                  className="flex items-center gap-3 group/link"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover/link:bg-blue-100">
                    <Users size={16} />
                  </div>
                  <span className="font-bold text-slate-700 group-hover/link:text-blue-600 transition-colors">
                    {team.display_name || team.name}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-6 py-4">
                <span className="text-slate-500 text-[14px] font-medium">
                  {/* Assuming team might have description, though not in UserTeam interface yet */}
                  {"Member of this team"}
                </span>
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Link
                  href={`/settings/organization-team-user-management/teams/${team.id}`}
                  className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-[13px] hover:underline"
                >
                  View Team
                  <ChevronRight size={14} />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// --- UserRolesTable ---
interface UserRolesTableProps {
  roles: UserRole[];
  isLoading: boolean;
}

export function UserRolesTable({ roles, isLoading }: UserRolesTableProps) {
  if (isLoading) return <LoadingState />;
  if (roles.length === 0) return <EmptyState label="roles" />;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="px-6 py-4">Role Name</TableHead>
            <TableHead className="px-6 py-4">Description</TableHead>
            <TableHead className="px-6 py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow
              key={role.id}
              className="group hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="px-6 py-4">
                <Link
                  href={`/settings/access-control/roles/${role.id}`}
                  className="flex items-center gap-3 group/link"
                >
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors group-hover/link:bg-indigo-100">
                    <Shield size={16} />
                  </div>
                  <span className="font-bold text-slate-700 group-hover/link:text-indigo-600 transition-colors">
                    {role.display_name || role.name}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-6 py-4 text-slate-500 text-[14px] font-medium">
                Granted role permissions
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Link
                  href={`/settings/access-control/roles/${role.id}`}
                  className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-[13px] hover:underline"
                >
                  View Role
                  <ChevronRight size={14} />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// --- UserPoliciesTable ---
interface UserPoliciesTableProps {
  policies: UserPolicy[];
  isLoading: boolean;
}

export function UserPoliciesTable({
  policies,
  isLoading,
}: UserPoliciesTableProps) {
  if (isLoading) return <LoadingState />;
  if (policies.length === 0) return <EmptyState label="policies" />;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="px-6 py-4">Policy Name</TableHead>
            <TableHead className="px-6 py-4">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow
              key={policy.id}
              className="group hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="px-6 py-4">
                <Link
                  href={`/settings/access-control/policies/${policy.id}`}
                  className="flex items-center gap-3 group/link"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-hover/link:bg-emerald-100">
                    <Lock size={16} />
                  </div>
                  <span className="font-bold text-slate-700 group-hover/link:text-emerald-600 transition-colors">
                    {policy.name}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-6 py-4 text-slate-500 text-[14px] font-medium">
                {policy.description || "No description provided."}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// --- Helpers ---

function LoadingState() {
  return (
    <div className="rounded-lg border border-slate-100 bg-white/50 h-64 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-bold text-sm">
          Loading data...
        </span>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-bold text-lg leading-none">
              No {label} found
            </span>
            <span className="text-slate-400 text-sm font-medium">
              This user is not associated with any {label}.
            </span>
          </div>
        }
      />
    </div>
  );
}
