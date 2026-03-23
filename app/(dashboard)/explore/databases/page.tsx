"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Avatar, Button, Spin, Empty, Alert, Tooltip, Space } from "antd";
import { Database, Settings2, Shield, User } from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ServiceEndpoint } from "@/features/services/types";
import { cn } from "@/shared/utils/cn";
import { getIcon } from "@/shared/utils/icon-mapper";
import type { ColumnsType } from "antd/es/table";

export default function ExploreDatabasesPage() {
  console.log("Rendering ExploreDatabasesPage - New Industrial UI");
  const router = useRouter();
  const [databases, setDatabases] = useState<ServiceEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: "Databases" },
  ];

  useEffect(() => {
    async function fetchDatabases() {
      try {
        setLoading(true);
        const response = await serviceService.getServices({ type: "database", limit: 100, skip: 0 });
        setDatabases(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch databases:", err);
        setError("Failed to load database connections.");
      } finally {
        setLoading(false);
      }
    }

    fetchDatabases();
  }, []);

  const columns: ColumnsType<ServiceEndpoint> = [
    {
      title: "Name",
      dataIndex: "service_name",
      key: "name",
      width: "30%",
      render: (text, record) => {
        const iconName = record.extra?.integration_slug || "database";
        const Icon = getIcon(iconName);
        return (
          <Space size="middle" className="group/name">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover/name:bg-blue-50 group-hover/name:border-blue-100 transition-colors">
              <Icon size={18} className="text-slate-600 group-hover/name:text-blue-600" />
            </div>
            <span className="font-bold text-slate-900 group-hover/name:text-blue-600 group-hover/name:underline underline-offset-4 decoration-2 transition-all cursor-pointer">
              {text}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "40%",
      render: (text) => (
        <Tooltip title={text}>
          <span className="text-slate-500 text-sm line-clamp-1 max-w-md">
            {text || "No description provided."}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Type",
      dataIndex: "extra",
      key: "type",
      width: "15%",
      render: (extra) => (
        <span className="text-slate-600 text-sm capitalize">
          {(extra?.integration_slug || "Database").replace("-", " ")}
        </span>
      ),
    },
    {
      title: "Owners",
      key: "owners",
      width: "15%",
      render: () => (
        <div className="flex -space-x-2 overflow-hidden">
          <Tooltip title="Admin User">
            <Avatar 
              size="small" 
              className="border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold"
            >
              A
            </Avatar>
          </Tooltip>
          <Tooltip title="Data Engineering">
            <Avatar 
              size="small" 
              className="border-2 border-white bg-indigo-500 flex items-center justify-center text-[10px] font-bold"
            >
              DE
            </Avatar>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-4 pt-2 pb-2 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Database Sources"
            description="Explore and manage your connected database instances."
            breadcrumbItems={breadcrumbItems}
          />
          <Button 
            type="text" 
            icon={<Settings2 size={16} />} 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-medium text-xs h-9 px-4 rounded-lg border border-slate-200"
          >
            Customize
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7cl mx-auto space-y-4">
          {error && <Alert message="Error" description={error} type="error" showIcon closable />}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <Table
              dataSource={databases}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={false}
              onRow={(record) => ({
                onClick: () => router.push(`/explore/databases/${record.id}`),
                className: "cursor-pointer transition-colors hover:bg-slate-50/80"
              })}
              className="custom-explore-table"
              locale={{
                emptyText: (
                  <Empty
                    image={<Database className="mx-auto text-slate-200" size={48} />}
                    description="No database connections found. Add one in Settings > Services."
                  />
                )
              }}
            />
          </div>
          
          <p className="text-[11px] text-slate-400 font-medium px-2">
            Showing {databases.length} database connections
          </p>
        </div>
      </div>

      <style jsx global>{`
        .custom-explore-table .ant-table-thead > tr > th {
          background: #fcfdfe !important;
          color: #94a3b8 !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 12px 24px !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .custom-explore-table .ant-table-row:last-child > td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}
