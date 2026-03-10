"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/hooks/use-auth";
import { UserProfileHeader } from "@/features/users/components/UserProfileHeader";
import { UserInfoCard } from "@/features/users/components/UserInfoCard";
import {
  UserTeamsTable,
  UserRolesTable,
  UserPoliciesTable,
} from "@/features/users/components/UserDetailTabs";
import { UserProfileForm } from "@/features/users/components/UserProfileForm";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import { Users, Shield, Lock, UserPen } from "lucide-react";
import { Spin } from "antd";

export default function CurrentUserProfilePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("teams");

  if (isLoading && !user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Profile not found</h2>
        <p className="text-slate-500">
          We couldn't retrieve your profile information. Please try logging in
          again.
        </p>
      </div>
    );
  }

  // Adapter for existing components that expect AdminUser type
  const mappedUser = user
    ? {
        ...user,
        last_login: user.last_login_at,
        description: user.description || "",
        teams: user.teams || [],
        roles: user.roles || [],
        // Policies might be missing in auth/me, ensuring it's an array
        policies: (user as any).policies || [],
      }
    : undefined;

  const teams = user?.teams || [];
  const roles = user?.roles || [];
  const policies = (user as any).policies || [];
  const profileBreadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "My Profile" },
  ];

  return (
    <div className="flex flex-col px-6 py-6  space-y-6 animate-in fade-in duration-500 pb-20">
      <UserProfileHeader
        user={mappedUser as any}
        isLoading={isLoading}
        breadcrumbItems={profileBreadcrumbs}
      />

      <UserInfoCard user={mappedUser as any} isLoading={isLoading} />

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="mb-6 bg-slate-100/50 p-1 rounded-lg h-10 w-fit">
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
          <TabsTrigger
            value="edit"
            active={activeTab === "edit"}
            onClick={() => setActiveTab("edit")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-bold"
          >
            <UserPen
              size={16}
              className={
                activeTab === "edit" ? "text-blue-600" : "text-slate-400"
              }
            />
            Edit Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" activeValue={activeTab}>
          <UserTeamsTable teams={teams as any} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="roles" activeValue={activeTab}>
          <UserRolesTable roles={roles as any} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="policies" activeValue={activeTab}>
          <UserPoliciesTable policies={policies as any} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="edit" activeValue={activeTab}>
          <UserProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
