"use client";

import { Bell, Server, Users } from "lucide-react";

import { SettingsCard } from "@/components/dashboard/settings-card";

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto p-6 pb-20 custom-scrollbar animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 pl-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-2 text-slate-600 font-medium max-w-2xl">
            Ability to configure the OpenMetadata application to suit your
            needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SettingsCard
            title="Services"
            description="Set up connectors and ingest metadata from diverse sources."
            icon={Server}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
          />
          <SettingsCard
            title="Notifications"
            description="Set up notifications to receive real-time updates."
            icon={Bell}
            iconBgClass="bg-emerald-50"
            iconColorClass="text-emerald-600"
          />
          <SettingsCard
            title="Team & User Management"
            description="Streamline access to users and teams in OpenMetadata."
            icon={Users}
            iconBgClass="bg-pink-50"
            iconColorClass="text-pink-600"
            href="/settings/members"
          />
        </div>
      </div>
    </div>
  );
}
