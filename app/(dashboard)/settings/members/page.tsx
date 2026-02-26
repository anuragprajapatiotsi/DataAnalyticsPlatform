"use client";

import React, { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AccessSelectionCards } from "@/components/settings/AccessSelectionCards";
import { OrganizationInfoCard } from "@/components/settings/OrganizationInfoCard";
import { OrganizationDescriptionCard } from "@/components/settings/OrganizationDescriptionCard";
import { TeamsSubGroupContent } from "@/components/settings/TeamsSubGroupContent";
import { UsersHeader } from "@/components/settings/UsersHeader";
import { UsersTable } from "@/components/settings/UsersTable";
import { AdminControlCards } from "@/components/settings/AdminControlCards";

export default function AccessManagementPage() {
  const [activeTab, setActiveTab] = useState("teams");

  const renderContent = () => {
    switch (activeTab) {
      case "teams":
        return (
          <div className="animate-in fade-in duration-300">
            <OrganizationInfoCard />
            <OrganizationDescriptionCard />
            <TeamsSubGroupContent />
          </div>
        );
      case "users":
        return (
          <div className="animate-in fade-in duration-300">
            <UsersHeader />
            <UsersTable />
          </div>
        );
      case "admin":
        return (
          <div className="animate-in fade-in duration-300">
            <AdminControlCards />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-8 custom-scrollbar">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/members">
                  Members
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {activeTab === "teams" && "Teams"}
                  {activeTab === "users" && "Users"}
                  {activeTab === "admin" && "Admins"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-8">
            <h1 className="text-[24px] font-bold text-slate-900 mb-1">
              Team & User Management
            </h1>
            <p className="text-[14px] text-slate-500">
              Streamline access to users and teams in OpenMetadata.
            </p>
          </div>
        </div>

        <AccessSelectionCards
          activeSection={activeTab}
          onSectionChange={setActiveTab}
        />

        <div className="mt-6 border-t border-slate-100 pt-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
