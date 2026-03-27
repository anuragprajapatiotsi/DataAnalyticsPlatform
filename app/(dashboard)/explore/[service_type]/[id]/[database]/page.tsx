"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  Tabs,
  Input,
  Button,
  Switch,
  Space,
  Tooltip,
  Avatar,
  Spin,
  message,
  Card,
} from "antd";
import {
  Database,
  Search,
  Settings2,
  Edit2,
  LayoutDashboard,
  History,
  FileText,
  Table as TableIcon,
  Info,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { serviceService } from "@/features/services/services/service.service";
import { ServiceEndpoint, SchemaInfo } from "@/features/services/types";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

export default function SchemasExplorerPage() {
  const params = useParams();
  const router = useRouter();
  const {
    service_type: serviceType,
    id,
    database,
  } = params as {
    service_type: string;
    id: string;
    database: string;
  };

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
        console.error("Failed to fetch schemas:", err);
        message.error("Failed to load schemas.");
      } finally {
        setLoading(false);
      }
    }
    if (id && database) fetchData();
  }, [id, database]);

  const isDatabaseService = serviceType === "database" || serviceType === "databases";
  const serviceLabel = isDatabaseService ? "Database Services" : 
    (serviceType.charAt(0).toUpperCase() + serviceType.slice(1));

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: serviceLabel, href: `/explore/${serviceType}` },
    { label: database },
  ];

  const filteredSchemas = schemas.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns: ColumnsType<SchemaInfo> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text) => (
        <Space size="middle" className="group/name">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover/name:bg-blue-50 group-hover/name:border-blue-100 transition-colors">
            <LayoutDashboard
              size={18}
              className="text-slate-600 group-hover/name:text-blue-600"
            />
          </div>
          <span className="font-bold text-blue-600 group-hover/name:text-blue-600 transition-all">
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "40%",
      render: (text) => (
        <span className="text-slate-500 text-sm italic">
          {text || "No description provided."}
        </span>
      ),
    },
    {
      title: "Owners",
      dataIndex: "owners",
      key: "owners",
      width: "15%",
      render: (owners) => (
        <span className="text-slate-400 text-xs font-semibold">
          {owners && owners.length > 0 ? owners.join(", ") : "--"}
        </span>
      ),
    },
    {
      title: "Domains",
      dataIndex: "domains",
      key: "domains",
      width: "15%",
      render: (domains) => (
        <span className="text-slate-400 text-xs font-semibold">
          {domains && domains.length > 0 ? domains.join(", ") : "--"}
        </span>
      ),
    },
  ];

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-white">
        <Spin size="large" />
        <p className="text-slate-500 font-medium">Loading schema details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-4 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <Database size={24} className="text-blue-600" />
              </div>
              <PageHeader
                title={database}
                description="Explore and manage schemas for this database instance."
                breadcrumbItems={breadcrumbItems}
              />
            </div>

            {/* <div className="flex items-center gap-3">
              <Button
                icon={<Edit2 size={16} />}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-xs h-9 px-4 rounded-lg border border-slate-200"
              >
                Edit
              </Button>
              <Button
                type="text"
                icon={<Settings2 size={16} />}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-medium text-xs h-9 px-4 rounded-lg border border-slate-200"
              >
                Customize
              </Button>
            </div> */}
          </div>

          {/* Unified Tab Navigation */}
          <div className="flex gap-8 mt-2">
            {[
              { id: "schema", label: "Database Schema", icon: TableIcon },
              {
                id: "activity",
                label: "Activity Feeds & Tasks",
                icon: History,
              },
              { id: "contract", label: "Contract", icon: FileText },
              { id: "custom", label: "Custom Properties", icon: Settings2 },
            ].map((tab, idx) => (
              <div
                key={tab.id}
                className={cn(
                  "pb-3 text-sm font-semibold capitalize transition-all relative cursor-pointer",
                  idx === 0
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <div className="flex items-center gap-2 px-1">
                  <tab.icon size={14} />
                  {tab.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Schema Table Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Search & Actions Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <Input
                placeholder="Search for Schema"
                prefix={<Search size={16} className="text-slate-400 mr-2" />}
                className="max-w-md h-10 rounded-xl border-slate-200 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Deleted
                  </span>
                  <Switch size="small" className="bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Table */}
            <Table
              dataSource={filteredSchemas}
              columns={columns}
              rowKey="name"
              loading={loading}
              pagination={false}
              onRow={(record) => ({
                onClick: () =>
                  router.push(
                    `/explore/${serviceType}/${id}/${database}/${record.name}/objects`,
                  ),
                className:
                  "cursor-pointer transition-colors hover:bg-slate-50/80",
              })}
              className="custom-explore-table"
              locale={{
                emptyText: loading ? (
                  <Spin />
                ) : (
                  "No schemas available in this database."
                ),
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-explore-table .ant-table-thead > tr > th {
          background: #fcfdfe !important;
          color: #94a3b8 !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border_bottom: 1px solid #f1f5f9 !important;
          padding: 12px 24px !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 14px 24px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .custom-explore-table .ant-table-row:last-child > td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}
