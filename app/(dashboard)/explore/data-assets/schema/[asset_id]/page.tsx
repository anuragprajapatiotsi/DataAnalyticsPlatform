"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Input, message, Tooltip, Progress, Dropdown, Button, Spin, Empty } from "antd";
import type { MenuProps } from "antd";
import {
  Search,
  Database,
  Table as TableIcon,
  Eye,
  Zap,
  Activity,
  Layers,
  MoreVertical,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogAsset } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { CreateCatalogViewModal } from "@/features/explore/components/CreateCatalogViewModal";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

export default function SchemaAssetsPage() {
  const router = useRouter();
  const { asset_id } = useParams();
  const [assets, setAssets] = useState<CatalogAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatalogAssetId, setSelectedCatalogAssetId] = useState<string | null>(null);

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

  const getTypeIconConfig = (type: string) => {
    switch (type) {
      case "table": return { icon: <TableIcon size={14} />, color: "text-blue-600 bg-blue-50 border-blue-100" };
      case "view": return { icon: <Eye size={14} />, color: "text-purple-600 bg-purple-50 border-purple-100" };
      case "function": return { icon: <Zap size={14} />, color: "text-amber-600 bg-amber-50 border-amber-100" };
      default: return { icon: <Database size={14} />, color: "text-slate-500 bg-slate-50 border-slate-200" };
    }
  };

  const columns: ColumnsType<CatalogAsset> = [
    {
      title: "Asset Name",
      key: "name",
      width: "30%",
      render: (_, record) => {
        const config = getTypeIconConfig(record.asset_type);
        return (
          <div className="flex items-center gap-3 group/name">
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-md border", config.color)}>
              {config.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
                {record.display_name || record.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                {record.asset_type}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Operational Metrics",
      key: "metrics",
      width: "25%",
      render: (_, record) => (
        <div className="flex flex-col gap-1.5 w-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Rows</span>
            <span className="text-[12px] text-slate-800 font-mono">{formatNumber(record.row_count)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Size</span>
            <span className="text-[12px] text-slate-800 font-mono">{formatBytes(record.size_bytes)}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Observability Score",
      dataIndex: "observability_score",
      key: "score",
      width: "20%",
      render: (score) => {
        const numScore = score || 0;
        const color = numScore > 80 ? "#10b981" : numScore > 50 ? "#f59e0b" : "#ef4444";
        const textColor = numScore > 80 ? "text-emerald-600" : numScore > 50 ? "text-amber-600" : "text-red-600";

        return (
          <div className="flex flex-col gap-1 max-w-[140px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">Health</span>
              <span className={cn("text-[11px] font-bold font-mono", textColor)}>
                {score ? `${numScore}%` : "N/A"}
              </span>
            </div>
            <Progress 
              percent={numScore} 
              size="small" 
              showInfo={false} 
              strokeColor={color}
              railColor="#f1f5f9"
            />
          </div>
        );
      },
    },
    {
      title: "Classifications",
      dataIndex: "classification_tags",
      key: "tags",
      width: "15%",
      render: (tags: Array<{ id: string; name: string; display_name: string; color?: string }>) => (
        <div className="flex flex-wrap gap-1.5">
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <span 
                key={tag.id} 
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border"
                style={{ 
                  backgroundColor: tag.color ? `${tag.color}10` : "#f8fafc", 
                  color: tag.color || "#64748b",
                  borderColor: tag.color ? `${tag.color}30` : "#e2e8f0"
                }}
              >
                {tag.display_name || tag.name}
              </span>
            ))
          ) : (
            <span className="text-[13px] text-slate-400">—</span>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record) => {
        const isEligible = record.asset_type === "table" || record.asset_type === "view";

        const items: MenuProps["items"] = [
          {
            key: "view_details",
            label: "View Asset Details",
            icon: <Eye size={14} className="text-slate-500" />,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              const params = new URLSearchParams(searchParams.toString());
              params.set("sn", sn || "");
              params.set("an", record.display_name || record.name);
              params.set("sid", asset_id as string);
              router.push(`/explore/data-assets/details/${record.id}?${params.toString()}`);
            },
          },
        ];

        if (isEligible) {
          items.push({ type: "divider" });
          items.push({
            key: "create_view",
              label: "Create Catalog View",
              icon: <Layers size={14} className="text-blue-500" />,
              onClick: (e) => {
                e.domEvent.stopPropagation();
                setSelectedCatalogAssetId(record.id);
                setIsModalOpen(true);
              },
            });
        }

        return (
          <div className="flex items-center justify-end gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
            <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
            <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
              <Button 
                type="text" 
                icon={<MoreVertical size={16} />} 
                className="flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 w-8 h-8 rounded-md p-0"
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title={sn || "Schema Inventory"}
              description="Deep-dive into tables, views, and functions within your schema. Monitor health and data volumes."
              breadcrumbItems={breadcrumbItems}
            />

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end pr-5 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">
                  Asset Count
                </span>
                <span className="text-xl font-bold text-slate-900 leading-none">
                  {filteredAssets.length}
                </span>
              </div>
              <Tooltip title="Refresh Inventory">
                <Button
                  onClick={fetchAssets}
                  icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
                  className="h-9 w-9 p-0 flex items-center justify-center rounded-md border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4 h-full">
          
          {/* Unified Toolbar */}
          <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex-1 flex items-center gap-2 px-2">
              <Search size={16} className="text-slate-400" />
              <Input
                placeholder="Search assets by name or type..."
                variant="borderless"
                className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-1.5 pr-2 border-l border-slate-100 pl-4 h-8">
              {["all", "table", "view", "function"].map((type) => (
                 <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all",
                    activeType === type 
                      ? "bg-slate-900 text-white" 
                      : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  )}
                >
                  {type === "all" ? "All Assets" : `${type}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <Table
              dataSource={filteredAssets}
              columns={columns}
              rowKey="id"
              loading={{
                spinning: loading,
                indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
              }}
              scroll={{ y: "calc(100vh - 290px)" }}
              pagination={{
                defaultPageSize: 50,
                showSizeChanger: true,
                pageSizeOptions: ["20", "50", "100"],
                className: "px-6 py-4 border-t border-slate-100 mt-auto !mb-0 shrink-0 bg-white",
              }}
              className="custom-explore-table flex-1 flex flex-col h-full"
              onRow={(record) => ({
                onClick: () => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("sn", sn || "");
                  params.set("an", record.display_name || record.name);
                  params.set("sid", asset_id as string);
                  router.push(`/explore/data-assets/details/${record.id}?${params.toString()}`);
                },
                className: "cursor-pointer group",
              })}
              locale={{
                emptyText: (
                  <Empty
                    image={<div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><Database className="text-slate-300" size={28} /></div>}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700 font-medium text-sm">No Assets Found</span>
                        <span className="text-slate-400 text-[13px]">Try adjusting your search query or filters.</span>
                      </div>
                    }
                  />
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

        {selectedCatalogAssetId && (
          <CreateCatalogViewModal
            open={isModalOpen}
            initialAssetId={selectedCatalogAssetId}
            onCancel={() => {
              setIsModalOpen(false);
              setTimeout(() => setSelectedCatalogAssetId(null), 300);
            }}
            onSuccess={(id) => {
              if (id) {
                router.push(`/explore/object-resources/${id}?created=1`);
              }
            }}
          />
        )}
    </div>
  );
}
