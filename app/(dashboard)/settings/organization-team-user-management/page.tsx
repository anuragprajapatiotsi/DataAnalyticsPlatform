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
    <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto">
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
