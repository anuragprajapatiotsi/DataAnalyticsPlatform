"use client";

import React, { useState, useEffect } from "react";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { TeamsTable } from "@/features/teams/components/TeamsTable";
import { TeamModal } from "@/features/teams/components/TeamModal";
import { useAuthContext } from "@/shared/contexts/auth-context";
import type { Team } from "@/features/teams/types";
import {
  TeamsTabs,
  TeamManagementTab,
} from "@/features/teams/components/TeamsTabs";
import { RolesList } from "@/features/teams/components/RolesList";
import { PoliciesList } from "@/features/teams/components/PoliciesList";
import { useSearchParams, useRouter } from "next/navigation";

export default function TeamsPage() {
  const { user } = useAuthContext();
  const isAdmin = !!(user?.is_admin || user?.is_global_admin);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TeamManagementTab>(
    (searchParams.get("tab") as TeamManagementTab) || "teams",
  );

  const {
    teams,
    isLoading,
    createTeam,
    updateTeam,
    deleteTeam,
    isCreating,
    isUpdating,
  } = useTeams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab") as TeamManagementTab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TeamManagementTab) => {
    setActiveTab(tab);
    // Soft update URL for deep linking
    router.push(
      `/settings/organization-team-user-management/teams?tab=${tab}`,
      {
        scroll: false,
      },
    );
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingTeam) {
      await updateTeam({ id: editingTeam.id, data: values });
    } else {
      await createTeam(values);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <TeamsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
      />

      <div className="mt-4">
        {activeTab === "teams" && (
          <TeamsTable
            teams={filteredTeams}
            isLoading={isLoading}
            isAdmin={isAdmin}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateClick={handleCreate}
            onEditClick={handleEdit}
            onDeleteConfirm={deleteTeam}
          />
        )}

        {activeTab === "roles" && <RolesList />}

        {activeTab === "policies" && <PoliciesList />}
      </div>

      <TeamModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingTeam}
        isLoading={isCreating || isUpdating}
        teams={teams}
      />
    </div>
  );
}

