"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  Input,
  Switch,
  Spin,
  message,
  Tooltip,
  Button
} from "antd";
import {
  Database,
  Search,
  Settings2,
  LayoutDashboard,
  History,
  FileText,
  Table as TableIcon,
  ChevronRight,
  ArrowRight,
  User,
  Globe
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
  const serviceLabel = isDatabaseService ? "Database" : 
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
      width: "25%",
      render: (text) => (
        <div className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50/50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-200">
            <LayoutDashboard size={14} />
          </div>
          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {text}
          </span>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text) => (
        <span className="text-slate-500 text-[13px] line-clamp-2">
          {text || "No description provided."}
        </span>
      ),
    },
    {
      title: "Owners",
      dataIndex: "owners",
      key: "owners",
      width: "15%",
      render: (owners: string[]) => (
        owners && owners.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {owners.map(owner => (
              <div key={owner} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium">
                <User size={10} className="text-slate-400" />
                <span className="truncate max-w-[100px]">{owner}</span>
              </div>
            ))}
          </div>
        ) : <span className="text-slate-400 text-[13px]">—</span>
      ),
    },
    {
      title: "Domains",
      dataIndex: "domains",
      key: "domains",
      width: "15%",
      render: (domains: string[]) => (
        domains && domains.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {domains.map(domain => (
              <div key={domain} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium">
                <Globe size={10} className="text-slate-400" />
                <span className="truncate max-w-[100px]">{domain}</span>
              </div>
            ))}
          </div>
        ) : <span className="text-slate-400 text-[13px]">—</span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: (_, record) => (
        <Tooltip title="View Schema Objects">
          <Button
            type="text"
            className="flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            icon={<ArrowRight size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/explore/${serviceType}/${id}/${database}/${record.name}/objects`);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#FAFAFA]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium text-[13px]">Loading schema details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl border border-blue-100">
                <Database size={20} className="text-blue-600" />
              </div>
              <PageHeader
                title={database}
                description="Explore and manage schemas for this database instance."
                breadcrumbItems={breadcrumbItems}
              />
            </div>
          </div>

          {/* Unified Tab Navigation */}
          <div className="flex gap-8 mt-2">
            {[
              { id: "schema", label: "Database Schema", icon: TableIcon },
              { id: "activity", label: "Activity Feeds", icon: History },
              { id: "contract", label: "Contract", icon: FileText },
              { id: "custom", label: "Settings", icon: Settings2 },
            ].map((tab, idx) => (
              <div
                key={tab.id}
                className={cn(
                  "pb-3 text-[13px] font-semibold transition-all relative cursor-pointer flex items-center gap-2",
                  idx === 0
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300",
                )}
              >
                <tab.icon size={14} className={idx === 0 ? "text-blue-600" : "text-slate-400"} />
                {tab.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-4">
          
          {/* Unified Toolbar */}
          <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
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
            
            <div className="flex items-center gap-3 pr-2 border-l border-slate-100 pl-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Show Deleted
              </span>
              <Switch size="small" className="bg-slate-200 hover:bg-slate-300" />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
            <Table
              dataSource={filteredSchemas}
              columns={columns}
              rowKey="name"
              loading={loading}
              pagination={false}
              onRow={(record) => ({
                onClick: () =>
                  router.push(`/explore/${serviceType}/${id}/${database}/${record.name}/objects`),
                className: "cursor-pointer",
              })}
              className="custom-explore-table"
              locale={{
                emptyText: loading ? (
                  <Spin className="my-8" />
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                    <Database size={32} className="text-slate-300 mb-3" />
                    <span className="text-[14px] font-medium text-slate-700">No schemas found</span>
                    <span className="text-[13px]">Try adjusting your search query.</span>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Modern Table "Ghost" Styles */
        .custom-explore-table .ant-table {
          background: transparent !important;
        }
        .custom-explore-table .ant-table-thead > tr > th {
          background: #FAFAFA !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #E2E8F0 !important;
          padding: 12px 24px !important;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .custom-explore-table .ant-table-thead > tr > th::before {
          display: none !important; /* Remove Antd default column separators */
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
        /* Custom scrollbar for the table */
        .custom-explore-table .ant-table-body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-explore-table .ant-table-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-explore-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .custom-explore-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
}