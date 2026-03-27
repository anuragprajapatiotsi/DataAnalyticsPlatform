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
  Badge,
  Tag,
} from "antd";
import {
  Database,
  Search,
  Settings2,
  Edit2,
  Table as TableIcon,
  PlaySquare,
  History,
  FileText,
  Info,
  ChevronRight,
  User,
  Tags,
  Shield,
  Clock,
  CheckCircle2,
  Activity,
  GitBranch,
  Eye,
  Plus,
  Star,
  Columns,
  Hash,
  Type,
  Key,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { serviceService } from "@/features/services/services/service.service";
import {
  ServiceEndpoint,
  DBTableDetail,
  ColumnInfo,
} from "@/features/services/types";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

export default function TableDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const {
    service_type: serviceType,
    id,
    database,
    schema,
    table,
  } = params as {
    service_type: string;
    id: string;
    database: string;
    schema: string;
    table: string;
  };

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [tableDetail, setTableDetail] = useState<DBTableDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [connData, detailData] = await Promise.all([
          serviceService.getServiceEndpoint(id),
          serviceService
            .getTableDetail(id, database, schema, table)
            .catch(() => null),
        ]);
        setConnection(connData);
        setTableDetail(detailData);
      } catch (err) {
        console.error("Failed to fetch table details:", err);
        message.error("Failed to load columns.");
      } finally {
        setLoading(false);
      }
    }
    if (id && database && schema && table) fetchData();
  }, [id, database, schema, table]);

  const isDatabaseService =
    serviceType === "database" || serviceType === "databases";
  const serviceLabel = isDatabaseService
    ? "Database Services"
    : serviceType.charAt(0).toUpperCase() + serviceType.slice(1);

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: serviceLabel, href: `/explore/${serviceType}` },
    { label: database, href: `/explore/${serviceType}/${id}/${database}` },
    {
      label: schema,
      href: `/explore/${serviceType}/${id}/${database}/${schema}/objects`,
    },
    { label: table },
  ];

  const filteredColumns =
    tableDetail?.columns?.filter((col) =>
      col.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const columns: ColumnsType<ColumnInfo> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (text, record) => (
        <Space size="middle" className="group/name">
          <div className="flex items-center gap-2">
            {record.ordinal_position === 1 ? (
              <Tooltip title="Primary Key">
                <Key size={14} className="text-slate-500 fill-slate-50" />
              </Tooltip>
            ) : (
              <Columns size={14} className="text-slate-300" />
            )}
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 group-hover/name:text-blue-600 transition-colors">
                {text}
              </span>
              {!record.is_nullable && (
                <span className="text-[9px] text-slate-500/80 font-bold uppercase tracking-tighter flex items-center gap-1">
                  Not Null
                </span>
              )}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "data_type",
      key: "data_type",
      width: "15%",
      render: (text) => {
        return (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 font-bold px-2 py-0.5">
              {text}
            </span>
          </div>
        );
      },
    },
    {
      title: "Constraint",
      key: "constraint",
      width: "10%",
      render: (_, record) => (
        <span className="text-[14px] font-bold text-slate-800 uppercase">
          {record.ordinal_position === 1 ? (
            <span className="text-[14px] uppercase font-slate-900 border-none m-0 px-2 shadow-sm">
              PK
            </span>
          ) : (
            "--"
          )}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (text) => (
        <span className="text-slate-500 text-sm italic">
          {text || "No Description"}
        </span>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "12%",
      render: (tags) => (
        <Button
          type="text"
          size="small"
          icon={<Plus size={12} />}
          className="text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-wider"
        >
          Add
        </Button>
      ),
    },
    {
      title: "Glossary Terms",
      dataIndex: "glossary_terms",
      key: "glossary_terms",
      width: "13%",
      render: () => (
        <Button
          type="text"
          size="small"
          icon={<Plus size={12} />}
          className="text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-wider"
        >
          Add
        </Button>
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
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 relative">
                <TableIcon size={24} className="text-emerald-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <PageHeader
                  title={table}
                  description={`Standard ${schema} schema table definitions.`}
                  breadcrumbItems={breadcrumbItems}
                />
              </div>
            </div>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-6 mt-2">
            {[
              {
                id: "columns",
                label: "Columns",
                icon: Info,
                count: tableDetail?.columns?.length,
              },
              // {
              //   id: "activity",
              //   label: "Activity Feeds & Tasks",
              //   icon: History,
              // },
              // { id: "sample", label: "Sample Data", icon: TableIcon },
              // { id: "queries", label: "Queries", icon: PlaySquare },
              // {
              //   id: "observability",
              //   label: "Data Observability",
              //   icon: Activity,
              // },
              // { id: "lineage", label: "Lineage", icon: GitBranch },
              // { id: "contract", label: "Contract", icon: FileText },
              // { id: "custom", label: "Custom Properties", icon: Settings2 },
            ].map((tab, idx) => (
              <div
                key={tab.id}
                className={cn(
                  "pb-2 text-[13px] font-bold capitalize transition-all relative cursor-pointer",
                  idx === 0
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <div className="flex items-center gap-1.5 px-0.5">
                  <tab.icon size={13} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[9px] rounded-md border border-slate-100 font-black tracking-tighter shadow-sm">
                      {tab.count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Columns Table Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Search & Actions Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <Input
                placeholder="Find in table"
                prefix={<Search size={16} className="text-slate-400 mr-2" />}
                className="max-w-md h-10 rounded-xl border-slate-200 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table */}
            <Table
              dataSource={filteredColumns}
              columns={columns}
              rowKey="name"
              loading={loading}
              pagination={false}
              className="custom-explore-table"
              locale={{
                emptyText: loading ? (
                  <Spin />
                ) : (
                  "No columns available in this table."
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
          border-bottom: 1px solid #f1f5f9 !important;
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
