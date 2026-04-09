"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/hooks/use-auth";
import { UserInfoCard } from "@/features/users/components/UserInfoCard";
import {
  UserTeamsTable,
  UserRolesTable,
  UserPoliciesTable,
} from "@/features/users/components/UserDetailTabs";
import { UserProfileForm } from "@/features/users/components/UserProfileForm";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import {
  Users,
  Shield,
  Lock,
  UserPen,
  Mail,
  Calendar,
  ChevronRight,
  Info,
  Building2,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Spin, Card, Divider, Badge, List, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/shared/api/auth";

export default function CurrentUserProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: orgs, isLoading: isOrgsLoading } = useQuery({
    queryKey: ["my-orgs"],
    queryFn: () => authApi.getMyOrgs(),
    enabled: !!user,
  });

  const isLoading = isAuthLoading || (isOrgsLoading && !orgs);

  if (isLoading && !user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spin size="large" className="text-blue-600" />
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Shield size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Profile not found</h2>
        <p className="text-slate-500 max-w-sm text-center">
          We couldn't retrieve your profile information. Please try logging in
          again to access your dashboard.
        </p>
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Adapter for existing components
  const mappedUser = user
    ? {
        ...user,
        last_login: user.last_login_at,
        description: user.description || "",
        teams: user.teams || [],
        roles: user.roles || [],
        policies: (user as any).policies || [],
      }
    : undefined;

  const teams = user?.teams || [];
  const roles = user?.roles || [];
  const policies = (user as any).policies || [];

  const breadcrumbItems = [
    {
      label: "Dashboard",
      href: "/",
    },
    { label: "Profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]/50">
      <div className="px-4 py-2 max-w-[1400px] mx-auto w-full">
        <PageHeader
          title="Profile"
          description="Manage your account settings, teams, roles, and assigned policies."
          breadcrumbItems={breadcrumbItems}
        />

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Profile Summary */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              {/* Profile Top Banner/Color */}
              <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-700" />

              <div className="px-5 pb-8 -mt-10">
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                    {user?.image && <AvatarImage src={user.image} />}
                    <AvatarFallback className="bg-slate-200 text-xl font-bold text-slate-600 uppercase">
                      {user?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="mt-4 text-center">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {user?.display_name || "User Name"}
                    </h2>
                    <div className="flex items-center justify-center gap-1.5 mt-1 text-slate-500">
                      <Mail size={12} />
                      <span className="text-[13px] font-medium">{user?.email}</span>
                    </div>
                  </div>
                </div>

                <Divider className="my-6 border-slate-100" />

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Statistics
                  </p>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors group cursor-default">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                          <Users size={14} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-600">
                          Teams
                        </span>
                      </div>
                      <span className="text-[15px] font-bold text-slate-900">
                        {teams.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors group cursor-default">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                          <Shield size={14} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-600">
                          Roles
                        </span>
                      </div>
                      <span className="text-[15px] font-bold text-slate-900">
                        {roles.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors group cursor-default">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                          <Lock size={14} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-600">
                          Policies
                        </span>
                      </div>
                      <span className="text-[15px] font-bold text-slate-900">
                        {policies.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  <Calendar size={12} className="flex-shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">
                    Joined on{" "}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                {orgs && orgs.length > 0 && (
                  <>
                    <Divider className="my-6 border-slate-100" />
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Current Organization
                      </p>
                      <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                          <Building2 size={18} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-bold text-slate-900 truncate">
                            {orgs.find(o => o.id === user?.org_id)?.name || "Default Org"}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 truncate uppercase tracking-wider">
                            {orgs.find(o => o.id === user?.org_id)?.slug || "primary"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            <Tabs className="w-full">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
                <TabsList className="flex items-center px-4 h-12 bg-white border-b border-slate-100 gap-1 mt-0">
                  <TabsTrigger
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 hover:bg-slate-50 select-none cursor-pointer"
                  >
                    <Info size={14} />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    active={activeTab === "teams"}
                    onClick={() => setActiveTab("teams")}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 hover:bg-slate-50 select-none cursor-pointer"
                  >
                    <Users size={14} />
                    Teams
                  </TabsTrigger>
                  <TabsTrigger
                    active={activeTab === "roles"}
                    onClick={() => setActiveTab("roles")}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 hover:bg-slate-50 select-none cursor-pointer"
                  >
                    <Shield size={14} />
                    Roles
                  </TabsTrigger>
                  <TabsTrigger
                    active={activeTab === "policies"}
                    onClick={() => setActiveTab("policies")}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 hover:bg-slate-50 select-none cursor-pointer"
                  >
                    <Lock size={14} />
                    Policies
                  </TabsTrigger>
                  <TabsTrigger
                    active={activeTab === "organizations"}
                    onClick={() => setActiveTab("organizations")}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600 hover:bg-slate-50 select-none cursor-pointer"
                  >
                    <Building2 size={14} />
                    Organizations
                  </TabsTrigger>
                  <div className="flex-1" />
                  <TabsTrigger
                    active={activeTab === "edit"}
                    onClick={() => setActiveTab("edit")}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 hover:bg-slate-50 select-none cursor-pointer border border-transparent data-[state=active]:border-blue-100 shadow-sm"
                  >
                    <UserPen size={14} />
                    Edit Profile
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="overview" activeValue={activeTab}>
                    <UserInfoCard
                      user={mappedUser as any}
                      isLoading={isLoading}
                    />
                  </TabsContent>

                  <TabsContent value="teams" activeValue={activeTab}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-800">
                          My Teams
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {teams.length} total
                        </span>
                      </div>
                      <UserTeamsTable
                        teams={teams as any}
                        isLoading={isLoading}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="roles" activeValue={activeTab}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-800">
                          My Roles
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {roles.length} total
                        </span>
                      </div>
                      <UserRolesTable
                        roles={roles as any}
                        isLoading={isLoading}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="policies" activeValue={activeTab}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-800">
                          Assigned Policies
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {policies.length} total
                        </span>
                      </div>
                      <UserPoliciesTable
                        policies={policies as any}
                        isLoading={isLoading}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="organizations" activeValue={activeTab}>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-800">
                            My Organizations
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            You are a member of {orgs?.length || 0} organizations.
                          </p>
                        </div>
                        <Tag color="blue" className="rounded-full px-3 py-0.5 font-semibold text-[11px] tracking-wider border-none bg-blue-50 text-blue-600">
                          Current Org: {orgs?.find(o => o.id === user?.org_id)?.name || "N/A"}
                        </Tag>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {orgs?.map((org) => (
                          <div 
                            key={org.id}
                            className={cn(
                              "p-4 rounded-xl border transition-all hover:shadow-md",
                              org.id === user?.org_id 
                                ? "bg-blue-50/30 border-blue-200 ring-1 ring-blue-100" 
                                : "bg-white border-slate-200 hover:border-slate-300"
                            )}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm",
                                  org.id === user?.org_id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                  <Building2 size={24} />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{org.name}</span>
                                    {org.id === user?.org_id && (
                                      <Badge 
                                        status="processing" 
                                        text={<span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Current</span>}
                                        className="bg-blue-100/50 px-2 py-0.5 rounded-full border border-blue-200"
                                      />
                                    )}
                                    {org.id === user?.default_org_id && (
                                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        <Star size={10} className="text-amber-500 fill-amber-500" />
                                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Default</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-[12px] text-slate-500 font-medium">@{org.slug}</span>
                                </div>
                              </div>
                              <div className="hidden sm:block text-right">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <Tag color={org.is_active ? "success" : "default"} className="m-0 rounded-lg text-[11px] font-bold uppercase tracking-wider px-2 border-0">
                                  {org.is_active ? "Active" : "Inactive"}
                                </Tag>
                              </div>
                            </div>
                            {org.description && (
                              <div className="mt-4 pt-4 border-t border-slate-100/50">
                                <p className="text-[13px] text-slate-600 leading-relaxed italic">
                                  "{org.description}"
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {!isOrgsLoading && (!orgs || orgs.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 text-2xl">
                            🏢
                          </div>
                          <p className="text-slate-900 font-bold text-center">No organizations found</p>
                          <p className="text-slate-500 text-sm text-center max-w-xs mt-1">
                            You are not currently a member of any organization.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="edit" activeValue={activeTab}>
                    <div className="py-2">
                       <UserProfileForm />
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
