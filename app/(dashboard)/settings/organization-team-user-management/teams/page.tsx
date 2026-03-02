"use client";

import React, { useState } from "react";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { TeamsTable } from "@/features/teams/components/TeamsTable";
import { TeamModal } from "@/features/teams/components/TeamModal";
import { useAuthContext } from "@/context/auth-context";
import type { Team } from "@/features/teams/types";

export default function TeamsPage() {
  const { user } = useAuthContext();
  const isAdmin = !!(user?.is_admin || user?.is_global_admin);

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
    <div className="animate-in fade-in duration-300">
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
