"use client";

import React, { useState } from "react";
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
} from "antd";
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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search members by name, username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[450px] h-11 pl-10 rounded-xl border-slate-200 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 transition-all font-medium"
          />
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-xl font-bold shadow-lg flex items-center gap-2 transform transition-transform active:scale-95"
          >
            Add Member
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] text-[12px] font-bold text-slate-400 uppercase tracking-wider py-5 px-8">
                User
              </TableHead>
              <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-wider py-5 px-8">
                Email
              </TableHead>
              <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-wider py-5 px-8">
                Team Role
              </TableHead>
              {isAdmin && (
                <TableHead className="text-right text-[12px] font-bold text-slate-400 uppercase tracking-wider py-5 px-8">
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
                  colSpan={isAdmin ? 4 : 3}
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
                <TableRow
                  key={member.id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0 shadow-sm border border-indigo-100">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[15px]">
                          {member.name}
                        </span>
                        <span className="text-[12px] text-slate-400 font-semibold tracking-tight">
                          @{member.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-600 text-[14px] font-medium">
                      <Mail className="h-3.5 w-3.5 text-slate-300" />
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <Badge className="bg-emerald-50 text-emerald-700 border-none text-[11px] font-bold py-0.5 px-2.5 uppercase tracking-wide">
                        {member.role || "Member"}
                      </Badge>
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Popconfirm
                          title="Remove Member"
                          description={`Are you sure you want to remove ${member.name} from this team?`}
                          onConfirm={() => onRemoveMember(member.id)}
                          okText="Remove"
                          cancelText="Cancel"
                          okType="danger"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 className="h-4 w-4" />}
                            className="hover:bg-red-50 flex items-center justify-center rounded-lg"
                          ></Button>
                        </Popconfirm>
                      </div>
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

