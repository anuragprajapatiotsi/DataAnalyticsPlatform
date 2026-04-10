"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  Tag,
  Table,
  Spin,
  message,
  Tooltip,
  Avatar,
  Divider,
  Progress,
  Drawer,
  Empty,
  Statistic,
  Input,
  Select,
  Switch,
  Button,
  Popconfirm,
} from "antd";
import {
  Database,
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
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  Trash2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import {
  DataAssetDetail,
  DataAssetColumn,
  DataAssetProfile,
  ColumnProfile,
  ColumnProfilingResponse,
  ExplorerAssetDetail,
  ExplorerAssetDetailResponse,
  ExplorerAssetColumn,
  ExplorerAssetColumnStat,
} from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { CreateCatalogViewModal } from "@/features/explore/components/CreateCatalogViewModal";
import { cn } from "@/shared/utils/cn";
import { useAuthContext } from "@/shared/contexts/auth-context";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function isExplorerAssetDetailResponse(
  response: ExplorerAssetDetail | ExplorerAssetDetailResponse,
): response is ExplorerAssetDetailResponse {
  return "asset" in response;
}

function mapExplorerColumnsToDataAssetColumns(
  columns: ExplorerAssetColumn[],
  fallbackSensitivity?: string,
): DataAssetColumn[] {
  return columns.map((column, index) => ({
    id: column.id || `column-${column.name}-${index}`,
    name: column.name,
    data_type: String(column.data_type || column.type || "unknown"),
    display_name: column.name,
    description: column.description,
    is_nullable: Boolean(column.nullable),
    is_primary_key: false,
    is_foreign_key: false,
    is_pii: false,
    sensitivity: fallbackSensitivity,
    tags: [],
  }));
}

function mapExplorerDetailToDataAsset(
  detail: ExplorerAssetDetail,
  columns: ExplorerAssetColumn[] = [],
): DataAssetDetail {
  return {
    id: detail.id,
    name: detail.name,
    display_name: detail.display_name || detail.name,
    description: detail.description || "",
    asset_type: (detail.asset_type || detail.object_type || "table") as "table" | "view" | "function",
    row_count: detail.row_count,
    size_bytes: detail.size_bytes ?? detail.size,
    observability_score:
      typeof detail.observability_score === "number" ? detail.observability_score : undefined,
    classification_tags: Array.isArray(detail.classification_tags)
      ? (detail.classification_tags as DataAssetDetail["classification_tags"])
      : [],
    fully_qualified_name:
      typeof detail.fully_qualified_name === "string"
        ? detail.fully_qualified_name
        : detail.display_name || detail.name,
    sensitivity: detail.sensitivity as DataAssetDetail["sensitivity"],
    tier: detail.tier as DataAssetDetail["tier"],
    owners: Array.isArray(detail.owners) ? (detail.owners as DataAssetDetail["owners"]) : [],
    experts: Array.isArray(detail.experts) ? (detail.experts as DataAssetDetail["experts"]) : [],
    created_at: detail.created_at,
    updated_at: detail.updated_at,
    columns: mapExplorerColumnsToDataAssetColumns(
      columns.length > 0 ? columns : ((detail.columns as ExplorerAssetColumn[] | undefined) ?? []),
      detail.sensitivity,
    ),
  };
}

function mapColumnStatsToProfile(
  latestProfile: ExplorerAssetDetailResponse["latest_profile"],
  columnStats: ExplorerAssetColumnStat[] = [],
): DataAssetProfile | null {
  if (!latestProfile) {
    return null;
  }

  const column_profiles = columnStats.reduce<Record<string, ColumnProfile>>((acc, stat) => {
    const name = stat.column_name || stat.name;
    if (!name) {
      return acc;
    }

    acc[name] = {
      null_count: stat.null_count ?? 0,
      null_percentage: stat.null_percentage ?? 0,
      distinct_count: stat.distinct_count ?? 0,
      distinct_percentage: stat.distinct_percentage ?? 0,
      min: stat.min,
      max: stat.max,
      avg: stat.avg,
      median: stat.median,
      std_dev: stat.std_dev,
      histogram: Array.isArray(stat.histogram) ? stat.histogram : [],
    };
    return acc;
  }, {});

  return {
    id: latestProfile.id,
    asset_id: "",
    row_count: latestProfile.row_count ?? 0,
    profile_data: (latestProfile.profile_data as Record<string, unknown>) ?? {},
    column_profiles,
    started_at: latestProfile.started_at || latestProfile.created_at || "",
    completed_at: latestProfile.completed_at || latestProfile.created_at || "",
  };
}

function normalizeExplorerAssetResponse(
  response: ExplorerAssetDetail | ExplorerAssetDetailResponse,
): { asset: DataAssetDetail; latestProfile: DataAssetProfile | null } {
  if (isExplorerAssetDetailResponse(response)) {
    return {
      asset: mapExplorerDetailToDataAsset(response.asset, response.columns ?? []),
      latestProfile: mapColumnStatsToProfile(response.latest_profile, response.column_stats ?? []),
    };
  }

  return {
    asset: mapExplorerDetailToDataAsset(response),
    latestProfile: null,
  };
}

export default function DataAssetDetailPage() {
  const { asset_id } = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const [asset, setAsset] = useState<DataAssetDetail | null>(null);
  const [latestProfile, setLatestProfile] = useState<DataAssetProfile | null>(null);
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
      prev.map((col) => (col.name === columnName ? { ...col, [field]: value } : col))
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
      message.error("Failed to update columns.");
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
      if (isEditingColumns) {
        setEditableColumns(prev => prev.filter(col => col.id !== columnId && col.name !== columnId));
      }
      fetchData();
    } catch (err: any) {
      console.error("Column deletion failed:", err);
      message.error("Failed to delete column.");
    } finally {
      setLoading(false);
    }
  };

  const handleColumnClick = async (columnId: string, skip = 0) => {
    try {
      if (!asset_id || !columnId) throw new Error("Missing identifiers.");
      setSelectedColumnId(columnId);
      setProfilePagination(prev => ({ ...prev, skip }));
      setIsColumnLoading(true);
      setIsDrawerOpen(true);

      const data = await serviceService.getColumnProfilingData(asset_id as string, columnId, { skip, limit: profilePagination.limit });
      setProfilingData(data);
    } catch (err: any) {
      message.error("Failed to load profiling insights.");
      setIsDrawerOpen(false);
    } finally {
      setIsColumnLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    if (!asset_id) return;
    try {
      setLoading(true);
      const assetData = await serviceService.getExplorerAssetDetail(asset_id as string);
      const normalized = normalizeExplorerAssetResponse(assetData);
      setAsset(normalized.asset);
      setLatestProfile(
        normalized.latestProfile
          ? { ...normalized.latestProfile, asset_id: asset_id as string }
          : null,
      );
    } catch (err) {
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
  const dbid = searchParams.get("dbid");
  const sn = searchParams.get("sn");
  const an = searchParams.get("an");
  const sid = searchParams.get("sid");

  const buildDatabaseHref = () => {
    if (!eid || !dbid) {
      return eid ? `/explore/data-assets/${eid}` : undefined;
    }

    const params = new URLSearchParams();
    params.set("level", "database");
    params.set("eid", eid);
    if (en) params.set("en", en);
    if (db) params.set("db", db);
    return `/explore/data-assets/schema/${dbid}?${params.toString()}`;
  };

  const buildSchemaHref = () => {
    if (!sid) {
      return buildDatabaseHref();
    }

    const params = new URLSearchParams();
    params.set("level", "schema");
    if (eid) params.set("eid", eid);
    if (en) params.set("en", en);
    if (db) params.set("db", db);
    if (dbid) params.set("dbid", dbid);
    params.set("sid", sid);
    if (sn) params.set("sn", sn);
    return `/explore/data-assets/schema/${sid}?${params.toString()}`;
  };

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets", href: "/explore/data-assets" },
    ...(eid && en ? [{ label: en, href: `/explore/data-assets/${eid}` }] : []),
    ...(db ? [{ label: db, href: buildDatabaseHref() }] : []),
    ...(sid && sn ? [{ label: sn, href: buildSchemaHref() }] : []),
    { label: an || asset?.display_name || asset?.name || "Asset Details" },
  ];

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "N/A";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSensitivityColor = (level?: string) => {
    switch (level) {
      case "PII": return { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
      case "Restricted": return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
      case "Internal": return { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };
      case "Public": return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
      default: return { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "Platinum": return { text: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" };
      case "Gold": return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
      case "Silver": return { text: "text-slate-600", bg: "bg-slate-100", border: "border-slate-300" };
      case "Bronze": return { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
      default: return { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
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
          className="flex items-center gap-2 cursor-pointer group w-fit"
          onClick={() => handleColumnClick(record.id || record.name)}
        >
          {record.is_primary_key && <Key size={14} className="text-amber-500" />}
          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {name}
          </span>
          {record.is_nullable && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded">null</span>
          )}
        </div>
      ),
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "type",
      width: "15%",
      render: (type) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono">
          {type}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (desc) => (
        <span className="text-[13px] text-slate-500 line-clamp-2">
          {desc || "No description provided."}
        </span>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "15%",
      render: (tags: any[]) => (
        <div className="flex flex-wrap gap-1.5">
          {tags?.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 border rounded text-[10px] font-medium"
              style={{
                color: tag.color || "#64748b",
                borderColor: tag.color ? `${tag.color}30` : "#e2e8f0",
                backgroundColor: tag.color ? `${tag.color}10` : "#f8fafc",
              }}
            >
              {tag.display_name || tag.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()} className="pr-2">
          <Popconfirm
            title="Delete Column"
            description="Are you sure you want to delete this column?"
            onConfirm={() => handleDeleteColumn(record.id || record.name)}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            <Button type="text" className="text-slate-400 hover:text-red-600 hover:bg-red-50" icon={<Trash2 size={14} />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const editableColumnsConfig: ColumnsType<DataAssetColumn> = [
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (name, record) => (
        <div className="flex flex-col gap-1.5">
          <Input 
            value={record.display_name || name} 
            onChange={(e) => handleColumnChange(record.name, 'display_name', e.target.value)} 
            placeholder="Display Name" 
            className="text-[13px] h-8 rounded-md" 
          />
          <span className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-slate-500 font-mono truncate w-fit">
            {name}
          </span>
        </div>
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
          className="text-[12px] font-mono h-8 rounded-md" 
        />
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (desc, record) => (
        <Input.TextArea 
          value={desc || ""} 
          onChange={(e) => handleColumnChange(record.name, 'description', e.target.value)} 
          autoSize={{ minRows: 1, maxRows: 3 }} 
          className="text-[13px] rounded-md min-h-[32px]" 
          placeholder="Add description..."
        />
      ),
    },
    {
      title: "Properties",
      key: "properties",
      width: "25%",
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          {['primary_key', 'foreign_key', 'nullable', 'pii'].map(prop => {
            const key = `is_${prop}` as keyof DataAssetColumn;
            return (
              <div key={prop} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">{prop === 'primary_key' ? 'PK' : prop === 'foreign_key' ? 'FK' : prop.replace('is_', '')}</span>
                <Switch size="small" checked={!!record[key]} onChange={(chk) => handleColumnChange(record.name, key, chk)} />
              </div>
            )
          })}
        </div>
      ),
    },
    {
      title: "Sensitivity",
      dataIndex: "sensitivity",
      key: "sensitivity",
      width: "10%",
      render: (val, record) => (
        <Select 
          value={val || "Not Defined"} 
          onChange={(v) => handleColumnChange(record.name, 'sensitivity', v)} 
          className="text-[12px] w-full"
          size="middle"
          options={['Not Defined', 'Public', 'Internal', 'Confidential', 'Restricted', 'PII'].map(opt => ({ value: opt, label: opt }))}
        />
      ),
    },
  ];

  const columnProfileColumns: ColumnsType<{ name: string } & ColumnProfile> = [
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (name) => (
        <span className="font-semibold text-slate-900">{name}</span>
      ),
    },
    {
      title: "Null Rate",
      dataIndex: "null_percentage",
      key: "null_percentage",
      width: "20%",
      render: (pct) => {
        const safePct = pct ?? 0;
        const color = safePct > 20 ? "#ef4444" : "#10b981";
        return (
          <div className="flex flex-col gap-1 max-w-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nulls</span>
              <span className="text-[11px] font-mono font-bold" style={{ color }}>{safePct.toFixed(1)}%</span>
            </div>
            <Progress percent={safePct} showInfo={false} size="small" strokeColor={color} railColor="#f1f5f9" />
          </div>
        );
      },
    },
    {
      title: "Uniqueness",
      dataIndex: "distinct_count",
      key: "distinct",
      width: "15%",
      render: (count, record) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-slate-800 font-mono">
            {new Intl.NumberFormat().format(count || 0)}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {(record.distinct_percentage ?? 0).toFixed(1)}% distinct
          </span>
        </div>
      ),
    },
    {
      title: "Value Range",
      key: "range",
      width: "25%",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Min</span>
            <span className="text-[11px] font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 truncate max-w-[80px]">
              {record.min?.toString() || "—"}
            </span>
          </div>
          <div className="text-slate-300">-</div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Max</span>
            <span className="text-[11px] font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 truncate max-w-[80px]">
              {record.max?.toString() || "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Distribution",
      key: "stats",
      width: "20%",
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Mean:</span>
            <span className="font-mono text-slate-700 font-medium">{record.avg !== undefined && record.avg !== null ? record.avg.toFixed(2) : "—"}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Median:</span>
            <span className="font-mono text-slate-700 font-medium">{record.median !== undefined && record.median !== null ? record.median.toFixed(2) : "—"}</span>
          </div>
        </div>
      ),
    },
  ];

  if (loading && !asset) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#FAFAFA]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium text-[13px]">Retrieving Asset Metadata Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA] animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="px-6 pt-5 pb-4 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <PageHeader
                title={asset?.display_name || asset?.name || "Asset Details"}
                description={asset?.description || "Comprehensive metadata profile and schema definition."}
                breadcrumbItems={breadcrumbItems}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end pr-5 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Asset Type</span>
                <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">{asset?.asset_type}</span>
              </div>
              <Button onClick={() => setIsModalOpen(true)} className="h-9 px-4 font-medium rounded-md">
                Create Catalog View
              </Button>
              <Tooltip title="Refresh Metadata">
                <Button onClick={fetchData} icon={<Activity size={14} className={loading ? "animate-spin" : ""} />} className="h-9 w-9 p-0 flex items-center justify-center rounded-md text-slate-500 hover:text-blue-600" />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Area */}
      <div className="flex-1 overflow-auto p-6 max-w-[1400px] mx-auto w-full flex flex-col">
        <Tabs
          defaultActiveKey="overview"
          className="custom-detail-tabs"
          items={[
            {
              key: "overview",
              label: <div className="flex items-center gap-2"><LayoutDashboard size={14} /><span>Overview</span></div>,
              children: (
                <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 shrink-0"><Info size={18} /></div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">Technical FQN</span>
                        <span className="text-[13px] font-mono font-medium text-slate-900 break-all leading-snug">{asset?.fully_qualified_name}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 shrink-0"><Activity size={18} /></div>
                      <div className="flex flex-col w-full">
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-2">Data Volume</span>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Rows</span>
                            <span className="text-[13px] font-mono font-semibold text-slate-900">{new Intl.NumberFormat().format(asset?.row_count || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Size</span>
                            <span className="text-[13px] font-mono font-semibold text-slate-900">{formatBytes(asset?.size_bytes)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0"><Clock size={18} /></div>
                      <div className="flex flex-col w-full">
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-2">Temporal Audit</span>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Created</span>
                            <span className="text-[12px] font-medium text-slate-700">{asset?.created_at ? dayjs(asset?.created_at).format("MMM D, YYYY") : "—"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Updated</span>
                            <span className="text-[12px] font-medium text-slate-700">{asset?.updated_at ? dayjs(asset?.updated_at).format("MMM D, YYYY") : "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Governance Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 m-0 border-b border-slate-100 pb-3">
                        <Shield size={14} className="text-slate-400"/> Governance Labels
                      </h4>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-slate-600">Data Sensitivity</span>
                          {(() => {
                            const style = getSensitivityColor(asset?.sensitivity);
                            return (
                              <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", style.bg, style.text, style.border)}>
                                {asset?.sensitivity || "Not Defined"}
                              </span>
                            );
                          })()}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-slate-600">Infrastructure Tier</span>
                          {(() => {
                            const style = getTierColor(asset?.tier);
                            return (
                              <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", style.bg, style.text, style.border)}>
                                {asset?.tier || "Not Defined"}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                          <span className="text-[12px] font-medium text-slate-600">Classification Tags</span>
                          <div className="flex flex-wrap gap-1.5">
                            {asset?.classification_tags?.map(tag => (
                              <span key={tag.id} className="px-2 py-0.5 rounded text-[10px] font-medium border" style={{ backgroundColor: tag.color ? `${tag.color}10` : "#f8fafc", color: tag.color || "#64748b", borderColor: tag.color ? `${tag.color}30` : "#e2e8f0" }}>
                                {tag.display_name || tag.name}
                              </span>
                            )) || <span className="text-[12px] text-slate-400 italic">No classifications</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 m-0 border-b border-slate-100 pb-3">
                        <User size={14} className="text-slate-400"/> Custodians & Experts
                      </h4>
                      
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Data Owners</span>
                          <div className="flex flex-wrap gap-2">
                            {asset?.owners?.map(owner => (
                              <div key={owner.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 min-w-[160px]">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">{owner.name.charAt(0)}</div>
                                <div className="flex flex-col">
                                  <span className="text-[12px] font-semibold text-slate-700 leading-tight">{owner.name}</span>
                                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{owner.email}</span>
                                </div>
                              </div>
                            )) || <span className="text-[12px] text-slate-400 italic">No owners assigned</span>}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Subject Matter Experts</span>
                          <div className="flex flex-wrap gap-2">
                            {asset?.experts?.map(expert => (
                              <div key={expert.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 min-w-[160px]">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold">{expert.name.charAt(0)}</div>
                                <div className="flex flex-col">
                                  <span className="text-[12px] font-semibold text-slate-700 leading-tight">{expert.name}</span>
                                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{expert.email}</span>
                                </div>
                              </div>
                            )) || <span className="text-[12px] text-slate-400 italic">No experts assigned</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "profile",
              label: <div className="flex items-center gap-2"><BarChart3 size={14} /><span>Profile Data</span></div>,
              children: (
                <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4 h-full">
                  {latestProfile ? (
                    <>
                      {/* Profiling Summary Card */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600"><Activity size={20} /></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-0.5">Latest Profiling Audit</span>
                            <div className="flex items-center gap-2 text-[13px]">
                              <span className="text-slate-600">Scaled on</span>
                              <span className="font-mono font-bold text-slate-900">{new Intl.NumberFormat().format(latestProfile.row_count || 0)} rows</span>
                              <span className="text-slate-300 mx-1">|</span>
                              <span className="text-slate-500">Run completed at <span className="font-medium text-slate-700">{latestProfile.completed_at}</span></span>
                            </div>
                          </div>
                        </div>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Bot Verified</span>
                      </div>

                      {/* Column Analytics Table Container */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                        <Table
                          dataSource={Object.entries(latestProfile.column_profiles).map(([name, profile]) => ({ name, ...profile }))}
                          columns={columnProfileColumns}
                          rowKey="name"
                          pagination={false}
                          className="custom-explore-table flex-1 flex flex-col h-full"
                          scroll={{ y: "calc(100vh - 380px)" }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed shadow-sm">
                      <AlertTriangle size={32} className="text-slate-300 mb-4" />
                      <span className="text-[14px] font-medium text-slate-700 mb-1">No Profiling Data Available</span>
                      <span className="text-[13px] text-slate-500 max-w-sm text-center">The automated profiling agent hasn't analyzed this asset yet.</span>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "columns",
              label: <div className="flex items-center gap-2"><Layers size={14} /><span>Columns</span></div>,
              children: (
                <div className="flex flex-col gap-4 animate-in fade-in duration-500 mt-4 h-full">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-slate-800">Schema Definition</span>
                      <span className="text-[13px] text-slate-500">Manage columns, descriptions, and data typing.</span>
                    </div>
                    <div className="flex gap-2">
                      {!isEditingColumns ? (
                        <Button onClick={handleEditColumns} icon={<Edit2 size={14} />} className="h-8 px-3 text-[13px] rounded-md font-medium">Edit Columns</Button>
                      ) : (
                        <>
                          <Button onClick={handleCancelEdit} icon={<X size={14} />} className="h-8 px-3 text-[13px] rounded-md font-medium text-slate-600">Cancel</Button>
                          <Button type="primary" onClick={handleSaveColumns} loading={loading} icon={<Save size={14} />} className="h-8 px-3 text-[13px] rounded-md font-medium bg-slate-900 text-white">Save Changes</Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Columns Table Container */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                    <Table
                      dataSource={isEditingColumns ? editableColumns : (asset?.columns || [])}
                      columns={isEditingColumns ? editableColumnsConfig : columnColumns}
                      rowKey="name"
                      pagination={false}
                      className="custom-explore-table flex-1 flex flex-col h-full"
                      scroll={{ x: isEditingColumns ? 1200 : undefined, y: "calc(100vh - 360px)" }}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Profiling Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 border border-blue-100 text-blue-600">
              <Layers size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-slate-900 leading-tight">
                {profilingData?.column_name || "Column Profiling"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                {profilingData?.data_type || "Unknown Type"}
              </span>
            </div>
          </div>
        }
        placement="right"
        size="large"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        closeIcon={<X size={18} className="text-slate-400 hover:text-slate-700" />}
        styles={{
          header: { borderBottom: "1px solid #f1f5f9", padding: "16px 24px" },
          body: { padding: "24px", background: "#FAFAFA" }
        }}
      >
        {isColumnLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Spin size="large" />
            <span className="text-sm text-slate-500 font-medium">Analyzing column data...</span>
          </div>
        ) : profilingData ? (() => {
          const data = profilingData;
          return (
            <div className="flex flex-col gap-6">
              {/* Data Quality Overview */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0">Data Quality Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-tight mb-1">Null Percentage</div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-900">{(data.stats.null_pct * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      percent={data.stats.null_pct * 100} 
                      showInfo={false} 
                      size="small" 
                      strokeColor={data.stats.null_pct > 0.1 ? "#ef4444" : "#2563eb"}
                      railColor="#f1f5f9"
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-tight mb-1">Distinct Count</div>
                    <div className="text-2xl font-bold text-slate-900">{data.stats.distinct_count.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-medium">Unique values in column</div>
                  </div>
                </div>
              </div>

              {/* Statistical Distribution */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0">Statistical Distribution</h4>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
                    <div className="p-4">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Minimum</div>
                      <div className="text-[14px] font-bold text-slate-800 truncate">{data.stats.min_val ?? "N/A"}</div>
                    </div>
                    <div className="p-4 border-t-0">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Maximum</div>
                      <div className="text-[14px] font-bold text-slate-800 truncate">{data.stats.max_val ?? "N/A"}</div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Average / Mean</div>
                      <div className="text-[14px] font-bold text-slate-800">{data.stats.mean_val?.toFixed(2) ?? "N/A"}</div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Std. Deviation</div>
                      <div className="text-[14px] font-bold text-slate-800">{data.stats.stddev_val?.toFixed(2) ?? "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Distribution */}
              {data.stats.top_values && data.stats.top_values.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0">Top Values Distribution</h4>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    {data.stats.top_values.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-medium text-slate-700 truncate max-w-[200px]">{String(item.value)}</span>
                          <span className="text-slate-500 font-mono">{item.count.toLocaleString()}</span>
                        </div>
                        <Progress 
                          percent={(item.count / data.total_matching) * 100} 
                          showInfo={false} 
                          size="small" 
                          strokeColor="#e2e8f0"
                          className="m-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Data Table */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0">Sample Data</h4>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <Table
                    dataSource={data.rows}
                    columns={[
                      {
                        title: data.column_name,
                        dataIndex: data.column_name,
                        key: data.column_name,
                        render: (val) => (
                          <span className="text-[13px] text-slate-700 font-mono">
                            {val === null ? <Tag color="default">null</Tag> : String(val)}
                          </span>
                        )
                      }
                    ]}
                    pagination={{
                      current: Math.floor(data.skip / data.limit) + 1,
                      pageSize: data.limit,
                      total: data.total_matching,
                      size: "small",
                      showSizeChanger: false,
                      showLessItems: true,
                      className: "custom-explore-pagination",
                      onChange: (page) =>
                        handleColumnClick(selectedColumnId!, (page - 1) * data.limit),
                    }}
                    size="small"
                    className="custom-explore-table"
                  />
                </div>
              </div>
            </div>
          );
        })() : (
          <Empty description="No profiling data available" className="mt-20" />
        )}
      </Drawer>

      <style jsx global>{`
        /* Custom Detail Tabs Styling */
        .custom-detail-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        .custom-detail-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #f1f5f9;
        }
        .custom-detail-tabs .ant-tabs-tab {
          padding: 12px 0;
          margin: 0 24px 0 0 !important;
        }
        .custom-detail-tabs .ant-tabs-tab-btn {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          transition: color 0.2s ease;
        }
        .custom-detail-tabs .ant-tabs-tab:hover .ant-tabs-tab-btn {
          color: #334155;
        }
        .custom-detail-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #2563eb !important;
        }
        .custom-detail-tabs .ant-tabs-ink-bar {
          background: #2563eb;
          height: 2px !important;
        }

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
        .custom-explore-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }

        .custom-explore-table .ant-pagination.custom-explore-pagination {
          margin: 0 !important;
          padding: 12px 16px !important;
          border-top: 1px solid #f1f5f9;
          background: #fff;
        }
        
        /* Custom scrollbar */
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
