"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Badge, Input, message, Tooltip } from "antd";
import {
  Search,
  Database,
  Cpu,
  HardDrive,
  Globe,
  Activity,
  Server,
  ChevronRight,
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
    if (!nodePath)
      return { label: "Unknown", icon: Server, route: "databases" };

    const path = nodePath.toLowerCase();
    if (path.includes("postgres"))
      return { label: "PostgreSQL", icon: Database, route: "databases" };
    if (path.includes("mysql"))
      return { label: "MySQL", icon: Database, route: "databases" };
    if (path.includes("mongodb"))
      return { label: "MongoDB", icon: Database, route: "databases" };
    if (path.includes("api"))
      return { label: "REST API", icon: Cpu, route: "apis" };
    if (path.includes("storage") || path.includes("s3"))
      return { label: "Storage", icon: HardDrive, route: "storages" };
    if (path.includes("drive"))
      return { label: "Google Drive", icon: Globe, route: "drive" };

    return { label: "Service", icon: Server, route: "databases" };
  };

  const filteredServices = useMemo(() => {
    return services.filter(
      (s) =>
        s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [services, searchTerm]);

  const columns: ColumnsType<ServiceEndpoint> = [
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
      width: "25%",
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            {(() => {
              const Icon = getTypeInfo(record.extra?.setting_node_path).icon;
              return <Icon size={18} />;
            })()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{name}</span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
              {record.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      key: "type",
      width: "15%",
      render: (_, record) => {
        const typeInfo = getTypeInfo(record.extra?.setting_node_path);
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
            {typeInfo.label}
          </span>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (desc) => (
        <span className="text-sm text-slate-500 line-clamp-1 italic">
          {desc || "No description provided"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: "15%",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "default"}
          text={
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-widest",
                isActive ? "text-emerald-600" : "text-slate-400",
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          }
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: "10%",
      render: () => (
        <ChevronRight
          size={16}
          className="text-slate-300 group-hover:text-blue-500 transition-colors"
        />
      ),
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
      {/* Top Header Section */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Data Assets"
              description="Discover and manage your connections and data landscape across your organization."
              breadcrumbItems={breadcrumbItems}
            />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end pr-4 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  Total Connections
                </span>
                <span className="text-xl font-bold text-slate-800">
                  {filteredServices.length}
                </span>
              </div>
              <Tooltip title="Sync & Refresh Assets">
                <button
                  onClick={fetchServices}
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

      {/* Main Table Interface */}
      <div className="flex-1 flex flex-col min-w-0 p-4 pt-2 overflow-hidden gap-6">
        {/* Search & Filter Controls */}
        {/* <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <Input
            placeholder="Search data assets..."
            prefix={<Search size={16} className="text-slate-400" />}
            className="h-10 rounded-lg border-slate-200 max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}

        {/* Discovery Table Container */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <Table
            dataSource={filteredServices}
            columns={columns}
            rowKey="id"
            loading={loading}
            className="custom-explore-table flex-1 flex flex-col h-full"
            scroll={{ y: "calc(100vh - 290px)" }}
            pagination={{
              pageSize: 20,
              hideOnSinglePage: true,
              className: "px-6 py-4 border-t border-slate-50 mt-auto !mb-0 flex-shrink-0 bg-white",
            }}
            onRow={(record) => ({
              onClick: () => {
                router.push(`/explore/data-assets/${record.id}`);
              },
              className:
                "cursor-pointer group hover:bg-blue-50/20 transition-all border-b border-slate-50 last:border-0",
            })}
          />
        </div>
      </div>
    </div>
  );
}
