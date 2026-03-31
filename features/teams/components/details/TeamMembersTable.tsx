"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Trash2,
  User,
  MoreHorizontal,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  Button,
  Input,
  Popconfirm,
  Badge,
  Tooltip,
  Empty,
  message,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import { ChevronRight, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { TeamMember } from "../../types";
import { ManagementSelectionModal } from "./ManagementSelectionModal";
import { teamService } from "../../services/team.service";
import { useQuery } from "@tanstack/react-query";

interface TeamMembersTableProps {
  members: TeamMember[];
  isAdmin: boolean;
  onAddMember: (userIds: string[]) => Promise<void>;
  onRemoveMember: (userId: string) => void;
  isLoading?: boolean;
}

export function TeamMembersTable({
  members,
  isAdmin,
  onAddMember,
  onRemoveMember,
  isLoading,
}: TeamMembersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch available users for the selection modal
  const { data: availableUsers = [], isLoading: isLoadingAvailable } = useQuery(
    {
      queryKey: ["available-users"],
      queryFn: () => teamService.getAvailableUsers(),
      enabled: isAddModalOpen,
    },
  );

  // Filter out users who are already members
  const memberIds = new Set(members.map((m) => m.id));
  const trulyAvailableUsers = availableUsers.filter(
    (u) => !memberIds.has(u.id),
  );

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddSubmit = async (userIds: string[]) => {
    try {
      await onAddMember(userIds);
      setIsAddModalOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search members by name, username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[450px] h-9 pl-10 rounded-lg border-slate-200 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 transition-all font-medium"
          />
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 h-9 px-6 rounded-lg font-bold shadow-md flex items-center gap-2 transform transition-transform active:scale-95"
          >
            Add Member
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                User
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Email
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Team Role
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                System Roles
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Policies
              </TableHead>
              {isAdmin && (
                <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 4 : 3}
                  className="h-32 text-center"
                >
                  <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span>Fetching members...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="h-64 text-center"
                >
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-bold text-lg">
                          No members found
                        </span>
                        <span className="text-slate-400 text-[14px] font-medium">
                          Try adjusting your search or add a new member.
                        </span>
                      </div>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id} className="group">
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/settings/organization-team-user-management/users/${member.id}`}
                          className="text-blue-600 hover:text-blue-700 text-[14px] transition-colors"
                        >
                          {member.name}
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-2 text-slate-600 text-[14px] font-medium">
                      <Mail className="h-3.5 w-3.5 text-slate-300" />
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <Badge className="bg-emerald-50 text-emerald-700 border-none text-[11px] font-bold py-0.5 px-2.5 uppercase tracking-wide">
                        {member.role || "Member"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {member.roles && member.roles.length > 0 ? (
                        member.roles.map((r) => (
                          <Badge key={r.id} className="bg-blue-50 text-blue-700 border-none text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-tighter">
                            {r.display_name || r.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">Default User</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                      {member.policies && member.policies.length > 0 ? (
                        member.policies.map((p) => (
                          <Badge key={p.id} className="bg-purple-50 text-purple-700 border-none text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-tighter">
                            {p.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">No Policies</span>
                      )}
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-6 py-3 text-right">
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "view",
                              label: (
                                <Link
                                  href={`/settings/organization-team-user-management/users/${member.id}`}
                                >
                                  View Profile
                                </Link>
                              ),
                              icon: <ChevronRight className="h-4 w-4" />,
                            },
                            {
                              key: "remove",
                              label: (
                                <Popconfirm
                                  title="Remove Member"
                                  description={`Are you sure you want to remove ${member.name}?`}
                                  onConfirm={() => onRemoveMember(member.id)}
                                  okType="danger"
                                  okText="Remove"
                                >
                                  <span className="text-red-500">Remove Member</span>
                                </Popconfirm>
                              ),
                              icon: <Trash2 className="h-4 w-4 text-red-500" />,
                            },
                          ].filter(Boolean) as MenuProps["items"],
                        }}
                        trigger={["click"]}
                      >
                        <Button
                          type="text"
                          icon={<MoreVertical className="h-4 w-4 text-slate-400" />}
                        />
                      </Dropdown>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ManagementSelectionModal
        title="Add Members to Team"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onConfirm={handleAddSubmit}
        items={trulyAvailableUsers}
        isLoading={isLoadingAvailable}
        placeholder="Search users by name or email..."
        itemType="user"
      />
    </div>
  );
}
