"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { message, Alert, Skeleton, Table, Button, Tooltip } from "antd";
import {
  Layers,
  Database,
  Clock,
  Calendar,
  AlertTriangle,
  Settings,
  Activity,
  RefreshCw,
  Hash,
  ShieldAlert
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogView } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function ExploreObjectResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const viewId = params.id as string;

  const [viewDetail, setViewDetail] = useState<CatalogView | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!viewDetail?.id) return;
    try {
      setIsSyncing(true);
      const res = await serviceService.syncCatalogView(viewDetail.id, { sync_data: true, force: false });
      message.success(res.message || "Manual sync triggered successfully.");
      setTimeout(fetchDetail, 1000);
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Failed to trigger sync.");
    } finally {
      setIsSyncing(false);
    }
  };

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
    const s = status?.toLowerCase();
    if (s === "success") return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" };
    if (s === "failed") return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
    if (s === "never" || !s) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  };

  const statusConfig = getStatusConfig(viewDetail?.sync_status);

  if (loading) {
    return (
      <div className="p-8 space-y-8 h-full bg-[#FAFAFA] animate-in fade-in">
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
      <div className="flex h-full items-center justify-center bg-[#FAFAFA] animate-in fade-in">
        <Alert
          type="error"
          message={<span className="font-semibold">Resource Not Found</span>}
          description={<span className="text-[13px]">The requested catalog view could not be located or you lack permissions to view it.</span>}
          showIcon
          icon={<AlertTriangle className="mt-1" />}
          className="max-w-md border-red-200 bg-red-50 rounded-xl"
        />
      </div>
    );
  }

  const configData = viewDetail.sync_config ? Object.entries(viewDetail.sync_config).map(([key, value]) => ({ key, value })) : [];

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                <Layers size={20} />
              </div>
              <div className="flex flex-col w-full">
                <PageHeader
                  title={viewDetail.display_name || viewDetail.name}
                  description={viewDetail.description || "No description provided for this resource."}
                  breadcrumbItems={breadcrumbItems}
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded uppercase font-medium tracking-wider">
                    ID: {viewDetail.id}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-medium">
                    {viewDetail.name}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {viewDetail.sync_mode === "on_demand" && (
                <Tooltip title="Trigger Manual Sync">
                  <Button
                    icon={<RefreshCw size={14} className={cn(isSyncing && "animate-spin")} />}
                    onClick={handleSync}
                    loading={isSyncing}
                    className="flex items-center h-9 px-4 rounded-md border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 font-medium transition-all shadow-sm"
                  >
                    Sync Now
                  </Button>
                </Tooltip>
              )}
              
              <div className="flex flex-col items-end border-l border-slate-200 pl-4 ml-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-widest mb-1">Status</span>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border capitalize",
                  statusConfig.bg, statusConfig.text, statusConfig.border
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                  {viewDetail.sync_status || "Never"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          
          {viewDetail.sync_error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <ShieldAlert size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <h4 className="text-[13px] font-semibold text-red-800">Synchronization Error Detected</h4>
                <span className="text-[12px] font-mono text-red-600/80 mt-1 whitespace-pre-wrap">{viewDetail.sync_error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Column 1: Overview & Source Information */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
                <Database size={14} className="text-slate-400" /> General Overview
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col border-b border-slate-100 pb-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Source Schema</span>
                  {viewDetail.source_schema ? (
                    <span className="text-[12px] font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded w-fit">
                      {viewDetail.source_schema}
                    </span>
                  ) : <span className="text-[13px] text-slate-400">—</span>}
                </div>

                <div className="flex flex-col border-b border-slate-100 pb-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Source Table</span>
                  {viewDetail.source_table ? (
                    <span className="text-[12px] font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded w-fit">
                      {viewDetail.source_table}
                    </span>
                  ) : <span className="text-[13px] text-slate-400">—</span>}
                </div>

                <div className="flex flex-col border-b border-slate-100 pb-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Object Type</span>
                  {viewDetail.source_object_type ? (
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded uppercase tracking-widest w-fit">
                      {viewDetail.source_object_type}
                    </span>
                  ) : <span className="text-[13px] text-slate-400">—</span>}
                </div>

                <div className="flex flex-col border-b border-slate-100 pb-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Connection ID</span>
                  {viewDetail.source_connection_id ? (
                    <span className="text-[12px] font-mono text-slate-500">
                      {viewDetail.source_connection_id}
                    </span>
                  ) : <span className="text-[13px] text-slate-400 italic">Not Configured</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created At</span>
                  <span className="text-[12px] font-medium text-slate-700">
                    {viewDetail.created_at ? dayjs(viewDetail.created_at).format("MMM D, YYYY h:mm A") : "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Updated At</span>
                  <span className="text-[12px] font-medium text-slate-700">
                    {viewDetail.updated_at ? dayjs(viewDetail.updated_at).format("MMM D, YYYY h:mm A") : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Sync & Configuration Details */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
                <Activity size={14} className="text-slate-400" /> Sync & Configuration
              </h3>
              
              <div className="flex flex-col gap-6">
                {/* Sync Metadata Highlights */}
                <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex-1 flex flex-col gap-1.5 min-w-[100px]">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5"><Settings size={12}/> Mode</span>
                    <span className="text-[13px] font-medium text-slate-900 capitalize">{viewDetail.sync_mode || "Manual"}</span>
                  </div>
                  <div className="w-px bg-slate-200 hidden sm:block" />
                  <div className="flex-1 flex flex-col gap-1.5 min-w-[120px]">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5"><Clock size={12}/> Last Synced</span>
                    <span className="text-[13px] font-medium text-slate-900">
                      {viewDetail.last_synced_at ? dayjs(viewDetail.last_synced_at).fromNow() : <span className="italic text-slate-400 text-[12px]">Not synced yet</span>}
                    </span>
                  </div>
                  {viewDetail.cron_expr && (
                    <>
                      <div className="w-px bg-slate-200 hidden sm:block" />
                      <div className="flex-1 flex flex-col gap-1.5 min-w-[100px]">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5"><Calendar size={12} /> Schedule</span>
                        <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px] w-fit">
                          {viewDetail.cron_expr}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Dynamic Sync Configuration Table */}
                <div className="flex flex-col gap-3 mt-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 m-0">
                    <Hash size={14} className="text-slate-400" /> Technical Configuration
                  </h4>
                  
                  {configData.length > 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <Table 
                        dataSource={configData}
                        pagination={false}
                        showHeader={false}
                        size="small"
                        columns={[
                          { 
                            dataIndex: "key", 
                            width: "40%",
                            render: (text) => <span className="text-[12px] font-medium text-slate-500">{text}</span> 
                          },
                          { 
                            dataIndex: "value", 
                            render: (val) => (
                              <span className="text-[12px] text-slate-900 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {val === null || val === undefined ? <span className="text-slate-400 italic">null</span> : String(val)}
                              </span>
                            ) 
                          }
                        ]}
                        className="custom-explore-table"
                      />
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                      <Settings size={20} className="text-slate-300 mb-2" />
                      <span className="text-[13px] font-medium text-slate-600">No configuration mapped</span>
                      <span className="text-[12px] text-slate-400 mt-0.5">This view has no technical parameters.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Modern Table "Ghost" Styles for Config Table */
        .custom-explore-table .ant-table {
          background: transparent !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
        .custom-explore-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}