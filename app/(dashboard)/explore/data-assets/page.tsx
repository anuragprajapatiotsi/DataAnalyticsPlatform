"use client";

import { useMemo, useState } from "react";
import { Table, Input, Tooltip, Button, Spin, Empty, Alert } from "antd";
import {
  Search,
  Server,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { serviceService } from "@/features/services/services/service.service";
import { ExplorerServiceEndpoint } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";

export default function ExploreDataAssetsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const getConnectionId = (connection: ExplorerServiceEndpoint) =>
    connection.service_endpoint_id || connection.id;

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets" },
  ];

  const {
    data: services = [],
    isLoading: loading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["connections"],
    queryFn: serviceService.getExplorerConnections,
    staleTime: 5 * 60 * 1000,
  });

  const filteredServices = useMemo(() => {
    return services.filter(
      (s) =>
        s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getConnectionId(s).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const columns: ColumnsType<ExplorerServiceEndpoint> = [
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
      width: "30%",
      render: (name, record) => {
        return (
          <div className="flex items-center gap-3 group/name">
            <div className="flex items-center justify-center w-8 h-8 rounded-md border text-blue-600 bg-blue-50 border-blue-100">
              <Server size={14} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
                {name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                {getConnectionId(record)}
              </span>
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
        <span className="text-[13px] text-slate-500 line-clamp-2">
          {desc || <span className="italic opacity-70">No description provided</span>}
        </span>
      ),
    },
    {
      title: "Asset Count",
      dataIndex: "asset_count",
      key: "asset_count",
      width: "13%",
      render: (count) => (
        <span className="text-[13px] font-medium text-slate-700">{count ?? 0}</span>
      ),
    },
    {
      title: "Database Count",
      dataIndex: "database_count",
      key: "database_count",
      width: "13%",
      render: (count) => (
        <span className="text-[13px] font-medium text-slate-700">{count ?? 0}</span>
      ),
    },
    {
      title: "Schema Count",
      dataIndex: "schema_count",
      key: "schema_count",
      width: "14%",
      render: (count) => (
        <span className="text-[13px] font-medium text-slate-700">{count ?? 0}</span>
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
                  onClick={() => refetch()}
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
        <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-4">
          
          {/* Unified Toolbar */}
          <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {isError ? (
              <div className="p-6">
                <Alert
                  title="Failed to load connections"
                  description="We couldn't load the explorer connections right now."
                  type="error"
                  showIcon
                  action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
                />
              </div>
            ) : (
            <Table
              dataSource={filteredServices}
              columns={columns}
              rowKey={(record) => getConnectionId(record)}
              loading={{
                spinning: loading,
                indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
              }}
              pagination={{
                pageSize: 50,
                hideOnSinglePage: true,
                className: "px-6 py-4 border-t border-slate-100 !mb-0 bg-white",
              }}
              className="custom-explore-table"
              onRow={(record) => ({
                onClick: () => router.push(`/explore/data-assets/${getConnectionId(record)}`),
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
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Modern Table "Ghost" Styles with Sticky Header */
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
          /* Sticky Header Logic */
          position: sticky;
          top: 0;
          z-index: 10;
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
      `}</style>
    </div>
  );
}
