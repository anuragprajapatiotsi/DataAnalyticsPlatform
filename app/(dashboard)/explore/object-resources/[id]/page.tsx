"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { message, Alert, Badge, Card, Descriptions, Tag, Skeleton, Divider, Table } from "antd";
import {
  Layers,
  Database,
  Clock,
  Calendar,
  AlertTriangle,
  Server,
  Settings,
  Hash,
  Activity
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogView } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function ExploreObjectResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const viewId = params.id as string;

  const [viewDetail, setViewDetail] = useState<CatalogView | null>(null);
  const [loading, setLoading] = useState(true);

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data", href: "/explore/object-resources" },
    { label: "Object Resources", href: "/explore/object-resources" },
    { label: viewDetail?.display_name || "Loading..." },
  ];

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await serviceService.getCatalogViewById(viewId);
      setViewDetail(resp);
    } catch (err) {
      console.error("Failed to fetch catalog view detail:", err);
      message.error("Failed to load catalog view details.");
    } finally {
      setLoading(false);
    }
  }, [viewId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "success":
        return { color: "success", text: "Success", bg: "bg-emerald-50", border: "border-emerald-200" };
      case "failed":
        return { color: "error", text: "Failed", bg: "bg-rose-50", border: "border-rose-200" };
      case "never":
        return { color: "warning", text: "Never", bg: "bg-amber-50", border: "border-amber-200" };
      default:
        return { color: "default", text: status || "Unknown", bg: "bg-slate-50", border: "border-slate-200" };
    }
  };

  const statusConfig = getStatusConfig(viewDetail?.sync_status);

  if (loading) {
    return (
      <div className="p-8 space-y-8 h-full bg-[#f8fafc] animate-in fade-in">
        <Skeleton active paragraph={{ rows: 2 }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton.Node active style={{ width: "100%", height: 300 }} />
          <Skeleton.Node active style={{ width: "100%", height: 300 }} />
        </div>
      </div>
    );
  }

  if (!viewDetail) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f8fafc] animate-in fade-in">
        <Alert
          type="error"
          message="Resource Not Found"
          description="The requested catalog view could not be located or you lack permissions to view it."
          showIcon
          icon={<AlertTriangle className="mt-1" />}
          className="max-w-md border-rose-200 bg-rose-50"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto bg-[#f8fafc]  animate-in fade-in duration-500">
      {/* Header Card Section */}
      <div className="bg-white shadow-sm px-8 py-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 mt-1 shrink-0">
                <Layers size={24} />
              </div>
              <div className="flex flex-col w-full">
                <PageHeader
                  title={viewDetail.display_name || viewDetail.name}
                  description={viewDetail.description || "No description provided for this resource."}
                  breadcrumbItems={breadcrumbItems}
                />
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                    ID: {viewDetail.id}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold tracking-widest">
                    {viewDetail.name}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={cn("px-3 py-2 rounded-xl border flex flex-col items-center shrink-0 w-32", statusConfig.bg, statusConfig.border)}>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Status</span>
              <Badge status={statusConfig.color as any} text={<span className="font-bold text-sm tracking-tight">{statusConfig.text}</span>} />
            </div>
          </div>
      </div>

      {/* Content Card Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 mx-2 flex-1 flex flex-col overflow-y-auto">
          {viewDetail.sync_error && (
            <Alert
              message="Synchronization Error Detected"
              description={<span className="font-mono text-xs">{viewDetail.sync_error}</span>}
              type="error"
              showIcon
              className="mb-8 rounded-xl border-rose-200 shadow-sm"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Column 1: Overview & Source Information */}
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Database size={16} className="text-slate-400" /> General Overview
              </h3>
              
              <div className="space-y-6">
                <Descriptions column={1} styles={{ label: { width: "140px", color: "#64748b", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }, content: { fontWeight: 500, color: "#1e293b", fontSize: "14px" } }}>
                  <Descriptions.Item label="Source Schema">
                    {viewDetail.source_schema ? (
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{viewDetail.source_schema}</span>
                    ) : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Source Table">
                    {viewDetail.source_table ? (
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{viewDetail.source_table}</span>
                    ) : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Object Type">
                    {viewDetail.source_object_type ? (
                      <Tag color="cyan" className="m-0 font-bold uppercase text-[10px] tracking-widest border-cyan-200">{viewDetail.source_object_type}</Tag>
                    ) : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Connection ID">
                    {viewDetail.source_connection_id ? (
                      <span className="font-mono text-xs text-slate-500">{viewDetail.source_connection_id}</span>
                    ) : "Not Configured"}
                  </Descriptions.Item>
                </Descriptions>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Descriptions column={2} size="small" styles={{ label: { color: "#94a3b8", fontSize: "12px" }, content: { fontSize: "12px", color: "#475569", fontWeight: 500 } }}>
                    <Descriptions.Item label="Created At">
                      {viewDetail.created_at ? dayjs(viewDetail.created_at).format("MMM D, YYYY h:mm A") : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated At">
                      {viewDetail.updated_at ? dayjs(viewDetail.updated_at).format("MMM D, YYYY h:mm A") : "—"}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>
            </div>

            {/* Column 2: Sync & Configuration Details */}
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Activity size={16} className="text-slate-400" /> Sync & Configuration
              </h3>
              
              <div className="space-y-6">
                {/* Sync Metadata Highlights */}
                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5"><Settings size={12}/> Mode</span>
                    <span className="font-medium text-slate-700 capitalize">{viewDetail.sync_mode || "Manual"}</span>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5"><Clock size={12}/> Last Synced</span>
                    <span className="font-medium text-slate-700 text-sm">
                      {viewDetail.last_synced_at ? dayjs(viewDetail.last_synced_at).fromNow() : <span className="italic text-slate-400">Not synced yet</span>}
                    </span>
                  </div>
                  {viewDetail.cron_expr && (
                    <>
                      <div className="w-px bg-slate-200" />
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5"><Calendar size={12} /> Schedule</span>
                        <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-xs w-fit">
                          {viewDetail.cron_expr}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Dynamic Sync Configuration */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Hash size={14} /> Technical Configuration
                  </h4>
                  
                  {viewDetail.sync_config && Object.keys(viewDetail.sync_config).length > 0 ? (
                    <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                      <Table 
                        dataSource={Object.entries(viewDetail.sync_config).map(([key, value]) => ({ key, value }))}
                        pagination={false}
                        showHeader={false}
                        size="small"
                        columns={[
                          { 
                            dataIndex: "key", 
                            width: "40%",
                            render: (text) => <span className="text-xs font-semibold text-slate-600 font-mono">{text}</span> 
                          },
                          { 
                            dataIndex: "value", 
                            render: (val) => (
                              <span className="text-xs text-slate-800 font-mono">
                                {val === null || val === undefined ? <span className="text-slate-400 italic">null</span> : String(val)}
                              </span>
                            ) 
                          }
                        ]}
                        className="config-table"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-400 italic">
                      No configuration properties mapped.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      <style jsx global>{`
        .config-table .ant-table-row > td {
          border-bottom: 1px solid #f1f5f9 !important;
          background: transparent !important;
        }
        .config-table .ant-table-row:last-child > td {
          border-bottom: none !important;
        }
        .config-table .ant-table-tbody > tr.ant-table-row:hover > td {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
