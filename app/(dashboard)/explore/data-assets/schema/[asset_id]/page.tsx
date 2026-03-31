"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Badge, Input, message, Tooltip, Progress, Space, Tag } from "antd";
import {
  Search,
  Database,
  Table as TableIcon,
  Eye,
  Zap,
  Activity,
  ChevronRight,
  Shield,
  Layers,
  FileText,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogAsset } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

export default function SchemaAssetsPage() {
  const router = useRouter();
  const { asset_id } = useParams();
  const [assets, setAssets] = useState<CatalogAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState<string>("all");

  const searchParams = useSearchParams();
  const eid = searchParams.get("eid");
  const en = searchParams.get("en");
  const db = searchParams.get("db");
  const sn = searchParams.get("sn");

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets", href: "/explore/data-assets" },
    ...(eid && en ? [{ label: en, href: `/explore/data-assets/${eid}` }] : []),
    ...(db ? [{ label: db, href: `/explore/data-assets/${eid}` }] : []),
    { label: sn || "Schema Inventory" },
  ];

  const fetchAssets = useCallback(async () => {
    if (!asset_id) return;
    try {
      setLoading(true);
      const data = await serviceService.getAssetChildren(asset_id as string);
      setAssets(data || []);
    } catch (err) {
      console.error("Failed to fetch schema assets:", err);
      message.error("Failed to load schema assets.");
    } finally {
      setLoading(false);
    }
  }, [asset_id]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchSearch = (a.display_name || a.name).toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = activeType === "all" || a.asset_type === activeType;
      return matchSearch && matchType;
    });
  }, [assets, searchTerm, activeType]);

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "N/A";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "N/A";
    return new Intl.NumberFormat().format(num);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "table": return <TableIcon size={16} className="text-blue-500" />;
      case "view": return <Eye size={16} className="text-purple-500" />;
      case "function": return <Zap size={16} className="text-amber-500" />;
      default: return <Database size={16} className="text-slate-400" />;
    }
  };

  const columns: ColumnsType<CatalogAsset> = [
    {
      title: "Asset Name",
      key: "name",
      width: "30%",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 italic">
            {getTypeIcon(record.asset_type)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{record.display_name || record.name}</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              {record.asset_type}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Operational Metrics",
      key: "metrics",
      width: "25%",
      render: (_, record) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 uppercase tracking-widest font-medium italic">Rows</span>
            <span className="text-slate-700 font-bold font-mono">{formatNumber(record.row_count)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 uppercase tracking-widest font-medium italic">Size</span>
            <span className="text-slate-700 font-bold font-mono">{formatBytes(record.size_bytes)}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Observability Score",
      dataIndex: "observability_score",
      key: "score",
      width: "20%",
      render: (score) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Health State</span>
            <span className={cn(
              "text-[10px] font-bold",
              (score || 0) > 80 ? "text-emerald-600" : (score || 0) > 50 ? "text-amber-600" : "text-rose-600"
            )}>
              {score ? `${score}%` : "No Data"}
            </span>
          </div>
          <Progress 
            percent={score || 0} 
            size="small" 
            showInfo={false} 
            strokeColor={(score || 0) > 80 ? "#10b981" : (score || 0) > 50 ? "#f59e0b" : "#ef4444"}
            railColor="#f1f5f9"
          />
        </div>
      ),
    },
    {
      title: "Classifications",
      dataIndex: "classification_tags",
      key: "tags",
      width: "20%",
      render: (tags: Array<{ id: string; name: string; display_name: string; color?: string }>) => (
        <div className="flex flex-wrap gap-1">
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <Tag 
                key={tag.id} 
                className="m-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border"
                style={{ 
                  backgroundColor: tag.color ? `${tag.color}10` : "#eff6ff", 
                  color: tag.color || "#2563eb",
                  borderColor: tag.color ? `${tag.color}30` : "#dbeafe"
                }}
              >
                {tag.display_name || tag.name}
              </Tag>
            ))
          ) : (
            <span className="text-[10px] text-slate-300 italic">No tags assigned</span>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      width: "5%",
      render: () => (
        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
      ),
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Schema Assets"
              description="Deep-dive into tables, views, and functions within your schema. Monitor health and data volumes."
              breadcrumbItems={breadcrumbItems}
            />
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end pr-4 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 italic">Asset Count</span>
                <span className="text-xl font-bold text-slate-800">{filteredAssets.length}</span>
              </div>
              <Tooltip title="Refresh Inventory">
                <button
                  onClick={fetchAssets}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer bg-white"
                >
                  <Activity size={20} className={loading ? "animate-spin" : ""} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="px-4 pb-4 flex items-center gap-2">
          {["all", "table", "view", "function"].map((type) => (
             <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border",
                activeType === type 
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 p-2 pt-2 overflow-hidden gap-6">
        {/* <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <Input
            placeholder="Search assets by name or type..."
            prefix={<Search size={16} className="text-slate-400" />}
            className="h-10 rounded-lg border-slate-200 max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}

        <div className="flex-1 min-h-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <Table
            dataSource={filteredAssets}
            columns={columns}
            rowKey="id"
            loading={loading}
            className="custom-explore-table flex-1 flex flex-col h-full"
            scroll={{ y: "calc(100vh - 290px)" }}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} assets`,
              className: "px-6 py-4 border-t border-slate-50 mt-auto !mb-0 flex-shrink-0 bg-white",
            }}
            onRow={(record) => ({
              onClick: () => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("sn", sn || "");
                params.set("an", record.display_name || record.name);
                // Also need schema_id for back navigation
                params.set("sid", asset_id as string);
                router.push(`/explore/data-assets/details/${record.id}?${params.toString()}`);
              },
              className: "cursor-pointer group hover:bg-blue-50/20 transition-all border-b border-slate-50 last:border-0",
            })}
          />
        </div>
      </div>
    </div>
  );
}
