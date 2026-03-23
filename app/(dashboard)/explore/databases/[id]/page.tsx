"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  Avatar,
  Button,
  Spin,
  Empty,
  Alert,
  Tooltip,
  Space,
  Badge,
  Descriptions,
} from "antd";
import {
  Database,
  Settings2,
  LayoutDashboard,
  Bot,
  Info,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  Zap
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ServiceEndpoint, DatabaseInfo } from "@/features/services/types";
import { cn } from "@/shared/utils/cn";
import { getIcon } from "@/shared/utils/icon-mapper";
import type { ColumnsType } from "antd/es/table";

type TabType = "insights" | "databases" | "agents" | "connection";

export default function ConnectionDetailPage() {
  console.log("Rendering ConnectionDetailPage - Tabbed UI");
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("databases");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [connData, dbData] = await Promise.all([
          serviceService.getServiceEndpoint(id),
          serviceService.getDatabases(id),
        ]);
        setConnection(connData);
        setDatabases(dbData || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load connection details.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: "Databases", href: "/explore/databases" },
    { label: connection?.service_name || "Connection" },
  ];

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-white">
        <Spin size="large" />
        <p className="text-slate-500 font-medium">
          Loading connection details...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="px-6 pt-4 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <PageHeader
              title={connection?.service_name || "Connection Details"}
              description={`Manage and explore databases for this connection.`}
              breadcrumbItems={breadcrumbItems}
            />
            <Button
              type="text"
              icon={<Settings2 size={16} />}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-medium text-xs h-9 px-4 rounded-lg border border-slate-200"
            >
              Customize
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-transparent">
            {(
              ["insights", "databases", "agents", "connection"] as TabType[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-sm font-semibold capitalize transition-all relative",
                  activeTab === tab
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <div className="flex items-center gap-2">
                  {tab === "insights" && <LayoutDashboard size={14} />}
                  {tab === "databases" && <Database size={14} />}
                  {tab === "agents" && <Bot size={14} />}
                  {tab === "connection" && <Info size={14} />}
                  {tab}
                  {tab === "databases" && databases.length > 0 && (
                    <Badge
                      count={databases.length}
                      className="ml-1 custom-badge"
                      style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
                    />
                  )}
                </div>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-in fade-in slide-in-from-bottom-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-6"
            />
          )}

          <div className="animate-in fade-in slide-in-from-top-2 duration-400">
            {activeTab === "insights" && <InsightsTabView />}
            {activeTab === "databases" && (
              <DatabasesTabView
                databases={databases}
                loading={loading}
                onTableClick={(dbName) =>
                  router.push(`/explore/databases/${id}/${dbName}`)
                }
              />
            )}
            {activeTab === "agents" && <AgentsTabView />}
            {activeTab === "connection" && (
              <ConnectionTabView connection={connection} />
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-badge .ant-badge-count {
          background-color: #f1f5f9;
          color: #64748b;
          box-shadow: none;
          font-size: 10px;
          height: 18px;
          line-height: 18px;
          min-width: 18px;
          padding: 0 6px;
        }
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
          padding: 16px 24px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
      `}</style>
    </div>
  );
}

// --- Tab Sub-Components ---

function InsightsTabView() {
  const cards = [
    {
      title: "Description Coverage",
      value: "84%",
      icon: Info,
      color: "blue",
      trend: "+2%",
    },
    {
      title: "PII Coverage",
      value: "92%",
      icon: ShieldCheck,
      color: "emerald",
      trend: "0%",
    },
    {
      title: "Tier Coverage",
      value: "76%",
      icon: LayoutDashboard,
      color: "indigo",
      trend: "+5%",
    },
    {
      title: "Ownership Coverage",
      value: "100%",
      icon: Bot,
      color: "rose",
      trend: "stable",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-2 rounded-lg bg-${card.color}-50 text-${card.color}-600`}
            >
              <card.icon size={20} />
            </div>
            <span
              className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded-full border",
                card.trend.includes("+")
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-slate-50 text-slate-500 border-slate-200",
              )}
            >
              {card.trend}
            </span>
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            {card.title}
          </h4>
          <p className="text-2xl font-black text-slate-900">{card.value}</p>
        </div>
      ))}

      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-12 text-center mt-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Health Metrics coming soon
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
          This dashboard will provide deep insights into your data quality,
          documentation health, and governance across all databases in this
          connection.
        </p>
      </div>
    </div>
  );
}

function DatabasesTabView({
  databases,
  loading,
  onTableClick,
}: {
  databases: DatabaseInfo[];
  loading: boolean;
  onTableClick: (name: string) => void;
}) {
  const columns: ColumnsType<DatabaseInfo> = [
    {
      title: "Database Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text) => (
        <Space size="middle" className="group/name">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover/name:bg-blue-50 group-hover/name:border-blue-100 transition-colors">
            <Database
              size={18}
              className="text-slate-600 group-hover/name:text-blue-600"
            />
          </div>
          <span className="font-bold text-blue-600 group-hover/name:text-blue-600 cursor-pointer">
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
        <Tooltip title={text}>
          <span className="text-slate-500 text-sm line-clamp-1 max-w-sm">
            {text || "Explore tables and schemas in this database."}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "15%",
      render: (type) => (
        <span className="text-slate-600 text-sm capitalize">
          {type || "Database"}
        </span>
      ),
    },
    {
      title: "Owners",
      key: "owners",
      width: "15%",
      render: (record) => (
        <div className="flex -space-x-2">
          <Avatar
            size="small"
            className="border-2 border-white bg-blue-600 font-bold text-[10px]"
          >
            A
          </Avatar>
          <Avatar
            size="small"
            className="border-2 border-white bg-indigo-500 font-bold text-[10px]"
          >
            DE
          </Avatar>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Table
        dataSource={databases}
        columns={columns}
        rowKey="name"
        loading={loading}
        pagination={false}
        onRow={(record) => ({
          onClick: () => onTableClick(record.name),
          className: "cursor-pointer transition-colors hover:bg-slate-50/80",
        })}
        className="custom-explore-table"
        locale={{
          emptyText: (
            <Empty
              image={<Database className="mx-auto text-slate-200" size={48} />}
              description="No databases found in this connection."
            />
          ),
        }}
      />
    </div>
  );
}

function ConnectionTabView({
  connection,
}: {
  connection: ServiceEndpoint | null;
}) {
  if (!connection) return null;

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="space-y-10">
        {/* Core Info */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Info size={18} className="text-blue-600" />
            Basic Configuration
          </h3>
          <Descriptions column={2} className="custom-descriptions">
            <Descriptions.Item label="Service Name">
              <span className="font-bold text-slate-800">
                {connection.service_name}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="API Base URL">
              <span className="font-mono text-slate-600 text-[13px] bg-slate-50 px-2 py-1 rounded border border-slate-100">
                {connection.base_url}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Internal Connection">
              {connection.internal_connection ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck size={12} /> Yes
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  Regular
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock size={14} />
                {new Date(connection.created_at).toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              <p className="text-slate-600 italic leading-relaxed">
                "
                {connection.description ||
                  "No service-level description provided."}
                "
              </p>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Technical Details */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Settings2 size={18} className="text-slate-400" />
            Technical Details (Extra Config)
          </h3>
          <Descriptions column={2}>
            {Object.entries(connection.extra || {}).map(([key, value]) => (
              <Descriptions.Item
                key={key}
                label={key.replace("_", " ").toUpperCase()}
              >
                <span className="text-slate-700 font-medium">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      </div>
    </div>
  );
}

function AgentsTabView() {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-24 text-center">
      <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
        <Bot size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        AI Agents Feature Coming Soon
      </h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-8">
        Connect intelligent agents to this data source to automate insights,
        data cleaning, and proactive alerting.
      </p>
      <Button disabled size="large" className="rounded-xl font-bold px-8">
        Coming in Q3
      </Button>
    </div>
  );
}
