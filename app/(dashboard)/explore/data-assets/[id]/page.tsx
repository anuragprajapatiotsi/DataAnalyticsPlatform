"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Table, Badge, Spin, message, Tooltip, Breadcrumb } from "antd";
import {
  Database,
  Folder,
  LayoutDashboard,
  Activity,
  ChevronRight,
  Server,
  Layers,
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { ServiceEndpoint, CatalogResponse, CatalogDatabase, CatalogSchema } from "@/features/services/types";
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
      width: "50%",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            record.type === "database" 
              ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100" 
              : "bg-slate-50 text-slate-500 group-hover:bg-slate-100"
          )}>
            {record.type === "database" ? <Database size={18} /> : <Folder size={18} />}
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-bold transition-colors",
              record.type === "database" ? "text-slate-800" : "text-slate-600 group-hover:text-blue-600"
            )}>
              {text}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
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
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-slate-400" />
          <span className="font-bold text-slate-700">{count}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Objects</span>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: "15%",
      render: () => (
        <Badge
          status="success"
          text={<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Syncing</span>}
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: "10%",
      render: (_, record) => (
        record.type === "schema" && (
          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        )
      ),
    },
  ];

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#f8fafc]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium animate-pulse">Initializing Catalog Discovery...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center justify-between">
            <PageHeader
              title={connection?.service_name || "Catalog Discovery"}
              description="Explore the hierarchical structure of your connection, from databases to schemas."
              breadcrumbItems={breadcrumbItems}
            />
            <div className="flex items-center gap-3">
              <Tooltip title="Re-sync Catalog">
                <button
                  onClick={fetchData}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer bg-white"
                >
                  <Activity size={20} className={loading ? "animate-spin" : ""} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Content */}
      <div className="flex-1 overflow-hidden p-2 pt-2 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Hierarchy Overview
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <div className="flex items-center gap-2 text-blue-600">
                <Database size={12} />
                <span>{catalog?.databases.length || 0} Databases</span>
              </div>
              <div className="w-[1px] h-3 bg-slate-200" />
              <div className="flex items-center gap-2 text-slate-500">
                <Folder size={12} />
                <span>{catalog?.databases.reduce((acc, db) => acc + db.schemas.length, 0) || 0} Schemas</span>
              </div>
            </div>
          </div>

          <Table<CatalogTreeNode>
            dataSource={treeData}
            columns={columns}
            rowKey="key"
            loading={loading}
            pagination={false}
            expandable={{
              defaultExpandAllRows: true,
              expandRowByClick: true,
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
                "cursor-pointer group transition-all duration-200",
                record.type === "database" ? "bg-slate-50/30" : "hover:bg-blue-50/20"
              ),
            })}
            scroll={{ y: "calc(100vh - 320px)" }}
            className="custom-explore-table h-full no-scrollbar"
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-explore-table .ant-table-thead > tr > th {
          background: #fcfdfe !important;
          color: #94a3b8 !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 14px 24px !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .custom-explore-table .ant-table-row:last-child > td {
          border-bottom: none !important;
        }
        .ant-table-row-indent + .ant-table-row-expand-icon {
          margin-right: 12px !important;
        }
      `}</style>
    </div>
  );
}
