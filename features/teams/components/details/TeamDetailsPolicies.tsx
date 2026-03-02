"use client";

import React from "react";
import {
  FileText,
  Plus,
  Trash2,
  ShieldCheck,
  ChevronRight,
  Eye,
  Edit2,
  Users as UsersIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, Empty, Badge, Popconfirm, Tooltip } from "antd";
import type { Policy } from "../../types";

interface TeamDetailsPoliciesProps {
  policies: Policy[];
  isAdmin: boolean;
  onAttachPolicy: () => void;
  onDetachPolicy: (id: string) => void;
  isLoading?: boolean;
}

const PermissionBadge = ({ type }: { type: string }) => {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    view: {
      color: "bg-blue-50 text-blue-700 border-blue-100",
      icon: <Eye className="h-3 w-3" />,
    },
    edit: {
      color: "bg-amber-50 text-amber-700 border-amber-100",
      icon: <Edit2 className="h-3 w-3" />,
    },
    manage: {
      color: "bg-purple-50 text-purple-700 border-purple-100",
      icon: <UsersIcon className="h-3 w-3" />,
    },
  };

  const style = config[type] || config.view;

  return (
    <Badge
      className={`${style.color} flex items-center gap-1.5 px-2 py-0.5 border text-[11px] font-bold capitalize`}
    >
      {style.icon}
      {type}
    </Badge>
  );
};

export function TeamDetailsPolicies({
  policies,
  isAdmin,
  onAttachPolicy,
  onDetachPolicy,
  isLoading,
}: TeamDetailsPoliciesProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-slate-900 m-0">Policies</h2>
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={onAttachPolicy}
            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-semibold shadow-sm flex items-center gap-2"
          >
            Attach Policy
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                Policy Name
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                Permissions
              </TableHead>
              <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase py-4 px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-32 text-center text-slate-500"
                >
                  Loading policies...
                </TableCell>
              </TableRow>
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-medium">
                          No policies attached to this team
                        </span>
                        <span className="text-slate-400 text-[13px]">
                          Attach policies to govern data access for team
                          members.
                        </span>
                      </div>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow
                  key={policy.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[14px]">
                          {policy.name}
                        </span>
                        {policy.description && (
                          <span className="text-[12px] text-slate-400 line-clamp-1">
                            {policy.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PermissionBadge type="view" />
                      <PermissionBadge type="edit" />
                      <PermissionBadge type="manage" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip title="View Policy Details">
                        <Button
                          type="text"
                          icon={
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          }
                        />
                      </Tooltip>
                      {isAdmin && (
                        <Popconfirm
                          title="Detach Policy"
                          description="Are you sure you want to detach this policy from the team?"
                          onConfirm={() => onDetachPolicy(policy.id)}
                          okType="danger"
                          okText="Detach"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 className="h-4 w-4" />}
                          />
                        </Popconfirm>
                      )}
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
