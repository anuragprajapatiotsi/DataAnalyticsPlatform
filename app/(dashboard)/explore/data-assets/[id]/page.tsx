"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Table, Spin, Tooltip, Empty, Button, Input, Alert } from "antd";
import { Database, ArrowRight, RefreshCw, Server, Search, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { serviceService } from "@/features/services/services/service.service";
import { ExplorerDatabaseAsset } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

export default function DataAssetCatalogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [searchTerm, setSearchTerm] = useState("");

  const getConnectionId = (connection: { id: string; service_endpoint_id?: string }) =>
    connection.service_endpoint_id || connection.id;

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: serviceService.getExplorerConnections,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: databases = [],
    isLoading: loading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["databases", id],
    queryFn: () => serviceService.getExplorerDatabases(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const connection = useMemo(
    () => connections.find((item) => getConnectionId(item) === id) ?? null,
    [connections, id],
  );

  const filteredDatabases = useMemo(() => {
    return databases.filter((database) => {
      const label = database.display_name || database.name || "";
      const description = database.description || "";
      return (
        label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [databases, searchTerm]);

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets", href: "/explore/data-assets" },
    { label: connection?.service_name || "Connection" },
  ];

  const columns: ColumnsType<ExplorerDatabaseAsset> = [
    {
      title: "Name",
      key: "name",
      width: "34%",
      render: (_, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className="flex items-center justify-center w-8 h-8 rounded-md border bg-blue-50 border-blue-100 text-blue-600">
            <Database size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
              {record.display_name || record.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Database
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (value) => (
        <span className="text-[13px] text-slate-500 line-clamp-2">
          {value || <span className="italic opacity-70">No description provided</span>}
        </span>
      ),
    },
    {
      title: "Sensitivity",
      dataIndex: "sensitivity",
      key: "sensitivity",
      width: "16%",
      render: (value) => (
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
          value ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500"
        )}>
          <Shield size={12} />
          {value || "Not set"}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: "14%",
      render: (value) => (
        <span className="text-[13px] text-slate-500">
          {value ? dayjs(value).format("MMM D, YYYY h:mm A") : "—"}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: "6%",
      align: "right",
      render: () => (
        <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title={connection?.service_name || "Connection Databases"}
              description="Explore databases discovered for this connection."
              breadcrumbItems={breadcrumbItems}
            />
            <div className="flex items-center gap-3">
              <Tooltip title="Refresh Databases">
                <Button
                  onClick={() => refetch()}
                  icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
                  className="h-9 w-9 p-0 flex items-center justify-center rounded-md border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <Server size={16} className="text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Database Inventory
              </span>
            </div>
            <div className="flex-1 max-w-md flex items-center gap-2 px-2">
              <Search size={16} className="text-slate-400" />
              <Input
                placeholder="Search databases by name or description..."
                variant="borderless"
                className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            {isError ? (
              <div className="p-6">
                <Alert
                  title="Failed to load databases"
                  description="We couldn't load the explorer databases for this connection."
                  type="error"
                  showIcon
                  action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
                />
              </div>
            ) : (
              <Table<ExplorerDatabaseAsset>
                dataSource={filteredDatabases}
                columns={columns}
                rowKey="id"
                loading={{
                  spinning: loading,
                  indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
                }}
                pagination={{
                  pageSize: 50,
                  hideOnSinglePage: true,
                  className: "px-6 py-4 border-t border-slate-100 !mb-0 bg-white",
                }}
                onRow={(record) => ({
                  onClick: () =>
                    router.push(
                      `/explore/data-assets/schema/${record.id}?level=database&eid=${id}&en=${encodeURIComponent(connection?.service_name || "Connection")}&db=${encodeURIComponent(record.display_name || record.name)}`,
                    ),
                  className: "cursor-pointer group transition-colors duration-200 hover:bg-slate-50/80",
                })}
                className="custom-explore-table flex-1 flex flex-col h-full"
                locale={{
                  emptyText: (
                    <Empty
                      image={<div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><Database className="text-slate-300" size={28} /></div>}
                      description={
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-700 font-medium text-sm">No Databases Found</span>
                          <span className="text-slate-400 text-[13px]">This connection does not have any discovered databases yet.</span>
                        </div>
                      }
                    />
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
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
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
      `}</style>
    </div>
  );
}
