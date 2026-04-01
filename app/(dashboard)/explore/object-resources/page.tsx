"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Badge, Input, message, Tooltip, Empty, Button } from "antd";
import {
  Search,
  Layers,
  Activity,
  ChevronRight,
  Database,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
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
    { label: "Object Resources" },
  ];

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
    fetchCatalogViews();
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 tracking-tight">
                {name || record.name}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Database size={10} className="text-slate-400" />
                <span
                  className={cn(
                    "text-[10px] font-mono",
                    hasSource ? "text-slate-500" : "text-slate-400 italic",
                  )}
                >
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
      width: "30%",
      render: (desc) => (
        <span className="text-xs text-slate-500 line-clamp-2">
          {desc || (
            <span className="italic opacity-70">No description provided</span>
          )}
        </span>
      ),
    },
    {
      title: "Sync Status",
      key: "sync_status",
      width: "15%",
      render: (_, record) => {
        const getStatusColor = (status?: string) => {
          if (status === "success")
            return {
              color: "green",
              text: "text-emerald-600",
              bg: "bg-emerald-50",
            };
          if (status === "failed")
            return { color: "red", text: "text-rose-600", bg: "bg-rose-50" };
          return {
            color: "default",
            text: "text-slate-500",
            bg: "bg-slate-50",
          };
        };
        const st = getStatusColor(record.sync_status);
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge
              status={st.color as any}
              text={
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    st.text,
                  )}
                >
                  {record.sync_status || "Never"}
                </span>
              }
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded ml-3">
              Mode: {record.sync_mode || "Manual"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Last Synced",
      key: "last_synced",
      width: "20%",
      render: (_, record) => {
        return (
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium">
              <Clock size={12} className="text-slate-400" />
              {record.last_synced_at ? (
                <span>{dayjs(record.last_synced_at).fromNow()}</span>
              ) : (
                <span className="italic text-slate-400">Not synced yet</span>
              )}
            </div>
            {record.cron_expr && (
              <div className="flex items-center gap-1 text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">
                <Calendar size={10} />
                <span>Schedule: {record.cron_expr}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "",
      key: "action",
      width: "12%",
      render: (_, record) => (
        <div className="flex items-center justify-end gap-3 pr-2" onClick={(e) => e.stopPropagation()}>
          {record.sync_mode === "on_demand" && (
            <Tooltip title="Trigger Manual Sync">
              <Button
                type="text"
                size="small"
                icon={<RefreshCw size={14} className={cn(syncingViews.has(record.id) && "animate-spin text-blue-500")} />}
                onClick={(e) => handleSync(e, record.id)}
                disabled={syncingViews.has(record.id)}
                className="flex items-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              >
                Sync
              </Button>
            </Tooltip>
          )}
          <ChevronRight
            size={16}
            className="text-slate-300 group-hover:text-indigo-500 transition-colors"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-[#f8fafc] animate-in fade-in duration-500">
      {/* Top Header Section */}
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Object Resources"
              description="Browse and manage aggregated catalog views mapped from connected data sources."
              breadcrumbItems={breadcrumbItems}
            />
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end pr-5 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
                  Active Views
                </span>
                <span className="text-2xl font-black text-slate-800 leading-none">
                  {filteredViews.length}
                </span>
              </div>
              <Button
                type="primary"
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold h-10 px-5 shadow-sm"
              >
                Create View
              </Button>
              <Tooltip title="Refresh Catalog Views">
                <Button
                  onClick={fetchCatalogViews}
                  icon={
                    <Activity
                      size={18}
                      className={loading ? "animate-spin" : ""}
                    />
                  }
                  size="large"
                  className="rounded-xl border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 bg-white"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col">
        {/* Discovery Table Container */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <Table
            dataSource={filteredViews}
            columns={columns}
            rowKey="id"
            loading={loading}
            className="custom-explore-table h-full flex flex-col no-scrollbar"
            scroll={{ y: "calc(100vh - 220px)" }}
            pagination={{
              pageSize: 50,
              hideOnSinglePage: true,
              className:
                "px-6 py-4 border-t border-slate-50 mt-auto !mb-0 shrink-0 bg-white",
            }}
            locale={{
              emptyText: (
                <Empty
                  image={
                    <Layers className="mx-auto text-slate-200" size={48} />
                  }
                  description={
                    <div className="flex flex-col gap-1 mt-4">
                      <span className="text-slate-600 font-bold text-sm">
                        No Catalog Views Found
                      </span>
                      <span className="text-slate-400 text-xs text-balance">
                        No synced object resources match your criteria or none
                        have been mapped yet.
                      </span>
                    </div>
                  }
                />
              ),
            }}
            onRow={(record) => ({
              onClick: () => {
                router.push(`/explore/object-resources/${record.id}`);
              },
              className:
                "cursor-pointer group hover:bg-indigo-50/30 transition-all border-b border-slate-50 last:border-0",
            })}
          />
        </div>
      </div>
      <style jsx global>{`
        .custom-explore-table .ant-table-wrapper {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .custom-explore-table .ant-spin-nested-loading,
        .custom-explore-table .ant-spin-container,
        .custom-explore-table .ant-table {
          height: 100%;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .custom-explore-table .ant-table-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden !important;
        }
        .custom-explore-table .ant-table-body {
          flex: 1;
          overflow-y: auto !important;
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
