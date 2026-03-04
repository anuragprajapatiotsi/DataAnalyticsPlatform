"use client";

import React from "react";
import { Users, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "antd";
import { PolicyTeam } from "../../types";

interface PolicyTeamsTableProps {
  teams: PolicyTeam[];
  isLoading: boolean;
}

export function PolicyTeamsTable({ teams, isLoading }: PolicyTeamsTableProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-bold text-slate-900 m-0">
          Assigned Teams
        </h3>
        <p className="text-[13px] text-slate-500 font-medium m-0">
          List of teams that are governed by this policy.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-[12px] font-bold text-slate-500 uppercase py-4 px-8">
                Team Name
              </TableHead>
              <TableHead className="text-[12px] font-bold text-slate-500 uppercase py-4 px-8">
                Description
              </TableHead>
              <TableHead className="text-right text-[12px] font-bold text-slate-500 uppercase py-4 px-8">
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
                <TableRow
                  key={team.id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <TableCell className="px-8 py-5">
                    <span className="font-bold text-slate-900 text-[14px]">
                      {team.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <p className="text-[13.5px] text-slate-600 m-0 line-clamp-1 max-w-md font-medium">
                      {team.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                      className="hover:bg-red-50 rounded-lg flex items-center justify-center ml-auto"
                    />
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
