"use client";

import React from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { AdminUser } from "../types";

interface UserProfileHeaderProps {
  user?: AdminUser;
  isLoading: boolean;
}

export function UserProfileHeader({ user, isLoading }: UserProfileHeaderProps) {
  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Organization, Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    {
      label: "Users",
      href: "/settings/organization-team-user-management/users",
    },
    { label: user?.display_name || "User Profile" },
  ];

  return (
    <PageHeader
      title={user?.display_name || "Loading..."}
      breadcrumbItems={breadcrumbItems}
    >
      <div className="flex items-center gap-3 py-2">
        {/* Actions could go here if needed, like Edit/Delete */}
      </div>
    </PageHeader>
  );
}
