import React from "react";
import { User, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button, Avatar, Popconfirm } from "antd";
import { RoleUser } from "../../types";

interface RoleUsersTableProps {
  users: RoleUser[];
  isLoading: boolean;
  onUnassignUser: (userId: string) => Promise<void>;
  isUnassigning: boolean;
}

export function RoleUsersTable({
  users,
  isLoading,
  onUnassignUser,
  isUnassigning,
}: RoleUsersTableProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-semibold text-slate-900 m-0 leading-tight">
          Assigned Users
        </h3>
        <p className="text-[13px] text-slate-500 font-medium m-0">
          Review users who have been granted this role.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-[13px] font-semibold text-slate-600 py-2 px-4">
                User
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 py-2 px-4">
                Description
              </TableHead>
              <TableHead className="text-right text-[13px] font-semibold text-slate-600 py-2 px-4">
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
                    <span className="font-medium">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !users || users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <User className="h-10 w-10 opacity-20" />
                    <span className="font-medium text-[14px]">
                      No users assigned
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-slate-50/30 transition-colors group h-12"
                >
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={32}
                        className="bg-blue-100 text-blue-600 uppercase font-bold text-[12px] flex items-center justify-center"
                      >
                        {user.name?.charAt(0) || user.username?.charAt(0)}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-[13px] leading-tight">
                          {user.display_name || user.name || user.username}
                        </span>
                        <span className="text-[12px] text-slate-400 font-medium">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <p className="text-[13px] text-slate-600 m-0 line-clamp-1 max-w-md font-medium">
                      {user.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <Popconfirm
                      title="Remove User"
                      description="Are you sure you want to remove this user from the role?"
                      onConfirm={() => onUnassignUser(user.id)}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ danger: true, loading: isUnassigning }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 size={16} />}
                        className="hover:bg-red-50 rounded-lg flex items-center justify-center ml-auto h-8 w-8"
                      />
                    </Popconfirm>
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
