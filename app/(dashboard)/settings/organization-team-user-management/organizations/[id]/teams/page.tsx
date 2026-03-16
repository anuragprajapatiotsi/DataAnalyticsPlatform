"use client";

import React, { useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrgTeams } from "@/features/organizations/hooks/useOrgTeams";
import { useOrgDetails } from "@/features/organizations/hooks/useOrgDetails";
import { TeamsTable } from "@/features/teams/components/TeamsTable";
import { TeamModal } from "@/features/teams/components/TeamModal";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { useAuthContext } from "@/shared/contexts/auth-context";
import type { Team } from "@/features/teams/types";
import { Spin, Button } from "antd";
import { Plus } from "lucide-react";
import { useTeams } from "@/features/teams/hooks/useTeams";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrganizationTeamsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthContext();
  const isAdmin = !!(user?.is_admin || user?.is_global_admin);

  const {
    teams,
    isLoading: isLoadingTeams,
    deleteTeam,
    isDeleting,
  } = useOrgTeams(id);

  const { data: organization, isLoading: isLoadingOrg } = useOrgDetails(id);

  // We need update mutation for the modal
  const { updateTeam, isUpdating } = useTeams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingTeam) {
      await updateTeam({ id: editingTeam.id, data: values });
    }
    setIsModalOpen(false);
  };

  const handleCreate = () => {
    // Navigate to shared create page but maybe with pre-filled org?
    // For now, follow the requirement to reuse components.
    router.push(`/settings/organization-team-user-management/teams/create?org_id=${id}`);
  };

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    {
      label: "Organizations",
      href: "/settings/organization-team-user-management/organizations",
    },
    { label: organization?.name || "Organization" },
    { label: "Teams" },
  ];

  if (isLoadingOrg && !organization) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto overflow-hidden h-full">
      <div className="flex justify-between items-start">
        <PageHeader
          title={`${organization?.name || "Organization"} Teams`}
          description={`View and manage teams under ${organization?.name}.`}
          breadcrumbItems={breadcrumbItems}
        />
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus size={15} />}
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 h-9 px-5 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 mt-1 text-[13px]"
          >
            Add Team
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <TeamsTable
          teams={teams as Team[]}
          isLoading={isLoadingTeams}
          isAdmin={isAdmin}
          onEditClick={handleEdit}
          onDeleteConfirm={deleteTeam}
          total={teams.length}
          current={1}
          pageSize={teams.length || 10}
          onPageChange={() => {}}
          orgId={id}
        />
      </div>

      <TeamModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingTeam}
        isLoading={isUpdating}
        teams={teams as Team[]}
      />
    </div>
  );
}
