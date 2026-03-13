"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { PolicyDetailsHeader } from "@/features/policies/components/details/PolicyDetailsHeader";
import { PolicyRulesTable } from "@/features/policies/components/details/PolicyRulesTable";
import { PolicyTeamsTable } from "@/features/policies/components/details/PolicyTeamsTable";
import { PolicyRolesTable } from "@/features/policies/components/details/PolicyRolesTable";
import { usePolicyDetails } from "@/features/policies/hooks/usePolicyDetails";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import { Shield, Users, ShieldCheck } from "lucide-react";

type TabValue = "rules" | "teams" | "roles";

export default function PolicyDetailPage() {
  const params = useParams();
  const policyId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabValue>("rules");

  const {
    policy,
    isLoadingPolicy,
    teams,
    isLoadingTeams,
    roles,
    isLoadingRoles,
  } = usePolicyDetails(policyId, {
    rulesEnabled: activeTab === "rules",
    teamsEnabled: activeTab === "teams",
    rolesEnabled: activeTab === "roles",
  });

  return (
    <div className="flex flex-col px-6 pt-2 pb-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto">
      <PolicyDetailsHeader policy={policy} isLoading={isLoadingPolicy} />

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="mb-6 bg-slate-100/50 p-1 rounded-lg h-10 w-fit">
          <TabsTrigger
            value="rules"
            active={activeTab === "rules"}
            onClick={() => setActiveTab("rules")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-semibold"
          >
            <Shield
              size={16}
              className={
                activeTab === "rules" ? "text-blue-600" : "text-slate-400"
              }
            />
            Rules
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
          <TabsTrigger
            value="roles"
            active={activeTab === "roles"}
            onClick={() => setActiveTab("roles")}
            className="px-4 py-2 rounded-md gap-2 text-[13px] font-semibold"
          >
            <ShieldCheck
              size={16}
              className={
                activeTab === "roles" ? "text-blue-600" : "text-slate-400"
              }
            />
            Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" activeValue={activeTab}>
          <PolicyRulesTable
            ruleName={policy?.rule_name}
            resource={policy?.resource}
            operations={policy?.operations}
            isLoading={isLoadingPolicy}
          />
        </TabsContent>

        <TabsContent value="teams" activeValue={activeTab}>
          <PolicyTeamsTable teams={teams || []} isLoading={isLoadingTeams} />
        </TabsContent>

        <TabsContent value="roles" activeValue={activeTab}>
          <PolicyRolesTable roles={roles || []} isLoading={isLoadingRoles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
