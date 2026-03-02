"use client";

import React, { useState } from "react";
import {
  Search,
  UserPlus,
  Trash2,
  User,
  MoreHorizontal,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button, Input, Popconfirm, Badge, Tooltip, Empty } from "antd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeamMember } from "../../types";

interface TeamMembersTableProps {
  members: TeamMember[];
  isAdmin: boolean;
  onAddMember: () => void;
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

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search members by name, username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[450px] h-10 pl-10 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={onAddMember}
            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-semibold shadow-sm flex items-center gap-2"
          >
            Add Member
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                User
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                Email
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                Team Role
              </TableHead>
              {isAdmin && (
                <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
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
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
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
                        <span className="text-slate-500 font-medium">
                          No members found
                        </span>
                        <span className="text-slate-400 text-[13px]">
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
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[14px]">
                          {member.name}
                        </span>
                        <span className="text-[12px] text-slate-400">
                          @{member.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-[14px]">
                      <Mail className="h-3.5 w-3.5 text-slate-300" />
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[12px] font-semibold py-0.5">
                        {member.role || "Member"}
                      </Badge>
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            className="hover:bg-red-50 flex items-center justify-center"
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
    </div>
  );
}
