"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, Input } from "antd";
import { Search, History, FileText, Settings2, Table as TableIcon } from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogPageLayout } from "@/shared/components/catalog/CatalogPageLayout";
import { SchemaListTable } from "@/shared/components/catalog/SchemaListTable";
import { ServiceEndpoint, SchemaInfo } from "@/features/services/types";

export default function SqlEditorSchemasExplorerPage() {
  const params = useParams();
  const router = useRouter();
  const { id, database } = params as { id: string; database: string };

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("schema");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [connData, schemaData] = await Promise.all([
          serviceService.getServiceEndpoint(id),
          serviceService.getSchemas(id, database).catch(() => []),
        ]);
        setConnection(connData);
        setSchemas(schemaData || []);
      } catch (err) {
        console.error("Failed to fetch schema details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id && database) fetchData();
  }, [id, database]);

  const breadcrumbItems = [
    { label: "SQL Editor", href: "/sql-editor" },
    { label: "Sources", href: "/sql-editor/sources/databases" },
    { label: "Databases", href: "/sql-editor/sources/databases" },
    { label: connection?.service_name || "Database", href: `/sql-editor/sources/databases/${id}` },
    { label: database },
  ];

  const tabs = [
    { id: "schema", label: "Database Schema", icon: TableIcon, count: schemas.length },
    { id: "activity", label: "Activity Feeds", icon: History },
    { id: "contract", label: "Contract", icon: FileText },
    { id: "custom", label: "Settings", icon: Settings2 },
  ];

  const toolbar = (
    <div className="flex-1 flex items-center gap-2 px-2">
      <Search size={16} className="text-slate-400" />
      <Input
        placeholder="Search schemas by name..."
        variant="borderless"
        className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );

  const filteredSchemas = schemas.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#FAFAFA]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium text-[13px]">Loading schema details...</p>
      </div>
    );
  }

  return (
    <CatalogPageLayout
      title={database}
      description="Explore and manage schemas for this database instance within the SQL Editor."
      breadcrumbItems={breadcrumbItems}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      toolbar={activeTab === "schema" ? toolbar : undefined}
    >
      <div className="p-4">
        {activeTab === "schema" ? (
          <SchemaListTable
            schemas={filteredSchemas}
            loading={loading}
            onSchemaClick={(record) =>
              router.push(`/sql-editor/sources/databases/${id}/${database}/${record.name}/objects`)
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
