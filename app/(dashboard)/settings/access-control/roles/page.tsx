"use client";

import React from "react";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { RolesTable } from "@/features/roles/components/RolesTable";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function RolesPage() {
  const { data, isLoading } = useRoles({ skip: 0, limit: 10 });

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Access Control", href: "/settings/access-control" },
    { label: "Roles" },
  ];

  return (
    <div className="flex flex-col px-6 py-6 space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Roles"
        description="Define and manage user roles to control access levels across your organization."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="mt-6 animate-in fade-in duration-300">
        <RolesTable roles={data?.data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
