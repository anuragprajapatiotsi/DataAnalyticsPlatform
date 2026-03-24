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
  Modal,
  Form,
  Input,
  Switch,
  message,
} from "antd";
import {
  Database,
  Settings2,
  LayoutDashboard,
  Bot,
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
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ServiceEndpoint, DatabaseInfo } from "@/features/services/types";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

type TabType = "insights" | "databases" | "agents" | "connection";

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
      message.error(
        err.response?.data?.message || "Failed to test connection",
      );
      setIsTestSuccessful(false);
      setTestStatus("failed");
    } finally {
      setIsTesting(false);
    }
  };

  const serviceLabel =
    serviceType.charAt(0).toUpperCase() + serviceType.slice(1);

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
      <div className="px-6 pt-4 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
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
            {activeTab === "insights" && <InsightsTabView />}
            {activeTab === "databases" && (
              <DatabasesTabView
                databases={databases}
                loading={loading}
                onTableClick={(dbName) =>
                  router.push(`/explore/${serviceType}/${id}/${dbName}`)
                }
              />
            )}
            {activeTab === "agents" && <AgentsTabView />}
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
                    <>
                       Re-test Connection
                    </>
                  ) : (
                    <>
                       Test Connection
                    </>
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
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
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
                  : "bg-slate-50 text-slate-500 border-slate-200"
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
