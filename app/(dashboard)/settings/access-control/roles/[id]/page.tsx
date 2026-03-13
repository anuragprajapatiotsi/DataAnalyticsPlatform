"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { RoleDetailsHeader } from "@/features/roles/components/details/RoleDetailsHeader";
import { RolePoliciesTable } from "@/features/roles/components/details/RolePoliciesTable";
import { RoleUsersTable } from "@/features/roles/components/details/RoleUsersTable";
import { RoleTeamsTable } from "@/features/roles/components/details/RoleTeamsTable";
import { useRoleDetails } from "@/features/roles/hooks/useRoleDetails";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import { Shield, User, Users } from "lucide-react";

type TabValue = "policies" | "users" | "teams";

export default function RoleDetailPage() {
  const params = useParams();
  const roleId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabValue>("policies");
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  const {
    role,
    isLoadingRole,
    policies,
    isLoadingPolicies,
    users,
    isLoadingUsers,
    teams,
    isLoadingTeams,
    allPolicies,
    isLoadingAllPolicies,
    attachPolicies,
    isAttaching,
    detachPolicy,
    isDetaching,
    unassignUser,
    isUnassigning,
  } = useRoleDetails(roleId, {
    policiesEnabled: activeTab === "policies",
    usersEnabled: activeTab === "users",
    teamsEnabled: activeTab === "teams",
    fetchAllPolicies: isPolicyModalOpen,
  });

  return (
    <div className="flex flex-col px-6 pt-2 pb-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto">
      <RoleDetailsHeader role={role} isLoading={isLoadingRole} />

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="mb-6 bg-slate-100/50 p-1 rounded-lg h-10 w-fit">
          <TabsTrigger
            value="policies"
            active={activeTab === "policies"}
            onClick={() => setActiveTab("policies")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-semibold"
          >
            <Shield
              size={16}
              className={
                activeTab === "policies" ? "text-blue-600" : "text-slate-400"
              }
            />
            Policies
          </TabsTrigger>
          <TabsTrigger
            value="users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-semibold"
          >
            <User
              size={16}
              className={
                activeTab === "users" ? "text-blue-600" : "text-slate-400"
              }
            />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            active={activeTab === "teams"}
            onClick={() => setActiveTab("teams")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-semibold"
          >
            <Users
              size={16}
              className={
                activeTab === "teams" ? "text-blue-600" : "text-slate-400"
              }
            />
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" activeValue={activeTab}>
          <RolePoliciesTable
            policies={policies || []}
            isLoading={isLoadingPolicies}
            allPolicies={allPolicies}
            isLoadingAllPolicies={isLoadingAllPolicies}
            isPolicyModalOpen={isPolicyModalOpen}
            setIsPolicyModalOpen={setIsPolicyModalOpen}
            onAddPolicies={attachPolicies}
            isAttaching={isAttaching}
            onDetachPolicy={detachPolicy}
            isDetaching={isDetaching}
          />
        </TabsContent>

        <TabsContent value="users" activeValue={activeTab}>
          <RoleUsersTable
            users={users || []}
            isLoading={isLoadingUsers}
            onUnassignUser={unassignUser}
            isUnassigning={isUnassigning}
          />
        </TabsContent>

        <TabsContent value="teams" activeValue={activeTab}>
          <RoleTeamsTable teams={teams || []} isLoading={isLoadingTeams} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
