"use client";

import React from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { AdminUser } from "../types";
import { Button } from "antd";
import { KeyRound } from "lucide-react";

interface UserProfileHeaderProps {
  user?: AdminUser;
  isLoading: boolean;
  onResetPassword?: () => void;
  breadcrumbItems?: { label: string; href?: string }[];
}

export function UserProfileHeader({
  user,
  isLoading,
  onResetPassword,
  breadcrumbItems: customBreadcrumbs,
}: UserProfileHeaderProps) {
  const defaultBreadcrumbs = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    {
      label: "Users",
      href: "/settings/organization-team-user-management/users",
    },
    { label: user?.display_name || "User Profile" },
  ];

  const breadcrumbItems = customBreadcrumbs || defaultBreadcrumbs;

  return (
    <PageHeader
      title={user?.display_name || "Loading..."}
      breadcrumbItems={breadcrumbItems}
    >
      <div className="flex items-center">
        {user && onResetPassword && (
          <Button
            type="default"
            icon={<KeyRound size={16} className="text-blue-600" />}
            onClick={onResetPassword}
            className="flex items-center gap-1 h-6 px-4 rounded-lg font-bold border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            Reset Password
          </Button>
        )}
      </div>
    </PageHeader>
  );
}
