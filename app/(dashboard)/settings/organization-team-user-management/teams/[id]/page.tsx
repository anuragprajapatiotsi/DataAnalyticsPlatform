"use client";

import React, { useState, use } from "react";
import { useTeamDetails } from "@/features/teams/hooks/useTeamDetails";
import { TeamDetailsHeader } from "@/features/teams/components/details/TeamDetailsHeader";
import { TeamDetailsInfo } from "@/features/teams/components/details/TeamDetailsInfo";
import {
  TeamDetailsTabs,
  TeamTabKey,
} from "@/features/teams/components/details/TeamDetailsTabs";
import { TeamMembersTable } from "@/features/teams/components/details/TeamMembersTable";
import { TeamAssetsList } from "@/features/teams/components/details/TeamAssetsList";
import { TeamDetailsRoles } from "@/features/teams/components/details/TeamDetailsRoles";
import { TeamDetailsPolicies } from "@/features/teams/components/details/TeamDetailsPolicies";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { Spin, message } from "antd";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeamDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuthContext();
  const isAdmin = !!(user?.is_admin || user?.is_global_admin);

  const [activeTab, setActiveTab] = useState<TeamTabKey>("users");

  const {
    team,
    members,
    roles,
    policies,
    assets,
    isLoading,
    isError,
    assignMembers,
    removeMember,
    assignRoles,
    removeRole,
    assignPolicies,
    removePolicy,
    updateTeam,
    isPending,
    isLoadingMembers,
    isLoadingRoles,
    isLoadingPolicies,
    isLoadingAssets,
  } = useTeamDetails(id, activeTab);

  // Check if current user is a member of the team
  const isMember = members.some((m) => m.id === user?.id);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Team not found</h2>
        <p className="text-slate-500">
          The team you are looking for might have been deleted or moved.
        </p>
      </div>
    );
  }

  const handleUpdateDescription = async (description: string) => {
    await updateTeam({ description });
  };

  const handleAddMembers = async (userIds: string[]) => {
    await assignMembers(userIds);
  };

  const handleAddRoles = async (roleIds: string[]) => {
    await assignRoles(roleIds);
  };

  const handleAddPolicies = async (policyIds: string[]) => {
    await assignPolicies(policyIds);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <TeamMembersTable
            members={members}
            isAdmin={isAdmin}
            onAddMember={handleAddMembers}
            onRemoveMember={removeMember}
            isLoading={isLoadingMembers || isPending}
          />
        );
      case "assets":
        return <TeamAssetsList assets={assets} isLoading={isLoadingAssets} />;
      case "roles":
        return (
          <TeamDetailsRoles
            roles={roles}
            isAdmin={isAdmin}
            onAssignRoles={handleAddRoles}
            onRemoveRole={removeRole}
            isLoading={isLoadingRoles || isPending}
          />
        );
      case "policies":
        return (
          <TeamDetailsPolicies
            policies={policies}
            isAdmin={isAdmin}
            onAttachPolicies={handleAddPolicies}
            onDetachPolicy={removePolicy}
            isLoading={isLoadingPolicies || isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-20">
      <TeamDetailsHeader
        team={team}
        isAdmin={isAdmin}
        isMember={isMember}
        onEdit={() => message.info("Feature coming soon")}
        onDelete={() => message.info("Feature coming soon")}
        onJoin={() => assignMembers([user?.id!])}
      />

      <TeamDetailsInfo
        team={team}
        isAdmin={isAdmin}
        onUpdateDescription={handleUpdateDescription}
      />

      <TeamDetailsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        counts={{
          users: members?.length || 0,
          assets: assets?.length || 0,
          roles: roles?.length || 0,
          policies: policies?.length || 0,
        }}
      />

      <div className="tab-content transition-all duration-300">
        {renderTabContent()}
      </div>
    </div>
  );
}
