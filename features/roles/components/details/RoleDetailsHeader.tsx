"use client";

import React from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Role } from "../../types";

interface RoleDetailsHeaderProps {
  role?: Role;
  isLoading: boolean;
}

export function RoleDetailsHeader({ role, isLoading }: RoleDetailsHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-5 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-100 animate-pulse rounded" />
          <div className="h-4 w-full max-w-2xl bg-slate-100 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!role) return null;

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Access Control", href: "/settings/access-control" },
    { label: "Roles", href: "/settings/access-control/roles" },
    { label: role.name },
  ];

  return (
    <PageHeader
      title={role.name}
      description={role.description || "No description provided for this role."}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
