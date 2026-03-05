"use client";

import React from "react";
import { AccessSelectionCards } from "@/features/settings/components/AccessSelectionCards";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function OrgManagementIndexPage() {
  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Team & User Management" },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Team & User Management"
        description="Streamline access to users and teams in OpenMetadata."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <AccessSelectionCards activeSection="" />
      </div>
    </div>
  );
}
