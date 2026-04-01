"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Tag,
  Descriptions,
  Table,
  Badge,
  Spin,
  message,
  Tooltip,
  Card,
  Avatar,
  Flex,
  Divider,
  Progress,
  Drawer,
  Empty,
  Pagination,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Switch,
  Button,
  Popconfirm,
  Space,
} from "antd";
import {
  Database,
  Table as TableIcon,
  Eye,
  Zap,
  Shield,
  User,
  Clock,
  Activity,
  ChevronRight,
  Layers,
  Info,
  Key,
  HelpCircle,
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  Trash2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { serviceService } from "@/features/services/services/service.service";
import {
  DataAssetDetail,
  DataAssetColumn,
  DataAssetProfile,
  ColumnProfile,
  DataColumnDetail,
  ColumnProfilingResponse,
} from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { CreateCatalogViewModal } from "@/features/explore/components/CreateCatalogViewModal";
import { cn } from "@/shared/utils/cn";
import { useAuthContext } from "@/shared/contexts/auth-context";
import type { ColumnsType } from "antd/es/table";

export default function DataAssetDetailPage() {
  const { asset_id } = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const [asset, setAsset] = useState<DataAssetDetail | null>(null);
  const [latestProfile, setLatestProfile] = useState<DataAssetProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Column Profiling Drawer State
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [profilingData, setProfilingData] = useState<ColumnProfilingResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isColumnLoading, setIsColumnLoading] = useState(false);
  const [profilePagination, setProfilePagination] = useState({ skip: 0, limit: 10 });

  // Column Management State
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [editableColumns, setEditableColumns] = useState<DataAssetColumn[]>([]);

  const handleEditColumns = () => {
    setEditableColumns(asset?.columns ? [...asset.columns] : []);
    setIsEditingColumns(true);
  };

  const handleCancelEdit = () => {
    setEditableColumns([]);
    setIsEditingColumns(false);
  };

  const handleColumnChange = (columnName: string, field: keyof DataAssetColumn, value: any) => {
    setEditableColumns((prev) => 
      prev.map((col) => 
        col.name === columnName ? { ...col, [field]: value } : col
      )
    );
  };

  const handleSaveColumns = async () => {
    if (!asset_id) return;
    try {
      setLoading(true);
      const payload = editableColumns.map((col: any) => ({
        name: col.name,
        display_name: col.display_name || col.name,
        description: col.description || "",
        data_type: col.data_type,
        ordinal_position: col.ordinal_position || 1,
        is_nullable: col.is_nullable ?? true,
        is_primary_key: col.is_primary_key ?? false,
        is_foreign_key: col.is_foreign_key ?? false,
        is_pii: col.is_pii ?? false,
        sensitivity: col.sensitivity ?? "Not Defined",
        default_value: col.default_value ?? null,
      }));
      await serviceService.bulkUpdateColumns(asset_id as string, payload);
      message.success("Columns updating initiated successfully.");
      setIsEditingColumns(false);
      fetchData();
    } catch (err: any) {
      console.error("Bulk update failed:", err);
      message.error("Failed to update columns: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!asset_id) return;
    try {
      setLoading(true);
      await serviceService.deleteColumn(asset_id as string, columnId);
      message.success("Column deleted successfully.");
      
      // Also remove from editing state if we're currently editing
      if (isEditingColumns) {
        setEditableColumns(prev => prev.filter(col => col.id !== columnId && col.name !== columnId));
      }
      fetchData();
    } catch (err: any) {
      console.error("Column deletion failed:", err);
      message.error("Failed to delete column: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };


  const handleColumnClick = async (columnId: string, skip = 0) => {
    try {
      if (!asset_id || !columnId) {
        throw new Error("Missing asset or column identifier.");
      }
      setSelectedColumnId(columnId);
      setProfilePagination(prev => ({ ...prev, skip }));
      setIsColumnLoading(true);
      setIsDrawerOpen(true);
      
      const data = await serviceService.getColumnProfilingData(
        asset_id as string,
        columnId,
        { skip, limit: profilePagination.limit }
      );
      setProfilingData(data);
    } catch (err: any) {
      console.error("Failed to fetch profiling data:", err.status ? `[${err.status}]` : "", err.message || err);
      // Enhanced alert for debugging Network Errors
      const failingUrl = err.config?.url ? ` (${err.config.url})` : "";
      message.error(`${err.message || "Failed to load profiling insights"}${failingUrl}`);
      setIsDrawerOpen(false);
    } finally {
      setIsColumnLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    if (!asset_id) return;
    try {
      setLoading(true);
      const [assetData, profileData] = await Promise.allSettled([
        serviceService.getAssetDetail(asset_id as string),
        serviceService.getLatestAssetProfile(asset_id as string),
      ]);

      if (assetData.status === "fulfilled") setAsset(assetData.value);
      if (profileData.status === "fulfilled")
        setLatestProfile(profileData.value);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      message.error("Failed to load asset metadata.");
    } finally {
      setLoading(false);
    }
  }, [asset_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const searchParams = useSearchParams();
  const eid = searchParams.get("eid");
  const en = searchParams.get("en");
  const db = searchParams.get("db");
  const sn = searchParams.get("sn");
  const an = searchParams.get("an");
  const sid = searchParams.get("sid");

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets", href: "/explore/data-assets" },
    ...(eid && en ? [{ label: en, href: `/explore/data-assets/${eid}` }] : []),
    ...(db ? [{ label: db, href: `/explore/data-assets/${eid}` }] : []),
    ...(sid && sn
      ? [
          {
            label: sn,
            href: `/explore/data-assets/schema/${sid}?eid=${eid}&en=${en}&db=${db}&sn=${sn}`,
          },
        ]
      : []),
    { label: an || asset?.display_name || asset?.name || "Asset Details" },
  ];

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "N/A";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSensitivityColor = (level?: string) => {
    switch (level) {
      case "PII":
        return "red";
      case "Restricted":
        return "orange";
      case "Internal":
        return "blue";
      case "Public":
        return "green";
      default:
        return "default";
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "Platinum":
        return "purple";
      case "Gold":
        return "gold";
      case "Silver":
        return "silver";
      case "Bronze":
        return "orange";
      default:
        return "default";
    }
  };

  const columnColumns: ColumnsType<DataAssetColumn> = [
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (name, record) => (
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors group"
          onClick={() => handleColumnClick(record.id || record.name)}
        >
          {record.is_primary_key && (
            <Key size={14} className="text-amber-500" />
          )}
          <span className="font-mono text-sm font-bold text-slate-800 group-hover:text-blue-600">
            {name}
          </span>
          {record.is_nullable && (
            <span className="text-[10px] text-slate-400 ">null</span>
          )}
        </div>
      ),
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "type",
      width: "25%",
      render: (type) => (
        <Tooltip title={type}>
          <Tag className="max-w-full m-0 bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold uppercase tracking-wider truncate cursor-help">
            {type}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (desc) => (
        <span className="text-xs text-slate-500  line-clamp-2">
          {desc || "No description provided"}
        </span>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "20%",
      render: (tags: any[]) => (
        <div className="flex flex-wrap gap-1">
          {tags?.map((tag) => (
            <Tag
              key={tag.id}
              className="m-0 px-2 py-0 border  rounded-full text-[9px] font-bold uppercase"
              style={{
                color: tag.color,
                borderColor: tag.color ? `${tag.color}30` : undefined,
                backgroundColor: tag.color ? `${tag.color}10` : undefined,
              }}
            >
              {tag.display_name || tag.name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Delete Column"
          description="Are you sure you want to delete this column?"
          onConfirm={() => handleDeleteColumn(record.id || record.name)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  const editableColumnsConfig: ColumnsType<DataAssetColumn> = [
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: "15%",
      render: (name, record) => (
        <Space orientation="vertical" size="small" className="w-full">
          <Input 
            value={record.display_name || name} 
            onChange={(e) => handleColumnChange(record.name, 'display_name', e.target.value)} 
            placeholder="Display Name" 
            className="text-xs" 
          />
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono truncate block w-full">
            {name}
          </span>
        </Space>
      ),
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "type",
      width: "15%",
      render: (type, record) => (
        <Input 
          value={type} 
          onChange={(e) => handleColumnChange(record.name, 'data_type', e.target.value)} 
          className="text-xs font-mono" 
        />
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "20%",
      render: (desc, record) => (
        <Input.TextArea 
          value={desc || ""} 
          onChange={(e) => handleColumnChange(record.name, 'description', e.target.value)} 
          autoSize={{ minRows: 1, maxRows: 3 }} 
          className="text-xs" 
          placeholder="Detailed description..."
        />
      ),
    },
    {
      title: "Properties",
      key: "properties",
      width: "25%",
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase">PK</span>
            <Switch size="small" checked={record.is_primary_key} onChange={(chk) => handleColumnChange(record.name, 'is_primary_key', chk)} />
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase">FK</span>
            <Switch size="small" checked={record.is_foreign_key} onChange={(chk) => handleColumnChange(record.name, 'is_foreign_key', chk)} />
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase">Null</span>
            <Switch size="small" checked={record.is_nullable} onChange={(chk) => handleColumnChange(record.name, 'is_nullable', chk)} />
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase">PII</span>
            <Switch size="small" checked={record.is_pii} onChange={(chk) => handleColumnChange(record.name, 'is_pii', chk)} />
          </div>
        </div>
      ),
    },
    {
      title: "Sensitivity",
      dataIndex: "sensitivity",
      key: "sensitivity",
      width: "15%",
      render: (val, record) => (
        <Select 
          value={val || "Not Defined"} 
          onChange={(v) => handleColumnChange(record.name, 'sensitivity', v)} 
          className="text-xs w-full"
          size="small"
          options={[
            { value: 'Not Defined', label: 'Not Defined' },
            { value: 'Public', label: 'Public' },
            { value: 'Internal', label: 'Internal' },
            { value: 'Confidential', label: 'Confidential' },
            { value: 'Restricted', label: 'Restricted' },
            { value: 'PII', label: 'PII' }
          ]}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Delete Column"
          description="Are you sure you want to delete this column?"
          onConfirm={() => handleDeleteColumn(record.id || record.name)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  const columnProfileColumns: ColumnsType<{ name: string } & ColumnProfile> = [
    {
      title: "Column",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (name) => (
        <span className="font-mono text-sm font-bold text-slate-800">
          {name}
        </span>
      ),
    },
    {
      title: "Null Rate",
      dataIndex: "null_percentage",
      key: "null_percentage",
      width: "20%",
      render: (pct) => {
        const safePct = pct ?? 0;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ">
              <span
                className={safePct > 20 ? "text-rose-500" : "text-slate-400"}
              >
                Nulls
              </span>
              <span
                className={safePct > 20 ? "text-rose-600" : "text-slate-600"}
              >
                {safePct.toFixed(1)}%
              </span>
            </div>
            <Progress
              percent={safePct}
              showInfo={false}
              size="small"
              strokeColor={safePct > 20 ? "#f43f5e" : "#3b82f6"}
              railColor="#f1f5f9"
              className="m-0"
            />
          </div>
        );
      },
    },
    {
      title: "Distinct",
      dataIndex: "distinct_count",
      key: "distinct",
      width: "15%",
      render: (count, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800">
            {new Intl.NumberFormat().format(count || 0)}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase ">
            {(record.distinct_percentage ?? 0).toFixed(1)}% unique
          </span>
        </div>
      ),
    },
    {
      title: "Range (Min - Max)",
      key: "range",
      width: "25%",
      render: (_, record) => (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase">
              Min
            </span>
            <span className="text-[11px] font-mono text-slate-700 truncate">
              {record.min?.toString() || "N/A"}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase">
              Max
            </span>
            <span className="text-[11px] font-mono text-slate-700 truncate">
              {record.max?.toString() || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Avg / Median",
      key: "stats",
      width: "20%",
      render: (_, record) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase w-10">
              Avg:
            </span>
            <span className="text-xs font-bold text-slate-700">
              {record.avg !== undefined && record.avg !== null
                ? record.avg.toFixed(2)
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase w-10">
              Med:
            </span>
            <span className="text-xs font-bold text-slate-700">
              {record.median !== undefined && record.median !== null
                ? record.median.toFixed(2)
                : "N/A"}
            </span>
          </div>
        </div>
      ),
    },
  ];

  if (loading && !asset) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#f8fafc]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium animate-pulse ">
          Retrieving Asset Metadata Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <PageHeader
                title={asset?.display_name || asset?.name || "Asset Details"}
                description={
                  asset?.description ||
                  "Comprehensive metadata profile and schema definition."
                }
                breadcrumbItems={breadcrumbItems}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end pr-4 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ">
                  Asset Type
                </span>
                <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {asset?.asset_type}
                </span>
              </div>
              <Button
                type="primary"
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold h-10 px-5 shadow-sm"
              >
                Create Catalog View
              </Button>
              <Tooltip title="Refresh Metadata">
                <button
                  onClick={fetchData}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer bg-white"
                >
                  <Activity
                    size={20}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 flex flex-col gap-6">
        <Tabs
          defaultActiveKey="overview"
          className="custom-detail-tabs"
          items={[
            {
              key: "overview",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <LayoutDashboard size={16} />
                  <span>Overview</span>
                </div>
              ),
              children: (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-3 gap-6">
                    <Card className="rounded-2xl border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                          <Info size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 ">
                            Technical FQN
                          </h4>
                          <p className="text-sm font-mono text-slate-700 break-all font-bold">
                            {asset?.fully_qualified_name}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="rounded-2xl border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                          <Activity size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 ">
                            Data Volume
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider ">
                              Rows
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {new Intl.NumberFormat().format(
                                asset?.row_count || 0,
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider ">
                              Size
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {formatBytes(asset?.size_bytes)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                    <Card className="rounded-2xl border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                          <Clock size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 ">
                            Temporal Audit
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider p-4">
                              Created
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {asset?.created_at || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider p-4 ">
                              Updated
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {asset?.updated_at || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Governance Section */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card
                      title={
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 ">
                          <Shield size={14} /> Governance Labels
                        </div>
                      }
                      className="rounded-2xl border-slate-200 shadow-sm"
                    >
                      <Flex vertical className="w-full" gap="middle">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ">
                            Data Sensitivity
                          </span>
                          <Tag
                            color={getSensitivityColor(asset?.sensitivity)}
                            className="m-0 uppercase font-black tracking-tighter text-[10px] border-none px-3 rounded-full"
                          >
                            {asset?.sensitivity || "Not Defined"}
                          </Tag>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ">
                            Infrastructure Tier
                          </span>
                          <Tag
                            color={getTierColor(asset?.tier)}
                            className="m-0 uppercase font-black tracking-tighter text-[10px] border-none px-3 rounded-full"
                          >
                            {asset?.tier || "Not Defined"}
                          </Tag>
                        </div>
                        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ">
                            Classification Tags
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {asset?.classification_tags?.map((tag) => (
                              <Tag
                                key={tag.id}
                                className="m-0 px-2.5 py-0.5 border  rounded-full text-[10px] font-bold uppercase"
                                style={{
                                  color: tag.color,
                                  borderColor: tag.color
                                    ? `${tag.color}30`
                                    : undefined,
                                  backgroundColor: tag.color
                                    ? `${tag.color}10`
                                    : undefined,
                                }}
                              >
                                {tag.display_name || tag.name}
                              </Tag>
                            )) || (
                              <span className="text-[10px] text-slate-300 ">
                                No classifications
                              </span>
                            )}
                          </div>
                        </div>
                      </Flex>
                    </Card>

                    <Card
                      title={
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 ">
                          <User size={14} /> Custodians & Experts
                        </div>
                      }
                      className="rounded-2xl border-slate-200 shadow-sm"
                    >
                      <div className="space-y-6">
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 ">
                            Data Owners
                          </h5>
                          <div className="flex flex-wrap gap-3">
                            {asset?.owners?.map((owner) => (
                              <div
                                key={owner.id}
                                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 min-w-[140px]"
                              >
                                <Avatar
                                  size="small"
                                  icon={<User size={12} />}
                                  className="bg-blue-100 text-blue-600"
                                />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-slate-700">
                                    {owner.name}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium truncate max-w-[100px]">
                                    {owner.email}
                                  </span>
                                </div>
                              </div>
                            )) || (
                              <span className="text-[10px] text-slate-300 ">
                                No owners assigned
                              </span>
                            )}
                          </div>
                        </div>
                        <Divider className="m-0" />
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 ">
                            Subject Matter Experts
                          </h5>
                          <div className="flex flex-wrap gap-3">
                            {asset?.experts?.map((expert) => (
                              <div
                                key={expert.id}
                                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 min-w-[140px]"
                              >
                                <Avatar
                                  size="small"
                                  icon={<Zap size={12} />}
                                  className="bg-amber-100 text-amber-600"
                                />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-slate-700">
                                    {expert.name}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium truncate max-w-[100px]">
                                    {expert.email}
                                  </span>
                                </div>
                              </div>
                            )) || (
                              <span className="text-[10px] text-slate-300 ">
                                No experts assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ),
            },
            {
              key: "profile",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <BarChart3 size={16} />
                  <span>Profile</span>
                </div>
              ),
              children: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {latestProfile ? (
                    <>
                      {/* Profiling Summary Card */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-blue-50/30 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                              <Activity size={24} />
                            </div>
                            <div>
                              <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-0.5 ">
                                Latest Profiling Audit
                              </h4>
                              <p className="text-sm font-bold text-slate-800">
                                Scaled on{" "}
                                <span className="text-blue-600">
                                  {new Intl.NumberFormat().format(
                                    latestProfile.row_count || 0,
                                  )}
                                </span>{" "}
                                rows
                                <span className="mx-2 text-slate-300">|</span>
                                <span className="text-slate-500 font-medium  text-xs">
                                  Run completed at {latestProfile.completed_at}
                                </span>
                              </p>
                            </div>
                          </div>
                          <Tag className="m-0 bg-blue-600 text-white border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                            Bot Verified
                          </Tag>
                        </div>
                      </Card>

                      {/* Column Analytics Table */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <Table
                          dataSource={Object.entries(
                            latestProfile.column_profiles,
                          ).map(([name, profile]) => ({
                            name,
                            ...profile,
                          }))}
                          columns={columnProfileColumns}
                          rowKey="name"
                          pagination={false}
                          className="custom-column-table"
                          scroll={{ y: "calc(100vh - 450px)" }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                      <div className="p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
                        <AlertTriangle size={48} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-400  mb-1 uppercase tracking-tighter">
                        No Profiling Data Available
                      </h3>
                      <p className="text-slate-400 text-xs font-medium max-w-xs text-center leading-relaxed ">
                        The automated profiling agent hasn't analyzed this asset
                        yet. Trigger a bot run to generate statistical
                        distributions and quality metrics.
                      </p>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "columns",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <Layers size={16} />
                  <span>Columns ({asset?.columns.length || 0})</span>
                </div>
              ),
              children: (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight">Schema Definition</h3>
                      <p className="text-xs text-slate-500">Manage columns, descriptions, and data typing.</p>
                    </div>
                    <div className="flex gap-2">
                      {!isEditingColumns ? (
                        <Button onClick={handleEditColumns} icon={<Edit2 size={16} />}>Edit Columns</Button>
                      ) : (
                        <>
                          <Button onClick={handleCancelEdit} icon={<X size={16} />}>Cancel</Button>
                          <Button type="primary" onClick={handleSaveColumns} loading={loading} icon={<Save size={16} />}>Save Changes</Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table
                      dataSource={isEditingColumns ? editableColumns : (asset?.columns || [])}
                      columns={isEditingColumns ? editableColumnsConfig : columnColumns}
                      rowKey="name"
                      pagination={false}
                      className="custom-column-table"
                      scroll={{ x: isEditingColumns ? 1200 : undefined, y: "calc(100vh - 400px)" }}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800">
                {profilingData?.column_name || "Column Profiling"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                {profilingData?.data_type}
              </span>
            </div>
          </div>
        }
        placement="right"
        size="large"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        closeIcon={null}
        extra={
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        }
      >
        {isColumnLoading && !profilingData ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Spin size="large" />
            <p className="text-slate-400 text-xs animate-pulse">
              Generating profiling insights...
            </p>
          </div>
        ) : profilingData ? (
          <div className="flex flex-col gap-8 pb-10">
            {/* Stats Overview */}
            <section>
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">
                Data Quality Overview
              </h4>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" className="bg-slate-50 border-none shadow-sm">
                    <Statistic 
                      title={<span className="text-[10px] font-bold uppercase text-slate-400">Null Percentage</span>}
                      value={profilingData?.stats?.null_pct}
                      precision={2}
                      suffix="%"
                      styles={{ content: { color: (profilingData?.stats?.null_pct || 0) > 10 ? '#ef4444' : '#10b981', fontSize: '18px', fontWeight: 800 } }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="bg-slate-50 border-none shadow-sm">
                    <Statistic 
                      title={<span className="text-[10px] font-bold uppercase text-slate-400">Distinct Count</span>}
                      value={profilingData?.stats?.distinct_count}
                      styles={{ content: { color: '#2563eb', fontSize: '18px', fontWeight: 800 } }}
                    />
                  </Card>
                </Col>
              </Row>
            </section>

            {/* Statistical Metrics */}
            <section>
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">
                Statistical Distribution
              </h4>
              <div className="grid grid-cols-2 gap-px bg-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                {[
                  { label: "Min", value: profilingData?.stats?.min_val },
                  { label: "Max", value: profilingData?.stats?.max_val },
                  { label: "Mean", value: profilingData?.stats?.mean_val },
                  { label: "Std Deviation", value: profilingData?.stats?.stddev_val },
                ].map((item) => (
                  <div key={item.label} className="bg-white p-4">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{item.label}</span>
                    <span className="text-sm font-bold text-slate-700 font-mono">{item.value?.toString() || "—"}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Histogram Chart */}
            {profilingData.stats.histogram && profilingData.stats.histogram.length > 0 && (
              <section>
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">
                  Value Frequency (Histogram)
                </h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="h-40 flex items-end gap-1">
                    {(() => {
                      const histogram = profilingData?.stats?.histogram || [];
                      const maxCount = Math.max(...histogram.map(h => h.count), 1);
                      return histogram.map((h: any, i: number) => (
                        <Tooltip key={i} title={`${h.bucket}: ${h.count}`}>
                          <div 
                            className="bg-blue-500 hover:bg-blue-600 transition-all rounded-t-sm flex-1 cursor-help"
                            style={{ height: `${(h.count / maxCount) * 100}%` }}
                          />
                        </Tooltip>
                      ));
                    })()}
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>{profilingData?.stats?.histogram?.[0]?.bucket}</span>
                    <span>{profilingData?.stats?.histogram?.[Math.floor((profilingData?.stats?.histogram?.length || 0) / 2)]?.bucket}</span>
                    <span>{profilingData?.stats?.histogram?.[(profilingData?.stats?.histogram?.length || 0) - 1]?.bucket}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Top Values */}
            {profilingData?.stats?.top_values && profilingData.stats.top_values.length > 0 && (
              <section>
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">
                  Most Frequent Values
                </h4>
                <div className="flex flex-col gap-2">
                  {profilingData.stats.top_values.map((v: any, i: number) => {
                    const total = profilingData?.stats?.top_values?.reduce((acc, curr) => acc + curr.count, 0) || 1;
                    return (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-700 truncate max-w-[70%] font-mono">{v.value?.toString() || "NULL"}</span>
                          <span className="text-slate-400 text-[10px]">{v.count} occurrences</span>
                        </div>
                        <Progress percent={(v.count / total) * 100} showInfo={false} size="small" strokeColor="#2563eb" railColor="#f1f5f9" />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Sample Data Preview */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  Sample Data ({profilingData?.total_matching || 0})
                </h4>
                <div className="flex gap-1">
                  <button 
                    disabled={profilePagination.skip === 0}
                    onClick={() => handleColumnClick(selectedColumnId!, Math.max(0, profilePagination.skip - profilePagination.limit))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Prev
                  </button>
                  <button 
                    disabled={profilePagination.skip + profilePagination.limit >= (profilingData?.total_matching || 0)}
                    onClick={() => handleColumnClick(selectedColumnId!, profilePagination.skip + profilePagination.limit)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <Table
                  dataSource={(profilingData?.rows || []).map((r, i) => ({ key: i, val: r }))}
                  columns={[{ title: "Value", dataIndex: "val", key: "val", render: (v) => <span className="font-mono text-xs text-slate-600">{v?.toString() || "—"}</span> }]}
                  pagination={false}
                  size="small"
                  className="profiling-preview-table"
                />
              </div>
            </section>
          </div>
        ) : (
          <Empty description="No profiling data found for this column." className="mt-20" />
        )}
      </Drawer>

      <style jsx global>{`
        .custom-detail-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #f1f5f9;
        }
        .custom-detail-tabs .ant-tabs-tab {
          padding: 12px 0;
          margin: 0 16px 0 0 !important;
        }
        .custom-detail-tabs .ant-tabs-tab-btn {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }
        .custom-detail-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #2563eb;
        }
        .custom-detail-tabs .ant-tabs-ink-bar {
          background: #2563eb;
          height: 3px !important;
          border-radius: 99px;
        }

        .custom-column-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          padding: 14px 24px !important;
        }
        .custom-column-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
      `}</style>
      <CreateCatalogViewModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        initialAssetId={asset_id as string}
        onSuccess={(id) => {
          if (id) router.push(`/explore/object-resources/${id}`);
        }}
      />
    </div>
  );
}
