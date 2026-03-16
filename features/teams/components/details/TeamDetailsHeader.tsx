"use client";

import React, { Suspense } from "react";
import { Edit2, Trash2, MoreVertical, UserPlus } from "lucide-react";
import { Button, Dropdown, MenuProps, Popconfirm, Spin } from "antd";
import type { TeamDetail } from "../../types";
import { PageHeader, type BreadcrumbItem } from "@/shared/components/layout/PageHeader";
import { useSearchParams } from "next/navigation";
import { useOrgDetails } from "@/features/organizations/hooks/useOrgDetails";

interface TeamDetailsHeaderProps {
  team: TeamDetail;
  isAdmin: boolean;
  isMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onJoin: () => void;
}

function TeamDetailsHeaderContent({
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

  const searchParams = useSearchParams();
  const orgId = searchParams.get("org_id");
  const { data: organization } = useOrgDetails(orgId || "");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
  ];

  if (orgId && organization) {
    breadcrumbItems.push(
      {
        label: "Organizations",
        href: "/settings/organization-team-user-management/organizations",
      },
      {
        label: organization?.name || "Organization",
        href: `/settings/organization-team-user-management/organizations/${orgId}/teams`,
      },
      { 
        label: "Teams", 
        href: `/settings/organization-team-user-management/organizations/${orgId}/teams` 
      },
    );
  } else {
    breadcrumbItems.push(
      {
        label: "Teams",
        href: "/settings/organization-team-user-management/teams",
      },
    );
  }

  breadcrumbItems.push({ label: team?.display_name || "Team Details" });

  return (
    <PageHeader
      title={team?.display_name || "Team Details"}
      breadcrumbItems={breadcrumbItems}
    >
      <div className="flex items-center gap-3 py-2">
        {!isMember && (
          <Button
            type="primary"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={onJoin}
            className="bg-blue-600 hover:bg-blue-700 h-9 px-6 rounded-lg font-semibold shadow-sm"
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
              type="default"
              icon={<MoreVertical className="h-4 w-4 text-slate-500" />}
              className="h-9 w-9 flex items-center justify-center rounded-lg border-slate-200 hover:bg-slate-50"
            />
          </Dropdown>
        )}
      </div>
    </PageHeader>
  );
}

export function TeamDetailsHeader(props: TeamDetailsHeaderProps) {
  return (
    <Suspense fallback={
      <div className="h-20 flex items-center justify-center">
        <Spin />
      </div>
    }>
      <TeamDetailsHeaderContent {...props} />
    </Suspense>
  );
}
