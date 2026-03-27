"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  Modal,
  Form,
  Select,
  Dropdown,
  Popconfirm,
  Input,
  Switch,
  message,
} from "antd";
import {
  Database,
  Settings2,
  LayoutDashboard,
  Bot as BotIcon,
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
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import {
  ServiceEndpoint,
  DatabaseInfo,
  Bot,
  GetBotsParams,
  BotRun,
  GetBotRunsParams,
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

  const handleUpdate = async (values: any) => {
    try {
      setIsUpdating(true);
      const payload = {
        ...values,
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
      message.error(
        err.response?.data?.message || "Failed to update connection",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestConnection = async (testData?: any) => {
    if (!connection) return;

    try {
      setIsTesting(true);
      setTestStatus("testing");

      // Extract and flatten the config data
      // Case 1: testData from form (which has extra nested)
      // Case 2: testData from direct call or existing connection.extra
      const config = testData?.extra || testData || connection.extra;

      const host = config?.host;
      const user =
        config?.username ||
        config?.user ||
        config?.service_name ||
        connection.extra?.username;

      if (!host || !user) {
        message.warning("Connection requires Host and User configuration");
        setIsTesting(false);
        setTestStatus("failed");
        return;
      }

      const payload = {
        service: connection.service_name,
        service_type: "database",
        driver: serviceType === "databases" ? "postgres" : serviceType,
        connection_object: {
          host: String(host),
          port: Number(config?.port) || 0,
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
  const serviceLabel = isDatabaseService ? "Database Services" : 
    (serviceType.charAt(0).toUpperCase() + serviceType.slice(1));

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: serviceLabel, href: `/explore/${serviceType}` },
    { label: connection?.service_name || "Connection Details" },
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
      <div className="px-4 pt-2 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <PageHeader
              title={connection?.service_name || "Connection Details"}
              description={`Manage and explore databases for this connection.`}
              breadcrumbItems={breadcrumbItems}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-transparent">
            {(
              ["databases", "agents", "agentRuns", "connection"] as TabType[]
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
                  {tab === "databases" && <Database size={14} />}
                  {tab === "agents" && <BotIcon size={14} />}
                  {tab === "agentRuns" && <History size={14} />}
                  {tab === "connection" && <Info size={14} />}
                  {tab === "agentRuns" ? "Agent Runs" : tab}
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
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-6xl mx-auto">
          {error && (
            <Alert
              title="Error"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-6"
            />
          )}

          <div className="animate-in fade-in slide-in-from-top-2 duration-400">
            {activeTab === "databases" && (
              <DatabasesTabView
                databases={databases}
                loading={loading}
                onTableClick={(dbName) =>
                  router.push(`/explore/${serviceType}/${id}/${dbName}`)
                }
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
          <div className="flex items-center gap-2 text-slate-800 font-bold ">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Edit2 size={18} />
            </div>
            <span>Edit Connection Parameters</span>
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
            "h-10 px-8 rounded-xl font-bold shadow-md transition-all",
            isTestSuccessful
              ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
          ),
          disabled: !isTestSuccessful,
        }}
        cancelButtonProps={{
          className: "h-10 px-6 rounded-xl font-bold border-slate-200",
        }}
      >
        <div>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
            onValuesChange={() => {
              setIsTestSuccessful(false);
              setTestStatus("idle");
            }}
            className="space-y-3"
            requiredMark={false}
          >
            <div className="grid grid-cols-2 gap-x-6">
              <Form.Item
                name="base_url"
                label={
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    API Base URL
                  </span>
                }
                className="col-span-2"
                rules={[{ required: true, message: "Base URL is required" }]}
              >
                <Input
                  placeholder="postgresql://host:port/db"
                  className="h-11 rounded-xl bg-slate-50 border-slate-100 hover:border-blue-300 focus:bg-white transition-all font-mono text-sm"
                />
              </Form.Item>
              <Form.Item
                name="description"
                label={
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Service Description
                  </span>
                }
                className="col-span-2"
              >
                <Input.TextArea
                  placeholder="Describe this connection's purpose..."
                  rows={3}
                  className="rounded-xl bg-slate-50 border-slate-100 hover:border-blue-300 focus:bg-white transition-all text-sm py-3"
                />
              </Form.Item>

              <div className="col-span-2 mt-2 mb-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <div className="h-[1px] flex-1 bg-slate-100" />
                  Technical Configuration
                  <div className="h-[1px] flex-1 bg-slate-100" />
                </h4>
                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 relative overflow-hidden space-y-3">
                  <div className="grid grid-cols-12 gap-x-4">
                    <Form.Item
                      name={["extra", "host"]}
                      label={
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Hostname / IP
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="col-span-8 mb-0"
                    >
                      <Input
                        placeholder="3.7.235.41"
                        className="h-10 rounded-lg border-slate-200"
                      />
                    </Form.Item>
                    <Form.Item
                      name={["extra", "port"]}
                      label={
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Port
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="col-span-4 mb-0"
                    >
                      <Input
                        placeholder="5432"
                        className="h-10 rounded-lg border-slate-200"
                      />
                    </Form.Item>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item
                      name={["extra", "username"]}
                      label={
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Database User
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="admin_user"
                        className="h-10 rounded-lg border-slate-200"
                      />
                    </Form.Item>
                    <Form.Item
                      name={["extra", "password"]}
                      label={
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Password
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input.Password
                        placeholder="******"
                        className="h-10 rounded-lg border-slate-200"
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name={["extra", "database"]}
                    label={
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Default Database
                      </span>
                    }
                    rules={[{ required: true }]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="main_production"
                      className="h-10 rounded-lg border-slate-200"
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4 mt-6 bg-blue-50/20 p-3 rounded-xl border border-blue-50/40">
                <Form.Item
                  name="is_active"
                  label={
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Active Status
                    </span>
                  }
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Switch size="small" className="bg-emerald-500" />
                </Form.Item>
                <Form.Item
                  name="internal_connection"
                  label={
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Internal Source
                    </span>
                  }
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Switch size="small" className="bg-indigo-500" />
                </Form.Item>
                <Form.Item
                  name="auto_trigger_bots"
                  label={
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Auto Trigger Bots
                    </span>
                  }
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Switch size="small" className="bg-blue-600" />
                </Form.Item>
              </div>

              {/* Validation Status & Button */}
              <div className="col-span-2 mt-6 p-2 px-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                      testStatus === "idle" && "bg-slate-100 text-slate-400",
                      testStatus === "testing" && "bg-blue-50 text-blue-600",
                      testStatus === "success" &&
                        "bg-emerald-50 text-emerald-600 scale-110",
                      testStatus === "failed" && "bg-red-50 text-red-600",
                    )}
                  >
                    {testStatus === "idle" && <Activity size={24} />}
                    {testStatus === "testing" && (
                      <Loader2 size={24} className="animate-spin" />
                    )}
                    {testStatus === "success" && <CheckCircle2 size={24} />}
                    {testStatus === "failed" && <XCircle size={24} />}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 mb-0.5">
                      {testStatus === "idle" && "Connection not verified"}
                      {testStatus === "testing" && "Verifying connectivity..."}
                      {testStatus === "success" && "Connection Verified"}
                      {testStatus === "failed" && "Verification Failed"}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium">
                      {testStatus === "idle" &&
                        "You must test the connection before saving changes."}
                      {testStatus === "testing" &&
                        "Please wait while we check the parameters."}
                      {testStatus === "success" &&
                        "Settings are valid. You can now save your changes."}
                      {testStatus === "failed" &&
                        "Please check your credentials and try again."}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleTestConnection(form.getFieldsValue())}
                  loading={isTesting}
                  className={cn(
                    "h-11 px-6 rounded-xl font-bold flex items-center gap-2 transition-all",
                    isTestSuccessful
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                      : "bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-sm",
                  )}
                >
                  {isTestSuccessful ? (
                    <>Re-test Connection</>
                  ) : (
                    <>Test Connection</>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Modal>

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
        .custom-descriptions .ant-descriptions-item-label {
          color: #94a3b8 !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding-bottom: 4px !important;
        }
        .custom-descriptions .ant-descriptions-item-content {
          color: #1e293b !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          padding-bottom: 12px !important;
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
        .custom-modal .ant-modal-content {
          border-radius: 24px !important;
          padding: 24px 32px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important;
        }
        .custom-modal .ant-modal-header {
          margin-bottom: 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding-bottom: 16px !important;
        }
        .custom-modal .ant-form-item-label label {
          height: auto !important;
          padding-bottom: 4px !important;
        }
      `}</style>
    </div>
  );
}

// --- Tab Sub-Components ---


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
      width: "35%",
      render: (text) => (
        <Tooltip title={text}>
          <span className="text-slate-500 text-sm line-clamp-1 max-w-sm">
            {text || "Explore tables and schemas in this database."}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: "15%",
      render: () => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/20">
          Active
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "10%",
      render: (type) => (
        <span className="text-slate-400 text-xs font-semibold capitalize">
          {type || "Database"}
        </span>
      ),
    },
    {
      title: "Owner",
      key: "owners",
      width: "10%",
      render: () => (
        <Tooltip title="Admin User">
          <Avatar
            size="small"
            className="border-2 border-white bg-blue-600 font-bold text-[10px] hover:scale-110 transition-transform cursor-help shadow-sm"
          >
            A
          </Avatar>
        </Tooltip>
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
  onEdit,
  onTest,
  isTesting,
}: {
  connection: ServiceEndpoint | null;
  onEdit: () => void;
  onTest: () => void;
  isTesting: boolean;
}) {
  if (!connection) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Info size={20} className="text-blue-600" />
            Configuration Details
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Manage and verify your connection parameters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            icon={<Edit2 size={16} />}
            onClick={onEdit}
            className="flex items-center h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:text-blue-600 hover:border-blue-600 transition-all"
          >
            Edit Connection
          </Button>
          <Button
            type="primary"
            icon={<Play size={16} />}
            loading={isTesting}
            onClick={onTest}
            className="flex items-center h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-100"
          >
            Test Connection
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">
            Basic Information
          </h3>
          <Descriptions column={2} className="custom-descriptions" size="small">
            <Descriptions.Item label="Service Name">
              <span className="font-bold text-slate-800">
                {connection.service_name}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="API Base URL">
              <span className="font-mono text-slate-600 text-[13px] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                {connection.base_url}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Internal Connection">
              {connection.internal_connection ? (
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  <ShieldCheck size={12} /> Internal
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  Regular
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <span
                className={cn(
                  "flex items-center gap-2 text-xs font-bold",
                  connection.is_active ? "text-emerald-600" : "text-slate-400",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    connection.is_active
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-slate-300",
                  )}
                />
                {connection.is_active ? "Active" : "Inactive"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock size={14} />
                {new Date(connection.created_at).toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              <p className="text-slate-700 font-medium italic leading-relaxed border-l-4 border-slate-100 pl-4 py-1">
                {connection.description ||
                  "No service-level description provided."}
              </p>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div className="border-t border-slate-100 shadow-sm" />

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">
            Technical Specification
          </h3>
          <Descriptions column={2} className="custom-descriptions" size="small">
            {Object.entries(connection.extra || {}).map(([key, value]) => {
              if (
                [
                  "host",
                  "port",
                  "username",
                  "password",
                  "database",
                  "setting_node_id",
                ].includes(key)
              ) {
                return (
                  <Descriptions.Item
                    key={key}
                    label={key.replace("_", " ").toUpperCase()}
                  >
                    <span className="text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {key === "password"
                        ? "••••••••"
                        : typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                    </span>
                  </Descriptions.Item>
                );
              }
              return null;
            })}
          </Descriptions>
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
      console.error("Failed to fetch bots:", err);
      message.error("Failed to load metadata agents.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const handleRunBot = async (botId: string) => {
    try {
      setIsActionLoading(true);
      const res = await serviceService.runBot(botId);
      if (res.success) {
        message.success(res.message || "Bot triggered successfully");
        fetchBots();
      }
    } catch (err) {
      console.error("Failed to run bot:", err);
      message.error("Failed to trigger agent execution.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleBotStatus = async (botId: string, isEnabled: boolean) => {
    try {
      setIsActionLoading(true);
      if (isEnabled) {
        await serviceService.disableBot(botId);
        message.success("Agent disabled successfully");
      } else {
        await serviceService.enableBot(botId);
        message.success("Agent enabled successfully");
      }
      fetchBots();
    } catch (err: any) {
      console.error("Failed to toggle bot status. Full error:", err);
      const errorMsg = err?.message || `Failed to ${isEnabled ? "disable" : "enable"} agent.`;
      message.error(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteBot = (botId: string) => {
    Modal.confirm({
      title: "Kill Agent",
      icon: <XCircle className="text-red-500" size={22} />,
      content:
        "Are you sure you want to delete this agent? This action cannot be undone and will stop any active processes.",
      okText: "Yes, Kill",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          setIsActionLoading(true);
          await serviceService.deleteBot(botId);
          message.success("Agent killed successfully");
          fetchBots();
        } catch (err) {
          console.error("Failed to kill bot:", err);
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
      // Ensure config is parsed if it was edited as text
      let config = values.config;
      if (typeof config === "string") {
        try {
          config = JSON.parse(config);
        } catch (e) {
          // keep as is if not valid JSON
        }
      }

      await serviceService.updateBot(editingBot.id, {
        ...values,
        config,
        service_endpoint_id: connectionId,
      });
      message.success("Agent configuration updated successfully");
      setIsEditModalOpen(false);
      fetchBots();
    } catch (err) {
      console.error("Failed to update bot:", err);
      message.error("Failed to save agent configuration.");
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
        <Space size="middle" className="group/name">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover/name:bg-indigo-50 group-hover/name:border-indigo-100 transition-colors">
            <BotIcon
              size={18}
              className="text-slate-600 group-hover/name:text-indigo-600"
            />
          </div>
          <span className="font-bold text-slate-800">{text}</span>
        </Space>
      ),
    },
    {
      title: "Bot Type",
      dataIndex: "bot_type",
      key: "bot_type",
      width: "15%",
      render: (text) => (
        <span className="text-[14px] font-bold text-slate-400 rounded-md">
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
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            isEnabled
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/20"
              : "bg-slate-50 text-slate-400 border-slate-100",
          )}
        >
          {isEnabled ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Recent Runs",
      key: "recent_runs",
      width: "20%",
      render: (_, record) => (
        <Space size="small">
          {record.last_run_status ? (
            <Tooltip
              title={`Last run: ${record.last_run_at ? new Date(record.last_run_at).toLocaleString() : "recently"}`}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border",
                  record.last_run_status === "success" &&
                    "bg-emerald-50 text-emerald-600 border-emerald-100",
                  record.last_run_status === "failed" &&
                    "bg-red-50 text-red-600 border-red-100",
                  record.last_run_status === "pending" &&
                    "bg-amber-50 text-amber-600 border-amber-100",
                )}
              >
                <History size={10} />
                {record.last_run_status}
              </span>
            </Tooltip>
          ) : (
            <span className="text-slate-300 italic text-[10px]">
              No recent runs
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Trigger",
      dataIndex: "trigger_mode",
      key: "trigger",
      width: "13%",
      render: (text) => (
        <span className="text-[11px] font-bold text-slate-500 capitalize flex items-center gap-1.5">
          <Zap size={12} className="text-amber-500" />
          {text}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "5%",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: [
                {
                  key: "run",
                  label: "Run Agent",
                  icon: <Play size={14} />,
                  onClick: () => handleRunBot(record.id),
                },
                {
                  key: "toggle",
                  label: record.is_enabled ? "Disable Agent" : "Enable Agent",
                  icon: record.is_enabled ? (
                    <Pause size={14} />
                  ) : (
                    <CheckCircle2 size={14} />
                  ),
                  onClick: () =>
                    handleToggleBotStatus(record.id, record.is_enabled),
                  disabled: isActionLoading && editingBot?.id === record.id,
                },
                {
                  key: "edit",
                  label: "Edit Configuration",
                  icon: <Edit2 size={14} />,
                  onClick: () => {
                    setEditingBot(record);
                    form.setFieldsValue({
                      ...record,
                      config: record.config
                        ? typeof record.config === "object"
                          ? JSON.stringify(record.config, null, 2)
                          : record.config
                        : "",
                    });
                    setIsEditModalOpen(true);
                  },
                },
                {
                  type: "divider",
                },
                {
                  key: "kill",
                  label: "Kill Agent",
                  icon: <Trash2 size={14} />,
                  danger: true,
                  onClick: () => handleDeleteBot(record.id),
                },
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              loading={isActionLoading && editingBot?.id === record.id}
              icon={
                <MoreVertical
                  size={18}
                  className="text-slate-400 group-hover:text-slate-600 transition-colors"
                />
              }
              className="flex items-center justify-center hover:bg-slate-100 rounded-lg h-9 w-9 p-0"
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <Input
            placeholder="Search agents by name..."
            prefix={<Search size={16} className="text-slate-400" />}
            className="h-10 rounded-lg border-slate-200 max-w-sm"
            value={filters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
          <Select
            placeholder="Type"
            allowClear
            className="w-32"
            options={[
              { label: "Metadata", value: "metadata" },
              { label: "Profiler", value: "profiler" },
              { label: "Quality", value: "quality" },
            ]}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, bot_type: val }))
            }
          />
          <Select
            placeholder="Mode"
            allowClear
            className="w-32"
            options={[
              { label: "Self", value: "self" },
              { label: "External", value: "external" },
            ]}
            onChange={(val) => setFilters((prev) => ({ ...prev, mode: val }))}
          />
          <Select
            placeholder="Trigger"
            allowClear
            className="w-32"
            options={[
              { label: "Manual", value: "manual" },
              { label: "Scheduled", value: "scheduled" },
              { label: "Event", value: "event" },
            ]}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, trigger_mode: val }))
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="primary"
            icon={<Play size={16} />}
            className="bg-blue-600 hover:bg-blue-700 font-bold px-6 h-10 rounded-lg shadow-md shadow-blue-100"
          >
            Deploy New Agent
          </Button>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table
          dataSource={bots}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 50,
            hideOnSinglePage: true,
            className: "px-6 py-4 border-t border-slate-50",
          }}
          className="custom-explore-table"
          locale={{
            emptyText: (
              <Empty
                image={<BotIcon className="mx-auto text-slate-200" size={48} />}
                description="No metadata agents available for this connection."
              />
            ),
          }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold ">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Edit2 size={18} />
            </div>
            <span>Edit Agent Configuration</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isActionLoading}
        width={580}
        centered
        className="custom-modal"
        okText="Save Changes"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateBot}
          className="space-y-4 mt-4"
          requiredMark={false}
        >
          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              name="name"
              label={
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  Agent Name
                </span>
              }
              rules={[{ required: true, message: "Name is required" }]}
              className="col-span-2"
            >
              <Input className="h-11 rounded-xl bg-slate-50 border-slate-100" />
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  Description
                </span>
              }
              className="col-span-2"
            >
              <Input.TextArea
                rows={2}
                className="rounded-xl bg-slate-50 border-slate-100"
              />
            </Form.Item>

            <Form.Item
              name="bot_type"
              label={
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  Bot Type
                </span>
              }
              className="col-span-1"
            >
              <Select
                className="custom-select"
                options={[
                  { label: "Metadata", value: "metadata" },
                  { label: "Profiler", value: "profiler" },
                  { label: "Quality", value: "quality" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="mode"
              label={
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  Execution Mode
                </span>
              }
              className="col-span-1"
            >
              <Select
                className="custom-select"
                options={[
                  { label: "Self", value: "self" },
                  { label: "External", value: "external" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="trigger_mode"
              label={
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  Trigger Mode
                </span>
              }
              className="col-span-1"
            >
              <Select
                className="custom-select"
                options={[
                  { label: "Manual", value: "manual" },
                  { label: "Scheduled", value: "scheduled" },
                  { label: "Event", value: "event" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="model_name"
              label={
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  Model Name
                </span>
              }
              className="col-span-1"
            >
              <Input
                className="h-10 rounded-lg bg-white border-slate-200"
                placeholder="gpt-4, llama-3, etc."
              />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev: any, curr: any) =>
                prev.trigger_mode !== curr.trigger_mode
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("trigger_mode") === "scheduled" ? (
                  <Form.Item
                    name="cron_expr"
                    label={
                      <span className="text-xs font-bold text-slate-400 tracking-wider">
                        Cron Expression
                      </span>
                    }
                    className="col-span-2"
                  >
                    <Input
                      placeholder="0 * * * *"
                      className="h-11 rounded-xl bg-slate-50 border-slate-100"
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item
              name="config"
              label={
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  JSON Configuration
                </span>
              }
              className="col-span-2"
            >
              <Input.TextArea
                rows={5}
                className="rounded-xl bg-slate-50 border-slate-100 font-mono text-xs p-3"
                placeholder="{}"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

function AgentRunsTabView({ connectionId }: { connectionId: string }) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | undefined>(
    undefined,
  );
  const [runs, setRuns] = useState<BotRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<BotRun | null>(null);

  const fetchBots = useCallback(async () => {
    try {
      const data = await serviceService.getBots({ skip: 0, limit: 100 });
      setBots(data || []);
      if (data && data.length > 0 && !selectedBotId) {
        setSelectedBotId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch bots for selection:", err);
      message.error("Failed to load agents for selection.");
    }
  }, [selectedBotId]);

  const fetchRuns = useCallback(async () => {
    if (!selectedBotId) return;
    try {
      setLoading(true);
      const data = await serviceService.getBotRuns(selectedBotId);
      setRuns(data || []);
    } catch (err) {
      console.error("Failed to fetch runs:", err);
      message.error("Failed to load agent runs.");
    } finally {
      setLoading(false);
    }
  }, [selectedBotId]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const formatDuration = (start: string, end?: string) => {
    if (!end) return "Running...";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const columns: ColumnsType<BotRun> = [
    {
      title: "Run ID",
      dataIndex: "id",
      key: "id",
      width: "15%",
      render: (id) => (
        <span className="text-xs font-mono text-slate-500 truncate block max-w-[120px]">
          {id}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            status === "success" && "bg-emerald-50 text-emerald-600 border-emerald-100",
            status === "failed" && "bg-red-50 text-red-600 border-red-100",
            status === "running" && "bg-blue-50 text-blue-600 border-blue-100",
            status === "pending" && "bg-amber-50 text-amber-600 border-amber-100",
          )}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Trigger",
      dataIndex: "trigger_source",
      key: "trigger",
      render: (source) => (
        <span className="text-[11px] font-bold text-slate-500 capitalize flex items-center gap-1.5">
          <Zap size={12} className="text-amber-500" />
          {source}
        </span>
      ),
    },
    {
      title: "Triggered By",
      dataIndex: "triggered_by",
      key: "triggered_by",
      render: (val) => (
        <span className="text-xs text-slate-600">{val || "System"}</span>
      ),
    },
    {
      title: "Started At",
      dataIndex: "started_at",
      key: "started_at",
      render: (date) => (
        <span className="text-xs text-slate-500">
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => (
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Clock size={12} className="text-slate-400" />
          {formatDuration(record.started_at, record.completed_at)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<ExternalLink size={14} />}
          className="text-blue-600 hover:bg-blue-50 font-bold text-xs"
          onClick={() => {
            setSelectedRun(record);
            setIsOutputModalOpen(true);
          }}
        >
          Output
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Select Agent
          </span>
          <Select
            placeholder="Select Agent to view history"
            className="w-64"
            value={selectedBotId}
            onChange={(val) => setSelectedBotId(val)}
            options={bots.map((b) => ({ label: b.name, value: b.id }))}
          />
        </div>
        <Button
          icon={<Activity size={16} />}
          className="rounded-lg h-10 border-slate-200 text-slate-600 font-semibold"
          onClick={fetchRuns}
        >
          Refresh History
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table
          dataSource={runs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
          className="custom-explore-table"
          locale={{
            emptyText: (
              <Empty
                image={<History className="mx-auto text-slate-200" size={48} />}
                description={
                  selectedBotId
                    ? "No runs available for this agent"
                    : "Please select an agent to view history"
                }
              />
            ),
          }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold ">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Terminal size={18} />
            </div>
            <span>Execution Output</span>
          </div>
        }
        open={isOutputModalOpen}
        onCancel={() => setIsOutputModalOpen(false)}
        footer={null}
        width={700}
        centered
        className="custom-modal"
      >
        <div className="mt-4 bg-slate-900 rounded-xl p-5 overflow-auto max-h-[500px] border border-slate-800 shadow-2xl">
          {selectedRun?.output ? (
            <pre className="text-emerald-400 font-mono text-xs leading-relaxed">
              {JSON.stringify(selectedRun.output, null, 2)}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={32} className="text-slate-700 animate-spin" />
              <span className="text-slate-500 font-mono text-xs italic">
                No output data available for this run
              </span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
