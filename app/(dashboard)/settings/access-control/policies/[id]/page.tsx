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
    <div className="flex flex-col p-8 pb-20 animate-in fade-in duration-500">
      <PolicyDetailsHeader policy={policy} isLoading={isLoadingPolicy} />

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="mb-8 bg-slate-100/50 p-1 rounded-xl h-12 w-fit">
          <TabsTrigger
            value="rules"
            active={activeTab === "rules"}
            onClick={() => setActiveTab("rules")}
            className="px-6 py-2 rounded-lg gap-2"
          >
            <Shield
              className={`h-4 w-4 ${
                activeTab === "rules" ? "text-blue-600" : "text-slate-400"
              }`}
            />
            Rules
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            active={activeTab === "teams"}
            onClick={() => setActiveTab("teams")}
            className="px-6 py-2 rounded-lg gap-2"
          >
            <Users
              className={`h-4 w-4 ${
                activeTab === "teams" ? "text-blue-600" : "text-slate-400"
              }`}
            />
            Teams
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            active={activeTab === "roles"}
            onClick={() => setActiveTab("roles")}
            className="px-6 py-2 rounded-lg gap-2"
          >
            <ShieldCheck
              className={`h-4 w-4 ${
                activeTab === "roles" ? "text-blue-600" : "text-slate-400"
              }`}
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
