"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Input, message, Tooltip, Button, Spin, Empty } from "antd";
import {
  Search,
  Database,
  Cpu,
  HardDrive,
  Globe,
  Activity,
  Server,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { serviceService } from "@/features/services/services/service.service";
import { ServiceEndpoint } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

export default function ExploreDataAssetsPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets" },
  ];

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await serviceService.getServices({ skip: 0, limit: 100 });
      setServices(resp.data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      message.error("Failed to load service endpoints.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const getTypeInfo = (nodePath?: string) => {
    const defaultInfo = { label: "Service", icon: Server, route: "databases", color: "text-slate-600 bg-slate-50 border-slate-100" };
    if (!nodePath) return defaultInfo;

    const path = nodePath.toLowerCase();
    if (path.includes("postgres")) return { label: "PostgreSQL", icon: Database, route: "databases", color: "text-blue-600 bg-blue-50 border-blue-100" };
    if (path.includes("mysql")) return { label: "MySQL", icon: Database, route: "databases", color: "text-amber-600 bg-amber-50 border-amber-100" };
    if (path.includes("mongodb")) return { label: "MongoDB", icon: Database, route: "databases", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (path.includes("api")) return { label: "REST API", icon: Cpu, route: "apis", color: "text-indigo-600 bg-indigo-50 border-indigo-100" };
    if (path.includes("storage") || path.includes("s3")) return { label: "Storage", icon: HardDrive, route: "storages", color: "text-orange-600 bg-orange-50 border-orange-100" };
    if (path.includes("drive")) return { label: "Google Drive", icon: Globe, route: "drive", color: "text-blue-500 bg-blue-50 border-blue-100" };

    return defaultInfo;
  };

  const filteredServices = useMemo(() => {
    return services.filter(
      (s) =>
        s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const columns: ColumnsType<ServiceEndpoint> = [
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
      width: "30%",
      render: (name, record) => {
        const typeInfo = getTypeInfo(record.extra?.setting_node_path);
        const Icon = typeInfo.icon;
        
        return (
          <div className="flex items-center gap-3 group/name">
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-md border", typeInfo.color)}>
              <Icon size={14} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
                {name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                {record.id}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Type",
      key: "type",
      width: "15%",
      render: (_, record) => {
        const typeInfo = getTypeInfo(record.extra?.setting_node_path);
        return (
          <span className="inline-flex items-center px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium capitalize">
            {typeInfo.label}
          </span>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (desc) => (
        <span className="text-[13px] text-slate-500 line-clamp-2">
          {desc || <span className="italic opacity-70">No description provided</span>}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: "15%",
      render: (isActive) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border w-fit",
          isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" : "bg-slate-400")} />
          {isActive ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      width: "10%",
      align: "right",
      render: () => (
        <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Data Assets"
              description="Discover and manage your connections and data landscape across your organization."
              breadcrumbItems={breadcrumbItems}
            />

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end pr-5 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">
                  Total Connections
                </span>
                <span className="text-xl font-bold text-slate-900 leading-none">
                  {filteredServices.length}
                </span>
              </div>
              <Tooltip title="Sync & Refresh Assets">
                <Button
                  onClick={fetchServices}
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
                placeholder="Search connections by name, ID, or description..."
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
              dataSource={filteredServices}
              columns={columns}
              rowKey="id"
              loading={{
                spinning: loading,
                indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
              }}
              scroll={{ y: "calc(100vh - 280px)" }}
              pagination={{
                pageSize: 50,
                hideOnSinglePage: true,
                className: "px-6 py-4 border-t border-slate-100 mt-auto !mb-0 shrink-0 bg-white",
              }}
              className="custom-explore-table flex-1 flex flex-col h-full"
              onRow={(record) => ({
                onClick: () => router.push(`/explore/data-assets/${record.id}`),
                className: "cursor-pointer group",
              })}
              locale={{
                emptyText: (
                  <Empty
                    image={<div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><Server className="text-slate-300" size={28} /></div>}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700 font-medium text-sm">No Connections Found</span>
                        <span className="text-slate-400 text-[13px]">Try adjusting your search criteria or add a new connection.</span>
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
    </div>
  );
}