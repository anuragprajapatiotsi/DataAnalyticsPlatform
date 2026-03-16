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
import { MinusCircle, Plus, Shield, Users, Lock, ChevronRight, Search } from "lucide-react";
import { Empty, Select, Button, message, Pagination, Modal } from "antd";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { usePolicies } from "../../policies/hooks/usePolicies";
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const pageSize = 5;

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
      setIsModalOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) return <LoadingState />;

  const paginatedTeams = teams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
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
                <TableHead className="px-4 py-2.5 text-[13px] font-bold text-slate-500">Team Name</TableHead>
                <TableHead className="px-4 py-2.5 text-[13px] font-bold text-slate-500">Description</TableHead>
                <TableHead className="px-4 py-2.5 text-[13px] font-bold text-slate-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTeams.map((team) => (
                <TableRow
                  key={team.id}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="px-4 py-2">
                    <Link
                      href={`/settings/organization-team-user-management/teams/${team.id}`}
                      className="flex items-center gap-3 group/link"
                    >
                      <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover/link:bg-blue-100">
                        <Users size={14} />
                      </div>
                      <span className="font-bold text-slate-700 group-hover/link:text-blue-600 transition-colors text-[13px]">
                        {team.display_name || team.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="text-slate-500 text-[12px] font-medium">
                      Member of this team
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <Link
                      href={`/settings/organization-team-user-management/teams/${team.id}`}
                      className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-[12px] hover:underline"
                    >
                      View Team
                      <ChevronRight size={12} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {teams.length > pageSize && (
        <div className="flex justify-end pt-2">
          <Pagination
            size="small"
            current={currentPage}
            total={teams.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Add to Team Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-0">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Add to Team</h3>
              <p className="text-[11px] text-slate-400 font-medium">Select a team to add the user as a member</p>
            </div>
          </div>
        }
        open={isModalOpen}
        onOk={handleAssignTeam}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedTeam(undefined);
        }}
        confirmLoading={isAssigningTeam}
        okText="Add to Team"
        okButtonProps={{
          className: "bg-blue-600 hover:bg-blue-700 h-9 px-6 rounded-lg font-bold",
        }}
        cancelButtonProps={{
          className: "h-9 px-6 rounded-lg font-bold border-slate-200 text-slate-600 hover:text-blue-800",
        }}
        centered
        width={450}
        closeIcon={false}
      >
        <div className="py-6">
          <p className="text-[13px] font-bold text-slate-600 mb-2 px-1">Choose Team</p>
          <Select
            placeholder="Search and select team..."
            className="w-full"
            style={{ height: "42px" }}
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
            suffixIcon={<Search size={16} className="text-slate-400" />}
          />
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Note: Adding a user to a team will grant them access to team-specific resources.
            </p>
          </div>
        </div>
      </Modal>
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const pageSize = 5;

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
      setIsModalOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) return <LoadingState />;

  const paginatedRoles = roles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
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
                <TableHead className="px-4 py-2.5 text-[13px] font-bold text-slate-500">Role Name</TableHead>
                <TableHead className="px-4 py-2.5 text-[13px] font-bold text-slate-500">Description</TableHead>
                <TableHead className="px-4 py-2.5 text-[13px] font-bold text-slate-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRoles.map((role) => (
                <TableRow
                  key={role.id}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="px-4 py-2">
                    <Link
                      href={`/settings/access-control/roles/${role.id}`}
                      className="flex items-center gap-3 group/link"
                    >
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors group-hover/link:bg-indigo-100">
                        <Shield size={14} />
                      </div>
                      <span className="font-bold text-slate-700 group-hover/link:text-indigo-600 transition-colors text-[13px]">
                        {role.display_name || role.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-slate-500 text-[12px] font-medium">
                    Granted role permissions
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <Link
                      href={`/settings/access-control/roles/${role.id}`}
                      className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-[12px] hover:underline"
                    >
                      View Role
                      <ChevronRight size={12} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {roles.length > pageSize && (
        <div className="flex justify-end pt-2">
          <Pagination
            size="small"
            current={currentPage}
            total={roles.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Assign Role Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Assign Role</h3>
              <p className="text-[11px] text-slate-400 font-medium">Select a role to assign to this user</p>
            </div>
          </div>
        }
        open={isModalOpen}
        onOk={handleAssignRole}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRole(undefined);
        }}
        confirmLoading={isAssigningRole}
        okText="Assign Role"
        okButtonProps={{
          className: "bg-indigo-600 hover:bg-indigo-700 h-9 px-6 rounded-lg font-bold",
        }}
        cancelButtonProps={{
          className: "h-9 px-6 rounded-lg font-bold border-slate-200 text-slate-600 hover:text-blue-800",
        }}
        centered
        width={450}
        closeIcon={false}
      >
        <div className="py-6">
          <p className="text-[13px] font-bold text-slate-600 mb-2 px-1">Choose Role</p>
          <Select
            placeholder="Search and select role..."
            className="w-full"
            style={{ height: "42px" }}
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
            suffixIcon={<Search size={16} className="text-slate-400" />}
          />
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Note: Assigning a role will grant the user the permissions associated with it.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// --- UserPoliciesTable ---
interface UserPoliciesTableProps {
  policies: UserPolicy[];
  isLoading: boolean;
  userId?: string;
  isAdmin?: boolean;
}

export function UserPoliciesTable({
  policies,
  isLoading,
  userId,
  isAdmin,
}: UserPoliciesTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPolicy, setSelectedPolicy] = React.useState<string>();
  const pageSize = 5;

  const { policies: availablePolicies, isLoading: isLoadingPolicies } = usePolicies({
    limit: 200,
  });
  const { assignPolicy, isAssigningPolicy } = useUserAssignments(userId || "");

  const handleAssignPolicy = async () => {
    if (!selectedPolicy) {
      message.warning("Please select a policy first");
      return;
    }
    try {
      await assignPolicy(selectedPolicy);
      setSelectedPolicy(undefined);
      setIsModalOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) return <LoadingState />;

  const paginatedPolicies = policies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 rounded-lg font-semibold flex items-center gap-2 text-sm"
          >
            Assign Policy
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {policies.length === 0 ? (
          <EmptyState label="policies" />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-4 py-2.5 text-[13px] font-bold text-slate-500">Policy Name</TableHead>
                <TableHead className="px-4 py-2.5 text-[13px] font-bold text-slate-500">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPolicies.map((policy) => (
                <TableRow
                  key={policy.id}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="px-4 py-2">
                    <Link
                      href={`/settings/access-control/policies/${policy.id}`}
                      className="flex items-center gap-3 group/link"
                    >
                      <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover/link:bg-blue-100">
                        <Lock size={14} />
                      </div>
                      <span className="font-bold text-slate-700 group-hover/link:text-blue-600 transition-colors text-[13px]">
                        {policy.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-slate-500 text-[12px] font-medium">
                    {policy.description || "No description provided."}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {policies.length > pageSize && (
        <div className="flex justify-end pt-2">
          <Pagination
            size="small"
            current={currentPage}
            total={policies.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Assign Policy Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-0">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Assign Policy</h3>
              <p className="text-[11px] text-slate-400 font-medium">Select a security policy to grant permissions</p>
            </div>
          </div>
        }
        open={isModalOpen}
        onOk={handleAssignPolicy}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedPolicy(undefined);
        }}
        confirmLoading={isAssigningPolicy}
        okText="Assign Policy"
        okButtonProps={{
          className: "bg-blue-600 hover:bg-blue-700 h-9 px-6 rounded-lg font-bold",
        }}
        cancelButtonProps={{
          className: "h-9 px-6 rounded-lg font-bold border-slate-200 text-slate-600 hover:text-blue-800",
        }}
        centered
        width={450}
        closeIcon={false}
      >
        <div className="py-6">
          <p className="text-[13px] font-bold text-slate-600 mb-2 px-1">Choose Policy</p>
          <Select
            placeholder="Search and select policy..."
            className="w-full"
            style={{ height: "42px" }}
            value={selectedPolicy}
            onChange={setSelectedPolicy}
            loading={isLoadingPolicies}
            showSearch
            optionFilterProp="label"
            options={(availablePolicies as any[])
              ?.filter((p) => !policies.some((existing) => existing.id === p.id))
              .map((p) => ({
                label: p.name,
                value: p.id,
              }))}
            suffixIcon={<Search size={16} className="text-slate-400" />}
          />
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Note: Assigning a policy will grant the user the permissions defined within that policy. This action will be logged.
            </p>
          </div>
        </div>
      </Modal>
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
