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
    <div className="flex flex-col p-8 pb-20 animate-in fade-in duration-500">
      <RoleDetailsHeader role={role} isLoading={isLoadingRole} />

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="mb-8 bg-slate-100/50 p-1 rounded-xl h-12 w-fit">
          <TabsTrigger
            value="policies"
            active={activeTab === "policies"}
            onClick={() => setActiveTab("policies")}
            className="px-6 py-2 rounded-lg gap-2"
          >
            <Shield
              className={`h-4 w-4 ${activeTab === "policies" ? "text-blue-600" : "text-slate-400"}`}
            />
            Policies
          </TabsTrigger>
          <TabsTrigger
            value="users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            className="px-6 py-2 rounded-lg gap-2"
          >
            <User
              className={`h-4 w-4 ${activeTab === "users" ? "text-blue-600" : "text-slate-400"}`}
            />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            active={activeTab === "teams"}
            onClick={() => setActiveTab("teams")}
            className="px-6 py-2 rounded-lg gap-2"
          >
            <Users
              className={`h-4 w-4 ${activeTab === "teams" ? "text-blue-600" : "text-slate-400"}`}
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
