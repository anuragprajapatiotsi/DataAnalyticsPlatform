"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, Input } from "antd";
import { Search, History, FileText, Settings2, Table as TableIcon, PlaySquare } from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogPageLayout } from "@/shared/components/catalog/CatalogPageLayout";
import { ObjectListTable } from "@/shared/components/catalog/ObjectListTable";
import { ServiceEndpoint, DBObjectInfo } from "@/features/services/types";

export default function SqlEditorSchemaObjectsPage() {
  const params = useParams();
  const router = useRouter();
  const { id, database, schema } = params as { id: string; database: string; schema: string };

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [objects, setObjects] = useState<DBObjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tables");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [connData, objectData] = await Promise.all([
          serviceService.getServiceEndpoint(id),
          serviceService.getDBObjects(id, database, schema).catch(() => []),
        ]);
        setConnection(connData);
        setObjects(objectData || []);
      } catch (err) {
        console.error("Failed to fetch object details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id && database && schema) fetchData();
  }, [id, database, schema]);

  const breadcrumbItems = [
    { label: "SQL Editor", href: "/sql-editor" },
    { label: "Sources", href: "/sql-editor/sources/databases" },
    { label: "Databases", href: "/sql-editor/sources/databases" },
    { label: connection?.service_name || "Database", href: `/sql-editor/sources/databases/${id}` },
    { label: database, href: `/sql-editor/sources/databases/${id}/${database}` },
    { label: schema },
  ];

  const tabs = [
    { id: "tables", label: "Tables", icon: TableIcon, count: objects.length },
    { id: "procedures", label: "Stored Procedures", icon: PlaySquare },
    { id: "activity", label: "Activity Feeds", icon: History },
    { id: "contract", label: "Contract", icon: FileText },
    { id: "custom", label: "Settings", icon: Settings2 },
  ];

  const toolbar = (
    <div className="flex-1 flex items-center gap-2 px-2">
      <Search size={16} className="text-slate-400" />
      <Input
        placeholder="Search tables by name..."
        variant="borderless"
        className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );

  const filteredObjects = objects.filter((obj) =>
    obj.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#FAFAFA]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium text-[13px]">Loading table details...</p>
      </div>
    );
  }

  return (
    <CatalogPageLayout
      title={schema}
      description={`Explore and manage tables within the ${schema} schema in the SQL Editor.`}
      breadcrumbItems={breadcrumbItems}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      toolbar={activeTab === "tables" ? toolbar : undefined}
    >
      <div className="p-4">
        {activeTab === "tables" ? (
          <ObjectListTable
            objects={filteredObjects}
            loading={loading}
            onObjectClick={(record) =>
              router.push(`/sql-editor/sources/databases/${id}/${database}/${schema}/${record.name}`)
            }
            onViewDetails={(record) =>
              router.push(`/sql-editor/sources/databases/${id}/${database}/${schema}/${record.name}`)
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
