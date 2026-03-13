"use client";

import React from "react";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { CreateTeamForm } from "@/features/teams/components/CreateTeamForm";
import { Card } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function CreateTeamPage() {
  const { teams } = useTeams();

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    {
      label: "Teams",
      href: "/settings/organization-team-user-management/teams",
    },
    { label: "Create Team" },
  ];

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto">
      <PageHeader
        title="Create Team"
        description="Add a new team to your organization."
        breadcrumbItems={breadcrumbItems}
      />

      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
        <CreateTeamForm teams={teams} />
      </Card>
    </div>
  );
}
