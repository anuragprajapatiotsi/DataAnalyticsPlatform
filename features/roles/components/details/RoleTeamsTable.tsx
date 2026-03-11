"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, MoreVertical, Users, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { RoleTeam } from "../../types";

interface RoleTeamsTableProps {
  teams: RoleTeam[];
  isLoading: boolean;
}

export function RoleTeamsTable({ teams, isLoading }: RoleTeamsTableProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-semibold text-slate-900 m-0 leading-tight">
          Assigned Teams
        </h3>
        <p className="text-[13px] text-slate-500 font-medium m-0">
          Teams that inherit this role's permissions.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[200px] text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Team Name
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Description
              </TableHead>
              <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span className="font-medium">Loading teams...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !teams || teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Users className="h-10 w-10 opacity-20" />
                    <span className="font-medium text-[14px]">
                      No teams assigned
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id} className="group hover:bg-slate-50/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0">
                        <Users size={16} />
                      </div>
                      <Link
                        href={`/settings/organization-team-user-management/teams/${team.id}`}
                        className="text-blue-600 hover:text-blue-700  cursor-pointer font-semibold text-[14px] transition-colors"
                      >
                        {team.display_name || team.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-[14px] text-slate-600 m-0 line-clamp-1 max-w-md font-medium">
                      {team.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "view",
                            label: "View Team",
                            icon: <ChevronRight className="h-4 w-4" />,
                          },
                        ],
                      }}
                      trigger={["click"]}
                    >
                      <Button
                        type="text"
                        icon={<MoreVertical className="h-4 w-4 text-slate-400" />}
                      />
                    </Dropdown>
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
