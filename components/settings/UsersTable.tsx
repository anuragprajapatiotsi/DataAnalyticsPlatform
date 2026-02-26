"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, User } from "lucide-react";
import Link from "next/link";

const mockUsers = [
  {
    key: "1",
    username: "anurag.prajapati",
    name: "Anurag Prajapati",
    teams: ["Organization"],
    roles: ["Admin", "Data Steward"],
  },
  {
    key: "2",
    username: "jane.doe",
    name: "Jane Doe",
    teams: ["Marketing", "Organization"],
    roles: ["Data Consumer"],
  },
  {
    key: "3",
    username: "john.smith",
    name: "John Smith",
    teams: ["Engineering", "Organization"],
    roles: ["Data Engineer"],
  },
];

export function UsersTable() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-[300px] text-[13px] font-bold text-slate-500 uppercase">
              Username
            </TableHead>
            <TableHead className="text-[13px] font-bold text-slate-500 uppercase">
              Name
            </TableHead>
            <TableHead className="text-[13px] font-bold text-slate-500 uppercase">
              Teams
            </TableHead>
            <TableHead className="text-[13px] font-bold text-slate-500 uppercase">
              Roles
            </TableHead>
            <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase pr-8">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockUsers.map((user) => (
            <TableRow
              key={user.key}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-200 text-slate-500">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[14px] text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">
                    {user.username}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-[14px] text-slate-600 font-medium">
                  {user.name}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {user.teams.map((team) => (
                    <Link
                      key={team}
                      href={`#${team}`}
                      className="text-[13px] text-blue-600 hover:text-blue-800 hover:underline font-semibold bg-blue-50/50 px-2 py-0.5 rounded"
                    >
                      {team}
                    </Link>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-[14px] text-slate-600 font-medium">
                  {user.roles.join(", ")}
                </span>
              </TableCell>
              <TableCell className="text-right pr-8">
                <button className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
