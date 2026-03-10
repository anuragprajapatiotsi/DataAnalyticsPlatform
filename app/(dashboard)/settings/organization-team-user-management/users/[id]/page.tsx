"use client";

import React, { useState, use } from "react";
import {
  useUserProfile,
  UserTabKey,
} from "@/features/users/hooks/useUserProfile";
import { UserProfileHeader } from "@/features/users/components/UserProfileHeader";
import { UserInfoCard } from "@/features/users/components/UserInfoCard";
import { ResetPasswordModal } from "@/features/users/components/ResetPasswordModal";
import {
  UserTeamsTable,
  UserRolesTable,
  UserPoliciesTable,
} from "@/features/users/components/UserDetailTabs";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import { Users, Shield, Lock } from "lucide-react";
import { Spin } from "antd";
import { useAuthContext } from "@/shared/contexts/auth-context";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const { user: currentUser } = useAuthContext();
  const isAdmin = !!(currentUser?.is_admin || currentUser?.is_global_admin);

  const [activeTab, setActiveTab] = useState<UserTabKey>("teams");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const {
    user,
    teams,
    roles,
    policies,
    isLoading,
    isLoadingTeams,
    isLoadingRoles,
    isLoadingPolicies,
    isError,
  } = useUserProfile(id, activeTab);

  if (isLoading && !user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || (!user && !isLoading)) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">User not found</h2>
        <p className="text-slate-500">
          The user you are looking for might have been deleted or moved.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 pb-20">
      <UserProfileHeader
        user={user}
        isLoading={isLoading}
        onResetPassword={isAdmin ? () => setIsResetModalOpen(true) : undefined}
      />

      <UserInfoCard user={user} isLoading={isLoading} />

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="mb-4 bg-slate-100/50 p-1 rounded-lg h-10 w-fit">
          <TabsTrigger
            value="teams"
            active={activeTab === "teams"}
            onClick={() => setActiveTab("teams")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-bold"
          >
            <Users
              size={16}
              className={
                activeTab === "teams" ? "text-blue-600" : "text-slate-400"
              }
            />
            Teams ({teams.length})
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            active={activeTab === "roles"}
            onClick={() => setActiveTab("roles")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-bold"
          >
            <Shield
              size={16}
              className={
                activeTab === "roles" ? "text-indigo-600" : "text-slate-400"
              }
            />
            Roles ({roles.length})
          </TabsTrigger>
          <TabsTrigger
            value="policies"
            active={activeTab === "policies"}
            onClick={() => setActiveTab("policies")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-bold"
          >
            <Lock
              size={16}
              className={
                activeTab === "policies" ? "text-emerald-600" : "text-slate-400"
              }
            />
            Policies ({policies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" activeValue={activeTab}>
          <UserTeamsTable
            teams={teams}
            isLoading={isLoadingTeams}
            userId={id}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="roles" activeValue={activeTab}>
          <UserRolesTable
            roles={roles}
            isLoading={isLoadingRoles}
            userId={id}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="policies" activeValue={activeTab}>
          <UserPoliciesTable
            policies={policies}
            isLoading={isLoadingPolicies}
          />
        </TabsContent>
      </Tabs>

      {user && (
        <ResetPasswordModal
          userId={user.id}
          userName={user.display_name}
          open={isResetModalOpen}
          onCancel={() => setIsResetModalOpen(false)}
        />
      )}
    </div>
  );
}
