"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Edit2,
  Trash2,
  MoreVertical,
  UserPlus,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button, Dropdown, MenuProps, Popconfirm } from "antd";
import type { TeamDetail } from "../../types";

interface TeamDetailsHeaderProps {
  team: TeamDetail;
  isAdmin: boolean;
  isMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onJoin: () => void;
}

export function TeamDetailsHeader({
  team,
  isAdmin,
  isMember,
  onEdit,
  onDelete,
  onJoin,
}: TeamDetailsHeaderProps) {
  const actions: MenuProps["items"] = [
    {
      key: "edit",
      label: "Edit Team",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="Delete Team"
          description="Are you sure you want to delete this team? This action cannot be undone."
          onConfirm={onDelete}
          okText="Yes, Delete"
          cancelText="No"
          okType="danger"
        >
          <span className="text-red-600">Delete Team</span>
        </Popconfirm>
      ),
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      danger: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4 mb-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/settings/organization-team-user-management/teams">
                Teams
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{team.display_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] font-bold text-slate-900 m-0">
            {team.display_name}
          </h1>
          {isAdmin && (
            <Button
              type="text"
              icon={
                <Edit2 className="h-5 w-5 text-slate-400 hover:text-blue-600 transition-colors" />
              }
              onClick={onEdit}
              className="p-1 h-auto flex items-center justify-center"
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isMember && (
            <Button
              type="primary"
              icon={<UserPlus className="h-4 w-4" />}
              onClick={onJoin}
              className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-semibold shadow-sm"
            >
              Join Team
            </Button>
          )}

          {isAdmin && (
            <Dropdown
              menu={{ items: actions }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button
                type="text"
                icon={<MoreVertical className="h-5 w-5 text-slate-500" />}
                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-100"
              />
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
}
