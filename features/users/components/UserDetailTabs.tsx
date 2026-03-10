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
import { Users, Shield, Lock, ChevronRight, Plus } from "lucide-react";
import { Empty, Select, Button, message } from "antd";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { useUserAssignments } from "../hooks/useUserAssignments";

// --- UserTeamsTable ---
interface UserTeamsTableProps {
  teams: UserTeam[];
  isLoading: boolean;
  userId?: string;
  isAdmin?: boolean;
}

export function UserTeamsTable({
  teams,
  isLoading,
  userId,
  isAdmin,
}: UserTeamsTableProps) {
  const [selectedTeam, setSelectedTeam] = React.useState<string>();
  const { teams: availableTeams, isLoading: isLoadingTeams } = useTeams({
    limit: 200,
  });
  const { assignTeam, isAssigningTeam } = useUserAssignments(userId || "");

  const handleAssignTeam = async () => {
    if (!selectedTeam) {
      message.warning("Please select a team first");
      return;
    }
    try {
      await assignTeam(selectedTeam);
      setSelectedTeam(undefined);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {isAdmin && (
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <Select
            placeholder="Select a team to add"
            className="flex-1"
            style={{ height: "36px" }}
            value={selectedTeam}
            onChange={setSelectedTeam}
            loading={isLoadingTeams}
            showSearch
            optionFilterProp="label"
            options={(availableTeams as any[])
              ?.filter((t) => !teams.some((existing) => existing.id === t.id))
              .map((t) => ({
                label: t.display_name || t.name,
                value: t.id,
              }))}
          />
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleAssignTeam}
            loading={isAssigningTeam}
            className="bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-lg font-semibold flex items-center gap-2 text-sm"
          >
            Add to Team
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {teams.length === 0 ? (
          <EmptyState label="teams" />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-4 py-2">Team Name</TableHead>
                <TableHead className="px-4 py-2">Description</TableHead>
                <TableHead className="px-4 py-2 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow
                  key={team.id}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="px-4 py-2">
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
                  <TableCell className="px-4 py-2">
                    <span className="text-slate-500 text-[13px] font-medium">
                      Member of this team
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
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
        )}
      </div>
    </div>
  );
}

// --- UserRolesTable ---
interface UserRolesTableProps {
  roles: UserRole[];
  isLoading: boolean;
  userId?: string;
  isAdmin?: boolean;
}

export function UserRolesTable({
  roles,
  isLoading,
  userId,
  isAdmin,
}: UserRolesTableProps) {
  const [selectedRole, setSelectedRole] = React.useState<string>();
  const { roles: availableRoles, isLoading: isLoadingRoles } = useRoles({
    limit: 200,
  });
  const { assignRole, isAssigningRole } = useUserAssignments(userId || "");

  const handleAssignRole = async () => {
    if (!selectedRole) {
      message.warning("Please select a role first");
      return;
    }
    try {
      await assignRole(selectedRole);
      setSelectedRole(undefined);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {isAdmin && (
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <Select
            placeholder="Select a role to assign"
            className="flex-1"
            style={{ height: "36px" }}
            value={selectedRole}
            onChange={setSelectedRole}
            loading={isLoadingRoles}
            showSearch
            optionFilterProp="label"
            options={(availableRoles as any[])
              ?.filter((r) => !roles.some((existing) => existing.id === r.id))
              .map((r) => ({
                label: r.display_name || r.name,
                value: r.id,
              }))}
          />
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleAssignRole}
            loading={isAssigningRole}
            className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 rounded-lg font-semibold flex items-center gap-2 text-sm"
          >
            Assign Role
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {roles.length === 0 ? (
          <EmptyState label="roles" />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-4 py-2">Role Name</TableHead>
                <TableHead className="px-4 py-2">Description</TableHead>
                <TableHead className="px-4 py-2 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow
                  key={role.id}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="px-4 py-2">
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
                  <TableCell className="px-4 py-2 text-slate-500 text-[13px] font-medium">
                    Granted role permissions
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
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
        )}
      </div>
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
            <TableHead className="px-4 py-2">Policy Name</TableHead>
            <TableHead className="px-4 py-2">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow
              key={policy.id}
              className="group hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="px-4 py-2">
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
              <TableCell className="px-4 py-2 text-slate-500 text-[13px] font-medium">
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
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-bold text-base leading-none">
              No {label} found
            </span>
            <span className="text-slate-400 text-xs font-medium">
              This user is not associated with any {label}.
            </span>
          </div>
        }
      />
    </div>
  );
}
