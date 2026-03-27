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
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { serviceService } from "@/features/services/services/service.service";
import { DataAssetDetail, DataAssetColumn, DataAssetProfile, ColumnProfile } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

export default function DataAssetDetailPage() {
  const { asset_id } = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<DataAssetDetail | null>(null);
  const [latestProfile, setLatestProfile] = useState<DataAssetProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!asset_id) return;
    try {
      setLoading(true);
      const [assetData, profileData] = await Promise.allSettled([
        serviceService.getAssetDetail(asset_id as string),
        serviceService.getLatestAssetProfile(asset_id as string),
      ]);
      
      if (assetData.status === "fulfilled") setAsset(assetData.value);
      if (profileData.status === "fulfilled") setLatestProfile(profileData.value);
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
    ...(sid && sn ? [{ label: sn, href: `/explore/data-assets/schema/${sid}?eid=${eid}&en=${en}&db=${db}&sn=${sn}` }] : []),
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
      case "PII": return "rose";
      case "Restricted": return "amber";
      case "Internal": return "blue";
      case "Public": return "emerald";
      default: return "slate";
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "Platinum": return "indigo";
      case "Gold": return "amber";
      case "Silver": return "slate";
      case "Bronze": return "orange";
      default: return "slate";
    }
  };

  const columnColumns: ColumnsType<DataAssetColumn> = [
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (name, record) => (
        <div className="flex items-center gap-2">
          {record.is_primary_key && <Key size={14} className="text-amber-500" />}
          <span className="font-mono text-sm font-bold text-slate-800">{name}</span>
          {record.is_nullable && <span className="text-[10px] text-slate-400 italic">null</span>}
        </div>
      ),
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "type",
      width: "15%",
      render: (type) => (
        <Tag className="m-0 bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold uppercase tracking-wider">
          {type}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (desc) => (
        <span className="text-xs text-slate-500 italic line-clamp-2">
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
              className="m-0 px-2 py-0 border italic rounded-full text-[9px] font-bold uppercase"
              style={{ color: tag.color, borderColor: tag.color ? `${tag.color}30` : undefined, backgroundColor: tag.color ? `${tag.color}10` : undefined }}
            >
              {tag.display_name || tag.name}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  const columnProfileColumns: ColumnsType<{ name: string } & ColumnProfile> = [
    {
      title: "Column",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (name) => <span className="font-mono text-sm font-bold text-slate-800">{name}</span>,
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
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider italic">
              <span className={safePct > 20 ? "text-rose-500" : "text-slate-400"}>Nulls</span>
              <span className={safePct > 20 ? "text-rose-600" : "text-slate-600"}>{safePct.toFixed(1)}%</span>
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
          <span className="text-sm font-bold text-slate-800">{new Intl.NumberFormat().format(count || 0)}</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase italic">{(record.distinct_percentage ?? 0).toFixed(1)}% unique</span>
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
            <span className="text-[9px] text-slate-400 font-bold uppercase">Min</span>
            <span className="text-[11px] font-mono text-slate-700 truncate">{record.min?.toString() || "N/A"}</span>
          </div>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase">Max</span>
            <span className="text-[11px] font-mono text-slate-700 truncate">{record.max?.toString() || "N/A"}</span>
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
            <span className="text-[10px] text-slate-400 font-bold uppercase w-10">Avg:</span>
            <span className="text-xs font-bold text-slate-700">{record.avg !== undefined && record.avg !== null ? record.avg.toFixed(2) : "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase w-10">Med:</span>
            <span className="text-xs font-bold text-slate-700">{record.median !== undefined && record.median !== null ? record.median.toFixed(2) : "N/A"}</span>
          </div>
        </div>
      ),
    },
  ];

  if (loading && !asset) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#f8fafc]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium animate-pulse italic">Retrieving Asset Metadata Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <PageHeader
              title={asset?.display_name || asset?.name || "Asset Details"}
              description={asset?.description || "Comprehensive metadata profile and schema definition."}
              breadcrumbItems={breadcrumbItems}
            />
            <div className="flex items-center gap-3">
               <div className="flex flex-col items-end pr-4 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 italic">Asset Type</span>
                <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">{asset?.asset_type}</span>
              </div>
              <Tooltip title="Refresh Metadata">
                <button
                  onClick={fetchData}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer bg-white"
                >
                  <Activity size={20} className={loading ? "animate-spin" : ""} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 pt-6 flex flex-col gap-6">
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
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 italic">Technical FQN</h4>
                          <p className="text-sm font-mono text-slate-700 break-all font-bold">{asset?.fully_qualified_name}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="rounded-2xl border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                          <Activity size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 italic">Data Volume</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider italic">Rows</span>
                            <span className="text-sm font-bold text-slate-800">{new Intl.NumberFormat().format(asset?.row_count || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider italic">Size</span>
                            <span className="text-sm font-bold text-slate-800">{formatBytes(asset?.size_bytes)}</span>
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
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 italic">Temporal Audit</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider italic">Created</span>
                            <span className="text-xs font-bold text-slate-700">{asset?.created_at || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider italic">Updated</span>
                            <span className="text-xs font-bold text-slate-700">{asset?.updated_at || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Governance Section */}
                  <div className="grid grid-cols-2 gap-6">
                     <Card title={<div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 italic"><Shield size={14} /> Governance Labels</div>} className="rounded-2xl border-slate-200 shadow-sm">
                        <Flex vertical className="w-full" gap="middle">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">Data Sensitivity</span>
                            <Tag color={getSensitivityColor(asset?.sensitivity)} className="m-0 uppercase font-black tracking-tighter text-[10px] border-none px-3 rounded-full">
                              {asset?.sensitivity || "Not Defined"}
                            </Tag>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">Infrastructure Tier</span>
                            <Tag color={getTierColor(asset?.tier)} className="m-0 uppercase font-black tracking-tighter text-[10px] border-none px-3 rounded-full">
                              {asset?.tier || "Not Defined"}
                            </Tag>
                          </div>
                          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">Classification Tags</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {asset?.classification_tags?.map(tag => (
                                <Tag 
                                  key={tag.id} 
                                  className="m-0 px-2.5 py-0.5 border italic rounded-full text-[10px] font-bold uppercase"
                                  style={{ color: tag.color, borderColor: tag.color ? `${tag.color}30` : undefined, backgroundColor: tag.color ? `${tag.color}10` : undefined }}
                                >
                                  {tag.display_name || tag.name}
                                </Tag>
                              )) || <span className="text-[10px] text-slate-300 italic">No classifications</span>}
                            </div>
                          </div>
                        </Flex>
                     </Card>

                     <Card title={<div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 italic"><User size={14} /> Custodians & Experts</div>} className="rounded-2xl border-slate-200 shadow-sm">
                        <div className="space-y-6">
                          <div>
                            <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 italic">Data Owners</h5>
                            <div className="flex flex-wrap gap-3">
                              {asset?.owners?.map(owner => (
                                <div key={owner.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 min-w-[140px]">
                                  <Avatar size="small" icon={<User size={12} />} className="bg-blue-100 text-blue-600" />
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-700">{owner.name}</span>
                                    <span className="text-[9px] text-slate-400 font-medium truncate max-w-[100px]">{owner.email}</span>
                                  </div>
                                </div>
                              )) || <span className="text-[10px] text-slate-300 italic">No owners assigned</span>}
                            </div>
                          </div>
                          <Divider className="m-0" />
                          <div>
                            <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 italic">Subject Matter Experts</h5>
                            <div className="flex flex-wrap gap-3">
                              {asset?.experts?.map(expert => (
                                <div key={expert.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 min-w-[140px]">
                                  <Avatar size="small" icon={<Zap size={12} />} className="bg-amber-100 text-amber-600" />
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-700">{expert.name}</span>
                                    <span className="text-[9px] text-slate-400 font-medium truncate max-w-[100px]">{expert.email}</span>
                                  </div>
                                </div>
                              )) || <span className="text-[10px] text-slate-300 italic">No experts assigned</span>}
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
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                              <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-0.5 italic">Latest Profiling Audit</h4>
                              <p className="text-sm font-bold text-slate-800">
                                Scaled on <span className="text-blue-600">{new Intl.NumberFormat().format(latestProfile.row_count || 0)}</span> rows 
                                <span className="mx-2 text-slate-300">|</span> 
                                <span className="text-slate-500 font-medium italic text-xs">Run completed at {latestProfile.completed_at}</span>
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
                          dataSource={Object.entries(latestProfile.column_profiles).map(([name, profile]) => ({
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
                      <h3 className="text-lg font-bold text-slate-400 italic mb-1 uppercase tracking-tighter">No Profiling Data Available</h3>
                      <p className="text-slate-400 text-xs font-medium max-w-xs text-center leading-relaxed italic">
                        The automated profiling agent hasn't analyzed this asset yet. 
                        Trigger a bot run to generate statistical distributions and quality metrics.
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
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Table
                    dataSource={asset?.columns || []}
                    columns={columnColumns}
                    rowKey="name"
                    pagination={false}
                    className="custom-column-table"
                    scroll={{ y: "calc(100vh - 400px)" }}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

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
    </div>
  );
}
