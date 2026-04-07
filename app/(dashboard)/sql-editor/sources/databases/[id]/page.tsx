"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin } from "antd";
import { Database, Info, History, Bot as BotIcon } from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogPageLayout } from "@/shared/components/catalog/CatalogPageLayout";
import { DatabaseListTable } from "@/shared/components/catalog/DatabaseListTable";
import { ServiceEndpoint, DatabaseInfo } from "@/features/services/types";

export default function SqlEditorConnectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("databases");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [connData, dbData] = await Promise.all([
          serviceService.getServiceEndpoint(id),
          serviceService.getDatabases(id).catch(() => []),
        ]);
        setConnection(connData);
        setDatabases(dbData || []);
      } catch (err) {
        console.error("Failed to fetch connection details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const breadcrumbItems = [
    { label: "SQL Editor", href: "/sql-editor" },
    { label: "Sources", href: "/sql-editor/sources/databases" },
    { label: "Databases", href: "/sql-editor/sources/databases" },
    { label: connection?.service_name || "Connection Details" },
  ];

  const tabs = [
    { id: "databases", label: "Databases", icon: Database, count: databases.length },
    { id: "agents", label: "Agents", icon: BotIcon },
    { id: "agentRuns", label: "Agent Runs", icon: History },
    { id: "connection", label: "Connection", icon: Info },
  ];

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#FAFAFA]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium text-[13px]">Loading connection details...</p>
      </div>
    );
  }

  return (
    <CatalogPageLayout
      title={connection?.service_name || "Connection Details"}
      description="Explore and manage databases for this connection within the SQL Editor."
      breadcrumbItems={breadcrumbItems}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="p-4">
        {activeTab === "databases" ? (
          <DatabaseListTable
            databases={databases}
            loading={loading}
            onDatabaseClick={(db) =>
              router.push(`/sql-editor/sources/databases/${id}/${db.name}`)
            }
          />
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 italic text-[13px]">
            This tab's content is managed within the service management context.
          </div>
        )}
      </div>
      
    </CatalogPageLayout>
  );
}
