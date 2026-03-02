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
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold text-slate-900 m-0">
            Teams
          </h2>
          <p className="text-[14px] text-slate-500 m-0">
            Manage your organizational structure and team collaborations.
          </p>
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 rounded-lg"
          >
            Add Team
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[320px] h-10 pl-10 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[250px] text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Display Name
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Email
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Type
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Status
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Created
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
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/settings/organization-team-user-management/teams/${team.id}`}
                        className="font-semibold text-slate-900 text-[14px] hover:text-blue-600 transition-colors"
                      >
                        {team.display_name}
                      </Link>
                      <span className="text-[12px] text-slate-400">
                        {team.name}
                      </span>
                      {team.description && (
                        <p className="text-[12px] text-slate-500 line-clamp-1 mt-0.5">
                          {team.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[14px] font-medium">
                        {team.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="capitalize text-[12px] bg-slate-50 border-slate-200 text-slate-600"
                    >
                      {team.team_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {team.is_active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[12px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-rose-50 text-rose-700 border-rose-100 text-[12px]"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[13px]">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(team.created_at))}
                      </span>
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="text"
                          icon={<Edit2 className="h-4 w-4" />}
                          onClick={() => onEditClick(team)}
                          className="text-slate-400 hover:text-blue-600"
                        />
                        <Popconfirm
                          title="Delete Team"
                          description="Are you sure you want to delete this team?"
                          onConfirm={() => onDeleteConfirm(team.id)}
                          okType="danger"
                          okText="Delete"
                          cancelText="Cancel"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 className="h-4 w-4" />}
                            className="text-slate-400 hover:text-red-600"
                          />
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
