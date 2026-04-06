"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Table, Input, message, Tooltip, Empty, Button, Spin } from "antd";
import {
  Search,
  Layers,
  Activity,
  Database,
  Clock,
  Calendar,
  RefreshCw,
  ArrowRight,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogView } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { CreateCatalogViewModal } from "@/features/explore/components/CreateCatalogViewModal";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function ExploreObjectResourcesPage() {
  const router = useRouter();
  const [catalogViews, setCatalogViews] = useState<CatalogView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ skip: 0, limit: 100 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingViews, setSyncingViews] = useState<Set<string>>(new Set());

  const handleSync = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setSyncingViews((prev) => new Set(prev).add(id));
      const res = await serviceService.syncCatalogView(id, { sync_data: true, force: false });
      message.success(res.message || "Manual sync triggered successfully.");
      setTimeout(fetchCatalogViews, 1000);
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Failed to trigger sync.");
    } finally {
      setSyncingViews((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data", href: "/explore/object-resources" },
    { label: "Catalog Views" },
  ];

  const isInitialMount = useRef(true);
  const fetchCatalogViews = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await serviceService.getCatalogViews({
        skip: pagination.skip,
        limit: pagination.limit,
      });
      setCatalogViews(Array.isArray(resp) ? resp : []);
    } catch (err) {
      console.error("Failed to fetch catalog views:", err);
      message.error("Failed to load catalog views.");
    } finally {
      setLoading(false);
    }
  }, [pagination.skip, pagination.limit]);

  useEffect(() => {
    if (isInitialMount.current) {
      fetchCatalogViews();
      isInitialMount.current = false;
    }
  }, [fetchCatalogViews]);

  const filteredViews = useMemo(() => {
    return catalogViews.filter(
      (v) =>
        v.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [catalogViews, searchTerm]);

  const columns: ColumnsType<CatalogView> = [
    {
      title: "View Name",
      dataIndex: "display_name",
      key: "display_name",
      width: "30%",
      render: (name, record) => {
        const hasSource = record.source_schema && record.source_table;
        const sourcePath = hasSource
          ? `${record.source_schema}.${record.source_table}`
          : "No source linked";
        return (
          <div className="flex items-center gap-3 group/name">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover/name:bg-indigo-600 group-hover/name:border-indigo-600 group-hover/name:text-white transition-all duration-200">
              <Layers size={14} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 group-hover/name:text-indigo-600 transition-colors">
                {name || record.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Database size={10} className={hasSource ? "text-indigo-400" : "text-slate-400"} />
                <span className={cn("text-[11px] font-mono", hasSource ? "text-slate-500" : "text-slate-400 italic")}>
                  {sourcePath}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (desc) => (
        <span className="text-[13px] text-slate-500 line-clamp-2">
          {desc || <span className="italic opacity-70">No description provided</span>}
        </span>
      ),
    },
    {
      title: "Sync Status",
      key: "sync_status",
      width: "15%",
      render: (_, record) => {
        const status = record.sync_status?.toLowerCase();
        const isSuccess = status === "success";
        const isFailed = status === "failed";

        return (
          <div className="flex flex-col gap-1.5 items-start">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border capitalize",
              isSuccess ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              isFailed ? "bg-red-50 text-red-700 border-red-200" :
              "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isSuccess ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" :
                isFailed ? "bg-red-500" : "bg-slate-400"
              )} />
              {status || "Never"}
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded capitalize">
              Mode: {record.sync_mode || "manual"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Last Synced",
      key: "last_synced",
      width: "20%",
      render: (_, record) => (
        <div className="flex flex-col gap-1.5 items-start">
          <div className="flex items-center gap-1.5 text-slate-600 text-[12px] font-medium">
            <Clock size={12} className="text-slate-400" />
            {record.last_synced_at ? (
              <span>{dayjs(record.last_synced_at).fromNow()}</span>
            ) : (
              <span className="italic text-slate-400 text-[11px]">Not synced yet</span>
            )}
          </div>
          {record.cron_expr && (
            <div className="flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-mono">
              <Calendar size={10} />
              <span>{record.cron_expr}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record) => (
        <div className="flex items-center justify-end gap-3 pr-2" onClick={(e) => e.stopPropagation()}>
          {record.sync_mode === "on_demand" && (
            <Tooltip title="Trigger Manual Sync">
              <Button
                type="text"
                size="small"
                icon={<RefreshCw size={14} className={cn(syncingViews.has(record.id) && "animate-spin text-indigo-600")} />}
                onClick={(e) => handleSync(e, record.id)}
                disabled={syncingViews.has(record.id)}
                className="flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 w-8 h-8 rounded-md p-0"
              />
            </Tooltip>
          )}
          <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Catalog Views"
              description="Browse and manage aggregated catalog views mapped from connected data sources."
              breadcrumbItems={breadcrumbItems}
            />

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end pr-5 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">
                  Active Views
                </span>
                <span className="text-xl font-bold text-slate-900 leading-none">
                  {filteredViews.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip title="Refresh Catalog Views">
                  <Button
                    onClick={fetchCatalogViews}
                    icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
                    className="h-9 w-9 p-0 flex items-center justify-center rounded-md border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
                  />
                </Tooltip>
                <Button
                  type="primary"
                  onClick={() => setIsModalOpen(true)}
                  icon={<Plus size={16} />}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium h-9 px-4 shadow-sm border-none"
                >
                  Create View
                </Button>
              </div>
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
                placeholder="Search catalog views by name or description..."
                variant="borderless"
                className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <Table
              dataSource={filteredViews}
              columns={columns}
              rowKey="id"
              loading={{
                spinning: loading,
                indicator: <Spin indicator={<RefreshCw className="animate-spin text-indigo-600" size={24} />} />
              }}
              scroll={{ y: "calc(100vh - 280px)" }}
              pagination={{
                pageSize: 50,
                hideOnSinglePage: true,
                className: "px-6 py-4 border-t border-slate-100 mt-auto !mb-0 shrink-0 bg-white",
              }}
              className="custom-explore-table flex-1 flex flex-col h-full"
              onRow={(record) => ({
                onClick: () => router.push(`/explore/object-resources/${record.id}`),
                className: "cursor-pointer group",
              })}
              locale={{
                emptyText: (
                  <Empty
                    image={<div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><Layers className="text-slate-300" size={28} /></div>}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700 font-medium text-sm">No Catalog Views Found</span>
                        <span className="text-slate-400 text-[13px]">No synced Catalog Views match your search criteria.</span>
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
          display: none !important; /* Remove Antd default column separators */
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
        /* Custom scrollbar for the table */
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
        onSuccess={() => fetchCatalogViews()}
      />
    </div>
  );
}