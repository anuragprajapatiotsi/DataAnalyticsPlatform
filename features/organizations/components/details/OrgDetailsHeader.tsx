"use client";

import React from "react";
import { Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button, Dropdown, MenuProps, Popconfirm } from "antd";
import { PageHeader, type BreadcrumbItem } from "@/shared/components/layout/PageHeader";
import type { Organization } from "@/shared/types";

interface OrgDetailsHeaderProps {
  organization: Organization;
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export function OrgDetailsHeader({
  organization,
  isAdmin,
  onEdit,
  onDelete,
  children,
}: OrgDetailsHeaderProps) {
  const actions: MenuProps["items"] = [
    {
      key: "edit",
      label: "Edit Organization",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="Delete Organization"
          description="Are you sure you want to delete this organization? This action cannot be undone."
          onConfirm={onDelete}
          okText="Yes, Delete"
          cancelText="No"
          okType="danger"
        >
          <span className="text-red-600">Delete Organization</span>
        </Popconfirm>
      ),
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      danger: true,
    },
  ];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    {
      label: "Organizations",
      href: "/settings/organization-team-user-management/organizations",
    },
    { label: organization?.name || "Organization Details" },
  ];

  return (
    <PageHeader
      title={organization?.name || "Organization Details"}
      breadcrumbItems={breadcrumbItems}
    >
      <div className="flex items-center gap-3 py-2">
        {children}
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
