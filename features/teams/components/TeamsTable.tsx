"use client";

import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Mail,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { Popconfirm, Button } from "antd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import type { Team } from "../types";

interface TeamsTableProps {
  teams: Team[];
  isLoading: boolean;
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onEditClick: (team: Team) => void;
  onDeleteConfirm: (id: string) => void;
}

export function TeamsTable({
  teams,
  isLoading,
  isAdmin,
  searchQuery,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onDeleteConfirm,
}: TeamsTableProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        {/* Search Input */}
        <div className="relative group">
          <div className="absolute left-3 top-2 bottom-2 flex items-center pointer-events-none">
            <Search
              size={16}
              className="text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
          </div>

          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[320px] h-9 pl-9 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>

        {/* Add Team Button */}
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 h-9 flex items-center gap-2 rounded-lg font-semibold"
          >
            Add Team
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[220px] text-[13px] font-semibold text-slate-600 py-2 px-4">
                Display Name
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 py-2 px-4">
                Email
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 py-2 px-4">
                Type
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 py-2 px-4">
                Status
              </TableHead>
              {isAdmin && (
                <TableHead className="text-right text-[13px] font-semibold text-slate-600 py-2 px-4">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : teams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Users className="h-8 w-8 text-slate-300" />
                    <span>No teams found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow
                  key={team.id}
                  className="hover:bg-slate-50/50 transition-colors group h-12"
                >
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-col">
                      <Link
                        href={`/settings/organization-team-user-management/teams/${team.id}`}
                        className="font-semibold text-slate-900 text-[13px] hover:text-blue-600 transition-colors"
                      >
                        {team.display_name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-[13px] font-medium">
                        {team.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <Badge
                      variant="outline"
                      className="capitalize text-[11px] bg-slate-50 border-slate-200 text-slate-600 font-semibold py-0 px-1.5 h-5 flex items-center w-fit"
                    >
                      {team.team_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {team.is_active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[11px] font-semibold py-0 px-2 h-5 flex items-center w-fit">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-rose-50 text-rose-700 border-rose-100 text-[11px] font-semibold py-0 px-2 h-5 flex items-center w-fit"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="text"
                        icon={<Edit2 size={16} />}
                        onClick={() => onEditClick(team)}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 flex items-center justify-center rounded-lg"
                      />
                      <Popconfirm
                        title="Delete Team"
                        description="Are you sure you want to delete this team?"
                        onConfirm={() => onDeleteConfirm(team.id)}
                        okType="danger"
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 size={16} />}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 flex items-center justify-center rounded-lg"
                        />
                      </Popconfirm>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
