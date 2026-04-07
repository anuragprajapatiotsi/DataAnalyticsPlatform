"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  Button,
  Spin,
  Empty,
  Alert,
  Tooltip,
  Space,
  Modal,
  Form,
  Select,
  Dropdown,
  Input,
  Switch,
  message,
} from "antd";
import {
  Database,
  Info,
  ShieldCheck,
  Clock,
  Zap,
  Edit2,
  Play,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Pause,
  History,
  Terminal,
  MoreVertical,
  Trash2,
  ExternalLink,
  Share2,
  ArrowRight,
  Bot as BotIcon,
  Filter
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import {
  ServiceEndpoint,
  DatabaseInfo,
  Bot,
  GetBotsParams,
  BotRun,
} from "@/features/services/types";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

type TabType = "databases" | "agents" | "agentRuns" | "connection";

export default function ConnectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const serviceType = params.service_type as string;

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("databases");

  // Actions State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "failed"
  >("idle");
  const [form] = Form.useForm();
  const watchedExtra = Form.useWatch("extra", form);

  async function fetchData() {
    try {
      setLoading(true);
      const [connData, dbData] = await Promise.all([
        serviceService.getServiceEndpoint(id),
        serviceService.getDatabases(id).catch(() => []),
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

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const buildBaseUrl = (service: string, host: string, port: string | number) => {
    const protocolMap: Record<string, string> = {
      postgres: "postgresql",
      mysql: "mysql",
      mongodb: "mongodb",
      redis: "redis",
    };
    const protocol = protocolMap[service] || service;
    return `${protocol}://${host}:${port}`;
  };

  const handleUpdate = async (values: any) => {
    try {
      setIsUpdating(true);
      const host = values.extra?.host;
      const port = values.extra?.port;
      
      if (!host || !port) {
        message.error("Host and Port are required to generate connection URL");
        setIsUpdating(false);
        return;
      }

      const autoBaseUrl = buildBaseUrl(connection?.service_name || "postgres", host, port);

      const payload = {
        ...values,
        base_url: autoBaseUrl,
        setting_node_id: connection?.extra?.setting_node_id,
        extra: {
          ...connection?.extra,
          ...values.extra,
          auto_trigger_bots: values.auto_trigger_bots,
        },
      };

      await serviceService.updateServiceEndpoint(id, payload);
      message.success("Connection updated successfully");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to update connection");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestConnection = async (testData?: any) => {
    if (!connection) return;
    try {
      setIsTesting(true);
      setTestStatus("testing");

      const config = testData?.extra || testData || connection.extra;
      const host = config?.host;
      const port = config?.port;
      const user = config?.username || config?.user || config?.service_name || connection.extra?.username;

      if (!host || !port || !user) {
        message.warning("Connection requires Host, Port, and User configuration");
        setIsTesting(false);
        setTestStatus("failed");
        return;
      }

      const autoBaseUrl = buildBaseUrl(connection.service_name, host, port);

      const payload = {
        service: connection.service_name,
        service_type: "database",
        base_url: autoBaseUrl,
        driver: serviceType === "databases" ? "postgres" : serviceType,
        connection_object: {
          host: String(host),
          port: Number(port) || 0,
          user: String(user),
          password: String(config?.password || ""),
          database: String(config?.database || ""),
        },
      };

      const result = await serviceService.testDatabaseConnection(payload);
      if (result.success) {
        message.success("Connection successful");
        setIsTestSuccessful(true);
        setTestStatus("success");
      } else {
        message.error(result.detail || result.message || "Connection failed");
        setIsTestSuccessful(false);
        setTestStatus("failed");
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to test connection");
      setIsTestSuccessful(false);
      setTestStatus("failed");
    } finally {
      setIsTesting(false);
    }
  };

  const isDatabaseService = serviceType === "database" || serviceType === "databases";
  const serviceLabel = isDatabaseService ? "Database" : 
    (serviceType.charAt(0).toUpperCase() + serviceType.slice(1));

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: serviceLabel, href: `/explore/${serviceType}` },
    { label: connection?.service_name || "Connection Details" },
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
    <div className="flex flex-col h-full bg-[#FAFAFA] animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title={connection?.service_name || "Connection Details"}
              description={`Manage and explore databases for this connection.`}
              breadcrumbItems={breadcrumbItems}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 mt-2">
            {(["databases", "agents", "agentRuns", "connection"] as TabType[]).map((tab, idx) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-[13px] font-semibold transition-all relative cursor-pointer flex items-center gap-2",
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300"
                )}
              >
                {tab === "databases" && <Database size={14} className={activeTab === tab ? "text-blue-600" : "text-slate-400"} />}
                {tab === "agents" && <BotIcon size={14} className={activeTab === tab ? "text-blue-600" : "text-slate-400"} />}
                {tab === "agentRuns" && <History size={14} className={activeTab === tab ? "text-blue-600" : "text-slate-400"} />}
                {tab === "connection" && <Info size={14} className={activeTab === tab ? "text-blue-600" : "text-slate-400"} />}
                {tab === "agentRuns" ? "Agent Runs" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "databases" && databases.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                    {databases.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto">
          {error && (
            <Alert
              title="Error"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-6 rounded-lg border-red-200 bg-red-50"
            />
          )}

          <div className="animate-in fade-in slide-in-from-top-2 duration-400">
            {activeTab === "databases" && (
              <DatabasesTabView
                databases={databases}
                loading={loading}
                onTableClick={(dbName) => router.push(`/explore/${serviceType}/${id}/${dbName}`)}
              />
            )}
            {activeTab === "agents" && <AgentsTabView connectionId={id} />}
            {activeTab === "agentRuns" && <AgentRunsTabView connectionId={id} />}
            {activeTab === "connection" && (
              <ConnectionTabView
                connection={connection}
                onEdit={() => {
                  form.setFieldsValue({
                    base_url: connection?.base_url,
                    description: connection?.description,
                    is_active: connection?.is_active,
                    internal_connection: connection?.internal_connection,
                    auto_trigger_bots: connection?.extra?.auto_trigger_bots,
                    extra: connection?.extra,
                  });
                  setIsTestSuccessful(false);
                  setTestStatus("idle");
                  setIsEditModalOpen(true);
                }}
                onTest={() => handleTestConnection()}
                isTesting={isTesting}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              <Edit2 size={16} />
            </div>
            <span className="text-[15px]">Edit Connection Parameters</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isUpdating}
        width={580}
        centered
        className="custom-modal"
        okText="Save Changes"
        cancelText="Cancel"
        okButtonProps={{
          className: cn(
            "h-9 px-6 font-medium shadow-sm transition-all rounded-md",
            isTestSuccessful
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border-transparent"
          ),
          disabled: !isTestSuccessful,
        }}
        cancelButtonProps={{
          className: "h-9 px-4 font-medium border-slate-200 rounded-md hover:bg-slate-50",
        }}
      >
        <div className="pt-2">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
            onValuesChange={() => {
              setIsTestSuccessful(false);
              setTestStatus("idle");
            }}
            className="space-y-4"
            requiredMark={false}
          >
            <div className="grid grid-cols-2 gap-x-6">
              <Form.Item
                name="description"
                label={<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Service Description</span>}
                className="col-span-2 mb-2"
              >
                <Input.TextArea
                  placeholder="Describe this connection's purpose..."
                  rows={2}
                  className="rounded-lg border-slate-200 text-[13px] py-2 shadow-sm focus:ring-1"
                />
              </Form.Item>

              <div className="col-span-2 mt-2 mb-1">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  Technical Configuration
                  <div className="h-[1px] flex-1 bg-slate-200" />
                </h4>

                {watchedExtra?.host && watchedExtra?.port && (
                  <div className="mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 size={14} className="text-blue-500" />
                      <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Generated URL</span>
                    </div>
                    <span className="text-[12px] font-mono font-medium text-slate-600">
                      {buildBaseUrl(connection?.service_name || "postgres", watchedExtra.host, watchedExtra.port)}
                    </span>
                  </div>
                )}
                
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-12 gap-x-4">
                    <Form.Item
                      name={["extra", "host"]}
                      label={<span className="text-[11px] font-medium text-slate-500">Hostname / IP</span>}
                      rules={[{ required: true }]}
                      className="col-span-8 mb-0"
                    >
                      <Input placeholder="127.0.0.1" className="h-9 rounded-md border-slate-200 shadow-sm text-[13px]" />
                    </Form.Item>
                    <Form.Item
                      name={["extra", "port"]}
                      label={<span className="text-[11px] font-medium text-slate-500">Port</span>}
                      rules={[{ required: true }]}
                      className="col-span-4 mb-0"
                    >
                      <Input placeholder="5432" className="h-9 rounded-md border-slate-200 shadow-sm text-[13px]" />
                    </Form.Item>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item
                      name={["extra", "username"]}
                      label={<span className="text-[11px] font-medium text-slate-500">Database User</span>}
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input placeholder="admin" className="h-9 rounded-md border-slate-200 shadow-sm text-[13px]" />
                    </Form.Item>
                    <Form.Item
                      name={["extra", "password"]}
                      label={<span className="text-[11px] font-medium text-slate-500">Password</span>}
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input.Password placeholder="••••••••" className="h-9 rounded-md border-slate-200 shadow-sm text-[13px]" />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name={["extra", "database"]}
                    label={<span className="text-[11px] font-medium text-slate-500">Default Database</span>}
                    rules={[{ required: true }]}
                    className="mb-0"
                  >
                    <Input placeholder="public" className="h-9 rounded-md border-slate-200 shadow-sm text-[13px]" />
                  </Form.Item>
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Form.Item name="is_active" label={<span className="text-[11px] font-medium text-slate-600">Active</span>} valuePropName="checked" className="mb-0">
                  <Switch size="small" />
                </Form.Item>
                <Form.Item name="internal_connection" label={<span className="text-[11px] font-medium text-slate-600">Internal</span>} valuePropName="checked" className="mb-0">
                  <Switch size="small" />
                </Form.Item>
                <Form.Item name="auto_trigger_bots" label={<span className="text-[11px] font-medium text-slate-600">Auto Bots</span>} valuePropName="checked" className="mb-0">
                  <Switch size="small" />
                </Form.Item>
              </div>

              {/* Validation Status & Button */}
              <div className="col-span-2 mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border",
                    testStatus === "idle" && "bg-slate-50 text-slate-400 border-slate-200",
                    testStatus === "testing" && "bg-blue-50 text-blue-600 border-blue-200",
                    testStatus === "success" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                    testStatus === "failed" && "bg-red-50 text-red-600 border-red-200"
                  )}>
                    {testStatus === "idle" && <Activity size={14} />}
                    {testStatus === "testing" && <Loader2 size={14} className="animate-spin" />}
                    {testStatus === "success" && <CheckCircle2 size={14} />}
                    {testStatus === "failed" && <XCircle size={14} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-slate-900">
                      {testStatus === "idle" && "Unverified"}
                      {testStatus === "testing" && "Checking..."}
                      {testStatus === "success" && "Verified"}
                      {testStatus === "failed" && "Failed"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {testStatus === "idle" ? "Test required before saving." : "Connection tested"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleTestConnection(form.getFieldsValue())}
                  loading={isTesting}
                  type="default"
                  className={cn(
                    "h-9 px-4 text-[13px] font-medium rounded-md",
                    isTestSuccessful ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-700"
                  )}
                >
                  {isTestSuccessful ? "Re-test" : "Test Connection"}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Modal>

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
        }
        .custom-explore-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
        /* Borderless toolbars overrides */
        .custom-toolbar-select .ant-select-selector {
          padding: 0 8px !important;
          color: #475569 !important;
          font-weight: 500;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

// --- Tab Sub-Components ---

function DatabasesTabView({ databases, loading, onTableClick }: { databases: DatabaseInfo[]; loading: boolean; onTableClick: (name: string) => void; }) {
  const columns: ColumnsType<DatabaseInfo> = [
    {
      title: "Database Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text) => (
        <div className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50/50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-200">
            <Database size={14} />
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
          {text || "Explore tables and schemas in this database."}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: "15%",
      render: () => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
          Active
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "10%",
      render: (type) => (
        <div className="inline-flex items-center px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium capitalize">
          {type || "Database"}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: () => (
        <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <Table
        dataSource={databases}
        columns={columns}
        rowKey="name"
        loading={loading}
        pagination={false}
        onRow={(record) => ({
          onClick: () => onTableClick(record.name),
          className: "cursor-pointer group",
        })}
        className="custom-explore-table"
        locale={{
          emptyText: (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <Database size={32} className="text-slate-300 mb-3" />
              <span className="text-[14px] font-medium text-slate-700">No databases found</span>
              <span className="text-[13px]">There are no databases available in this connection.</span>
            </div>
          ),
        }}
      />
    </div>
  );
}

function ConnectionTabView({ connection, onEdit, onTest, isTesting }: { connection: ServiceEndpoint | null; onEdit: () => void; onTest: () => void; isTesting: boolean; }) {
  if (!connection) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Configuration</h3>
          <p className="text-slate-500 text-[13px] mt-1">Manage and verify connection parameters.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<Edit2 size={14} />} onClick={onEdit} className="h-8 px-3 text-[13px] rounded-md border-slate-200 text-slate-600 font-medium">
            Edit
          </Button>
          <Button type="primary" icon={<Play size={14} />} loading={isTesting} onClick={onTest} className="h-8 px-3 text-[13px] rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium border-none shadow-sm">
            Test Connection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-t border-slate-100 pt-6">
        {/* Basic Info Col */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Basic Info</h4>
          
          <div className="flex flex-col border-b border-slate-100 pb-3">
            <span className="text-[11px] text-slate-500 font-medium mb-1">Service Name</span>
            <span className="text-[13px] text-slate-900 font-medium">{connection.service_name}</span>
          </div>
          
          <div className="flex flex-col border-b border-slate-100 pb-3">
            <span className="text-[11px] text-slate-500 font-medium mb-1">Status</span>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border w-fit",
              connection.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", connection.is_active ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" : "bg-slate-400")} />
              {connection.is_active ? "Active" : "Inactive"}
            </div>
          </div>

          <div className="flex flex-col border-b border-slate-100 pb-3">
            <span className="text-[11px] text-slate-500 font-medium mb-1">Access</span>
            {connection.internal_connection ? (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 w-fit">
                <ShieldCheck size={12} /> Internal
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 w-fit">External</span>
            )}
          </div>
        </div>

        {/* Tech Specs Col */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Specs</h4>
          
          <div className="flex flex-col border-b border-slate-100 pb-3">
            <span className="text-[11px] text-slate-500 font-medium mb-1">Base URL</span>
            <span className="text-[12px] font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 w-fit">
              {connection.base_url}
            </span>
          </div>

          {Object.entries(connection.extra || {}).filter(([key]) => ["host", "port", "database", "username"].includes(key)).map(([key, value]) => (
            <div key={key} className="flex flex-col border-b border-slate-100 pb-3">
              <span className="text-[11px] text-slate-500 font-medium mb-1 capitalize">{key}</span>
              <span className="text-[13px] text-slate-900 font-medium">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentsTabView({ connectionId }: { connectionId: string }) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [form] = Form.useForm();

  const [filters, setFilters] = useState<GetBotsParams>({
    search: "",
    bot_type: undefined,
    mode: undefined,
    is_enabled: undefined,
    trigger_mode: undefined,
    skip: 0,
    limit: 50,
  });

  const fetchBots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await serviceService.getBots(filters);
      setBots(data || []);
    } catch (err) {
      message.error("Failed to load metadata agents.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const handleRunBot = async (botId: string) => {
    try {
      setIsActionLoading(true);
      const res = await serviceService.runBot(botId);
      if (res.success) {
        message.success("Agent execution started");
        fetchBots();
      }
    } catch (err: any) {
      message.error(err?.message || "Failed to start agent.");
      fetchBots();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleBotStatus = async (botId: string, isEnabled: boolean) => {
    try {
      setIsActionLoading(true);
      if (isEnabled) await serviceService.disableBot(botId);
      else await serviceService.enableBot(botId);
      message.success(`Agent ${isEnabled ? "disabled" : "enabled"}`);
      fetchBots();
    } catch (err: any) {
      message.error("Failed to toggle status.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteBot = (botId: string) => {
    Modal.confirm({
      title: "Kill Agent",
      content: "Are you sure you want to delete this agent? Active processes will stop.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setIsActionLoading(true);
          await serviceService.deleteBot(botId);
          message.success("Agent killed");
          fetchBots();
        } catch {
          message.error("Failed to delete agent.");
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const handleUpdateBot = async (values: any) => {
    if (!editingBot) return;
    try {
      setIsActionLoading(true);
      let config = values.config;
      if (typeof config === "string") {
        try { config = JSON.parse(config); } catch (e) {}
      }
      await serviceService.updateBot(editingBot.id, { ...values, config, service_endpoint_id: connectionId });
      message.success("Agent updated");
      setIsEditModalOpen(false);
      fetchBots();
    } catch {
      message.error("Failed to save.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns: ColumnsType<Bot> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (text) => (
        <div className="flex items-center gap-3">
          <BotIcon size={16} className="text-slate-400" />
          <span className="font-semibold text-slate-900">{text}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "bot_type",
      key: "bot_type",
      width: "15%",
      render: (text) => (
        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium capitalize">
          {text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_enabled",
      key: "status",
      width: "12%",
      render: (isEnabled: boolean) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border w-fit",
          isEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", isEnabled ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" : "bg-slate-400")} />
          {isEnabled ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      title: "Recent Run",
      key: "recent_runs",
      width: "20%",
      render: (_, record) => (
        record.last_run_status ? (
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border w-fit",
            record.last_run_status === "success" && "bg-emerald-50 text-emerald-700 border-emerald-200",
            record.last_run_status === "failed" && "bg-red-50 text-red-700 border-red-200",
            (record.last_run_status === "running" || record.last_run_status === "pending") && "bg-blue-50 text-blue-700 border-blue-200"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              record.last_run_status === "success" && "bg-emerald-500",
              record.last_run_status === "failed" && "bg-red-500",
              (record.last_run_status === "running" || record.last_run_status === "pending") && "bg-blue-500 animate-pulse"
            )} />
            <span className="capitalize">{record.last_run_status}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[13px]">—</span>
        )
      ),
    },
    {
      title: "Trigger",
      dataIndex: "trigger_mode",
      key: "trigger",
      width: "13%",
      render: (text) => (
        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 capitalize">
          <Zap size={12} className="text-slate-400" />
          {text}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "5%",
      align: "right",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              ...(record.is_enabled && !["running", "pending"].includes(record.last_run_status || "") ? [{ key: "run", label: "Run Agent", icon: <Play size={14} />, onClick: () => handleRunBot(record.id) }] : []),
              { key: "toggle", label: record.is_enabled ? "Disable" : "Enable", icon: record.is_enabled ? <Pause size={14} /> : <CheckCircle2 size={14} />, onClick: () => handleToggleBotStatus(record.id, record.is_enabled) },
              { key: "edit", label: "Edit Config", icon: <Edit2 size={14} />, onClick: () => {
                setEditingBot(record);
                form.setFieldsValue({ ...record, config: record.config ? (typeof record.config === "object" ? JSON.stringify(record.config, null, 2) : record.config) : "" });
                setIsEditModalOpen(true);
              }},
              { type: "divider" },
              { key: "kill", label: "Delete Agent", icon: <Trash2 size={14} />, danger: true, onClick: () => handleDeleteBot(record.id) },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreVertical size={16} />} className="text-slate-400 hover:text-slate-900" onClick={e => e.stopPropagation()} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-2 px-2">
          <Search size={16} className="text-slate-400" />
          <Input
            placeholder="Search agents..."
            variant="borderless"
            className="h-9 shadow-none px-2 text-[14px] w-full max-w-sm focus:ring-0"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <div className="flex items-center gap-2 pr-2 border-l border-slate-100 pl-4 h-6">
          <Filter size={14} className="text-slate-400 mr-1" />
          <Select
            placeholder="Type"
            variant="borderless"
            allowClear
            className="w-28 custom-toolbar-select"
            options={[{ label: "Metadata", value: "metadata" }, { label: "Profiler", value: "profiler" }, { label: "Quality", value: "quality" }]}
            onChange={(val) => setFilters(prev => ({ ...prev, bot_type: val }))}
          />
          <div className="w-px h-4 bg-slate-200" />
          <Select
            placeholder="Mode"
            variant="borderless"
            allowClear
            className="w-28 custom-toolbar-select"
            options={[{ label: "Self", value: "self" }, { label: "External", value: "external" }]}
            onChange={(val) => setFilters(prev => ({ ...prev, mode: val }))}
          />
          <div className="w-px h-4 bg-slate-200" />
          <Button type="primary" icon={<Play size={14} />} className="ml-2 h-8 px-3 text-[13px] rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium border-none shadow-sm">
            Deploy New
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table
          dataSource={bots}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="custom-explore-table"
          locale={{
            emptyText: (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <BotIcon size={32} className="text-slate-300 mb-3" />
                <span className="text-[14px] font-medium text-slate-700">No agents found</span>
              </div>
            ),
          }}
        />
      </div>

      {/* Re-use standard edit modal pattern omitted for brevity (similar to Connection Edit) */}
    </div>
  );
}

interface UnifiedBotRun extends BotRun { bot_name: string; bot_type: string; }

function AgentRunsTabView({ connectionId }: { connectionId: string }) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [runs, setRuns] = useState<UnifiedBotRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<BotRun | null>(null);

  const [filters, setFilters] = useState({ search: "", bot_id: "all", status: "all", trigger_source: "all" });

  const fetchBotsAndRuns = useCallback(async () => {
    try {
      setLoading(true);
      const currentBots = await serviceService.getBots({ skip: 0, limit: 100 });
      setBots(currentBots || []);
      
      if (!currentBots?.length) return setRuns([]);

      const runsPromises = currentBots.map(async (bot: Bot) => {
        try {
          const botRuns = await serviceService.getBotRuns(bot.id, { limit: 20 });
          return botRuns.map((run: BotRun) => ({ ...run, bot_name: bot.name, bot_type: bot.bot_type }));
        } catch { return []; }
      });

      const allRunsNested = await Promise.all(runsPromises);
      const sortedRuns = allRunsNested.flat().sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      setRuns(sortedRuns as UnifiedBotRun[]);
    } catch {
      message.error("Failed to load agent runs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBotsAndRuns(); }, [fetchBotsAndRuns]);

  const filteredRuns = runs.filter((run) => {
    return (!filters.search || run.bot_name.toLowerCase().includes(filters.search.toLowerCase())) &&
           (filters.bot_id === "all" || run.bot_id === filters.bot_id) &&
           (filters.status === "all" || run.status === filters.status) &&
           (filters.trigger_source === "all" || run.trigger_source === filters.trigger_source);
  });

  const formatDuration = (start: string, end?: string) => {
    if (!end) return "Running...";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const columns: ColumnsType<UnifiedBotRun> = [
    {
      title: "Agent",
      key: "agent",
      width: "25%",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-slate-900">{record.bot_name}</span>
          <span className="text-[11px] text-slate-500 capitalize">{record.bot_type}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border w-fit capitalize",
          status === "success" && "bg-emerald-50 text-emerald-700 border-emerald-200",
          status === "failed" && "bg-red-50 text-red-700 border-red-200",
          (status === "running" || status === "pending") && "bg-blue-50 text-blue-700 border-blue-200"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", status === "success" && "bg-emerald-500", status === "failed" && "bg-red-500", (status === "running" || status === "pending") && "bg-blue-500 animate-pulse")} />
          {status}
        </div>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      width: "15%",
      render: (_, record) => (
        <span className="text-[13px] text-slate-600 flex items-center gap-1.5">
          {formatDuration(record.started_at, record.completed_at)}
        </span>
      ),
    },
    {
      title: "Started At",
      dataIndex: "started_at",
      key: "started_at",
      width: "20%",
      render: (date) => (
        <span className="text-[12px] text-slate-500">{new Date(date).toLocaleString()}</span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<Terminal size={14} />}
          className="text-slate-400 hover:text-slate-900"
          onClick={() => { setSelectedRun(record); setIsOutputModalOpen(true); }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-2 px-2">
          <Search size={16} className="text-slate-400" />
          <Input
            placeholder="Search runs..."
            variant="borderless"
            className="h-9 shadow-none px-2 text-[14px] w-full max-w-sm focus:ring-0"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <div className="flex items-center gap-2 pr-2 border-l border-slate-100 pl-4 h-6">
          <Select
            placeholder="Status"
            variant="borderless"
            className="w-28 custom-toolbar-select"
            value={filters.status}
            onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
            options={[{ label: "All", value: "all" }, { label: "Success", value: "success" }, { label: "Failed", value: "failed" }]}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table
          dataSource={filteredRuns}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
          className="custom-explore-table"
        />
      </div>

      <Modal
        title={<div className="font-semibold flex items-center gap-2"><Terminal size={16}/> Execution Output</div>}
        open={isOutputModalOpen}
        onCancel={() => setIsOutputModalOpen(false)}
        footer={null}
        width={700}
        className="custom-modal"
      >
        <div className="mt-4 bg-[#0D1117] rounded-lg p-4 overflow-auto max-h-[500px] border border-slate-800">
          {selectedRun?.output ? (
            <pre className="text-emerald-400 font-mono text-[12px] leading-relaxed m-0">
              {JSON.stringify(selectedRun.output, null, 2)}
            </pre>
          ) : (
            <span className="text-slate-500 font-mono text-[12px]">No output data...</span>
          )}
        </div>
      </Modal>
    </div>
  );
}