"use client";

import React from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function AdminsPlaceholderPage() {
  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    { label: "Admins" },
  ];

  return (
    <div className="flex flex-col px-6 space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Admins"
        description="Manage administrative access for your organization."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="mt-0">
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/10">
          <p className="text-slate-500 font-semibold text-xl">
            Admins Management
          </p>
          <p className="text-slate-400 mt-2">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
