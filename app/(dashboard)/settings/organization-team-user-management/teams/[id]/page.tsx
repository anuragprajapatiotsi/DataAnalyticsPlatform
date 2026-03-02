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
import { useAuthContext } from "@/context/auth-context";
import { Spin, message } from "antd";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeamDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuthContext();
  const isAdmin = !!(user?.is_admin || user?.is_global_admin);

  const {
    team,
    members,
    roles,
    policies,
    assets,
    isLoading,
    isError,
    addMember,
    removeMember,
  } = useTeamDetails(id);

  const [activeTab, setActiveTab] = useState<TeamTabKey>("users");

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

  const handleUpdateDescription = (description: string) => {
    // In a real app, this would call a mutation
    message.success("Description updated successfully (mock)");
    console.log("Updating description to:", description);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <TeamMembersTable
            members={members}
            isAdmin={isAdmin}
            onAddMember={() => message.info("Add Member modal would open here")}
            onRemoveMember={removeMember}
          />
        );
      case "assets":
        return <TeamAssetsList assets={assets} />;
      case "roles":
        return (
          <TeamDetailsRoles
            roles={roles}
            isAdmin={isAdmin}
            onAssignRole={() =>
              message.info("Assign Role modal would open here")
            }
            onRemoveRole={(id) => message.info(`Removing role ${id}`)}
          />
        );
      case "policies":
        return (
          <TeamDetailsPolicies
            policies={policies}
            isAdmin={isAdmin}
            onAttachPolicy={() =>
              message.info("Attach Policy modal would open here")
            }
            onDetachPolicy={(id) => message.info(`Detaching policy ${id}`)}
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
        onEdit={() => message.info("Edit Team modal would open here")}
        onDelete={() => message.info("Deleting team...")}
        onJoin={() => message.info("Joining team...")}
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
          users: members.length,
          assets: assets.length,
          roles: roles.length,
          policies: policies.length,
        }}
      />

      <div className="tab-content transition-all duration-300">
        {renderTabContent()}
      </div>
    </div>
  );
}
