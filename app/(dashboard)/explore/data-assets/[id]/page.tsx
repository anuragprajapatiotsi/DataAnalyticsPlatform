"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Table, Spin, message, Tooltip, Empty, Button } from "antd";
import {
  Database,
  Folder,
  Activity,
  ArrowRight,
  Server,
  Layers,
  RefreshCw,
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { ServiceEndpoint, CatalogResponse } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

interface CatalogTreeNode {
  key: string;
  id: string;
  name: string;
  type: "database" | "schema";
  children_count: number;
  databaseName?: string;
  children?: CatalogTreeNode[];
}

export default function DataAssetCatalogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [connData, catalogData] = await Promise.all([
        serviceService.getServiceEndpoint(id),
        serviceService.getCatalog(id),
      ]);
      setConnection(connData);
      setCatalog(catalogData);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
      message.error("Failed to load hierarchical catalog view.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const treeData = useMemo(() => {
    if (!catalog) return [];
    return catalog.databases.map((db) => ({
      key: `db-${db.name}`,
      id: db.id,
      name: db.name,
      type: "database" as const,
      children_count: db.children_count,
      children: db.schemas.map((schema) => ({
        key: `schema-${db.name}-${schema.name}`,
        id: schema.id,
        name: schema.name,
        type: "schema" as const,
        children_count: schema.children_count,
        databaseName: db.name,
      })),
    }));
  }, [catalog]);

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets", href: "/explore/data-assets" },
    { label: connection?.service_name || "Catalog" },
  ];

  const columns: ColumnsType<CatalogTreeNode> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "45%",
      render: (text, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-200",
            record.type === "database" 
              ? "bg-blue-50 border-blue-100 text-blue-600" 
              : "bg-slate-50 border-slate-100 text-slate-500 group-hover/name:bg-blue-50 group-hover/name:text-blue-600 group-hover/name:border-blue-200"
          )}>
            {record.type === "database" ? <Database size={14} /> : <Folder size={14} />}
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-semibold transition-colors",
              record.type === "database" ? "text-slate-900" : "text-slate-700 group-hover/name:text-blue-600"
            )}>
              {text}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {record.type}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Assets Count",
      dataIndex: "children_count",
      key: "children_count",
      width: "25%",
      render: (count) => (
        <div className="flex items-center gap-1.5">
          <Layers size={12} className="text-slate-400" />
          <span className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
            {count} <span className="text-slate-400 font-sans tracking-wide uppercase text-[9px] ml-0.5">Objects</span>
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: "20%",
      render: () => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
          Active
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record) => (
        record.type === "schema" && (
          <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
        )
      ),
    },
  ];

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#FAFAFA]">
        <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={32} />} />
        <p className="text-slate-500 font-medium text-[13px]">Initializing Catalog Discovery...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Section */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title={connection?.service_name || "Catalog Discovery"}
              description="Explore the hierarchical structure of your connection, from databases to schemas."
              breadcrumbItems={breadcrumbItems}
            />
            <div className="flex items-center gap-3">
              <Tooltip title="Re-sync Catalog">
                <Button
                  onClick={fetchData}
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
          
          {/* Hierarchy Overview Toolbar */}
          <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <Server size={16} className="text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Hierarchy Overview
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-medium pr-2">
              <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                <Database size={14} />
                <span>{catalog?.databases.length || 0} Databases</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Folder size={14} className="text-slate-400" />
                <span>{catalog?.databases.reduce((acc, db) => acc + db.schemas.length, 0) || 0} Schemas</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <Table<CatalogTreeNode>
              dataSource={treeData}
              columns={columns}
              rowKey="key"
              loading={{
                spinning: loading,
                indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
              }}
              pagination={false}
              expandable={{
                defaultExpandAllRows: true,
                expandRowByClick: true,
                // Optional: Customize expand icon if Antd's default clashes
                // expandIcon: ({ expanded, onExpand, record }) => ...
              }}
              onRow={(record) => ({
                onClick: (e) => {
                  if (record.type === "schema") {
                    e.stopPropagation();
                    // Find parent database name for context
                    let dbName = "Catalog";
                    if (record.key.startsWith("schema-")) {
                      const parts = record.key.split("-");
                      if (parts.length >= 2) dbName = parts[1];
                    }
                    router.push(`/explore/data-assets/schema/${record.id}?eid=${id}&en=${connection?.service_name || "Catalog"}&db=${dbName}&sn=${record.name}`);
                  }
                },
                className: cn(
                  "cursor-pointer group transition-colors duration-200",
                  record.type === "database" ? "bg-slate-50/30 hover:bg-slate-50/80" : "hover:bg-blue-50/30"
                ),
              })}
              scroll={{ y: "calc(100vh - 280px)" }}
              className="custom-explore-table flex-1 flex flex-col h-full"
              locale={{
                emptyText: (
                  <Empty
                    image={<div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><Server className="text-slate-300" size={28} /></div>}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700 font-medium text-sm">No Catalog Data Found</span>
                        <span className="text-slate-400 text-[13px]">This connection does not have any mapped databases or schemas.</span>
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
          /* Using Tailwind group-hover on the row instead of global CSS here to respect DB vs Schema row differences */
        }
        .custom-explore-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        
        /* Tree Expand Icon overrides */
        .ant-table-row-indent + .ant-table-row-expand-icon {
          margin-right: 12px !important;
          color: #94a3b8 !important;
          border-color: #cbd5e1 !important;
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