"use client";

import { useMemo, useState } from "react";
import { Table, Input, Tooltip, Button, Spin, Empty, Alert } from "antd";
import {
  Search,
  Database,
  Table as TableIcon,
  Eye,
  RefreshCw,
  ArrowRight,
  Folder,
  Shield,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { serviceService } from "@/features/services/services/service.service";
import { ExplorerObjectAsset, ExplorerSchemaAsset } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

type PageLevel = "database" | "schema";

export default function SchemaAssetsPage() {
  const router = useRouter();
  const { asset_id } = useParams();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  const level = (searchParams.get("level") as PageLevel | null) || "database";
  const eid = searchParams.get("eid");
  const en = searchParams.get("en");
  const db = searchParams.get("db");
  const sn = searchParams.get("sn");
  const dbid = searchParams.get("dbid");

  const buildDatabaseHref = () => {
    if (!eid || !dbid) {
      return undefined;
    }

    const params = new URLSearchParams();
    params.set("level", "database");
    params.set("eid", eid);
    if (en) params.set("en", en);
    if (db) params.set("db", db);
    return `/explore/data-assets/schema/${dbid}?${params.toString()}`;
  };

  const {
    data: rows = [],
    isLoading: loading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [level === "database" ? "schemas" : "objects", asset_id],
    queryFn: () =>
      level === "database"
        ? serviceService.getExplorerSchemas(asset_id as string)
        : serviceService.getExplorerObjects(asset_id as string),
    enabled: !!asset_id,
    staleTime: 5 * 60 * 1000,
  });

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const label = (item.display_name || item.name || "").toLowerCase();
      const description = String(item.description || "").toLowerCase();
      return label.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
    });
  }, [rows, searchTerm]);

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets", href: "/explore/data-assets" },
    ...(eid && en ? [{ label: en, href: `/explore/data-assets/${eid}` }] : []),
    ...(db ? [{ label: db, href: buildDatabaseHref() }] : []),
    ...(level === "schema" && sn ? [{ label: sn }] : []),
  ];

  const schemaColumns: ColumnsType<ExplorerSchemaAsset> = [
    {
      title: "Name",
      key: "name",
      width: "34%",
      render: (_, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className="flex items-center justify-center w-8 h-8 rounded-md border bg-slate-50 border-slate-200 text-slate-600">
            <Folder size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
              {record.display_name || record.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Schema
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "32%",
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
      width: "4%",
      align: "right",
      render: () => (
        <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
      ),
    },
  ];

  const objectColumns: ColumnsType<ExplorerObjectAsset> = [
    {
      title: "Name",
      key: "name",
      width: "36%",
      render: (_, record) => {
        const type = String(record.object_type || record.asset_type || "").toLowerCase();
        const isView = type === "view";
        return (
          <div className="flex items-center gap-3 group/name">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md border",
              isView ? "bg-purple-50 border-purple-100 text-purple-600" : "bg-blue-50 border-blue-100 text-blue-600"
            )}>
              {isView ? <Eye size={14} /> : <TableIcon size={14} />}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
                {record.display_name || record.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {type || "object"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Type",
      key: "type",
      width: "14%",
      render: (_, record) => (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 uppercase">
          {record.object_type || record.asset_type || "Object"}
        </span>
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

  const title = level === "database" ? (db || "Schemas") : (sn || "Objects");
  const description =
    level === "database"
      ? "Review schemas discovered within this database."
      : "Review tables and views discovered within this schema.";

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title={title}
              description={description}
              breadcrumbItems={breadcrumbItems}
            />
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end pr-5 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">
                  {level === "database" ? "Schema Count" : "Object Count"}
                </span>
                <span className="text-xl font-bold text-slate-900 leading-none">
                  {filteredRows.length}
                </span>
              </div>
              <Tooltip title="Refresh Inventory">
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

      <div className="min-h-0 flex-1 overflow-hidden p-6">
        <div className="mx-auto flex h-full max-w-[1400px] flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex-1 flex items-center gap-2 px-2">
              <Search size={16} className="text-slate-400" />
              <Input
                placeholder={`Search ${level === "database" ? "schemas" : "objects"} by name or description...`}
                variant="borderless"
                className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isError ? (
              <div className="p-6">
                <Alert
                  title={`Failed to load ${level === "database" ? "schemas" : "objects"}`}
                  description="We couldn't load the explorer data for this level."
                  type="error"
                  showIcon
                  action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
                />
              </div>
            ) : (
              <Table
                dataSource={filteredRows}
                columns={level === "database" ? schemaColumns : objectColumns}
                rowKey="id"
                scroll={{ x: "max-content" }}
                loading={{
                  spinning: loading,
                  indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
                }}
                pagination={{
                  defaultPageSize: 50,
                  showSizeChanger: true,
                  pageSizeOptions: ["20", "50", "100"],
                  className: "px-6 py-4 border-t border-slate-100 mt-auto !mb-0 shrink-0 bg-white",
                }}
                className="custom-explore-table"
                onRow={(record) => ({
                  onClick: () => {
                    if (level === "database") {
                      const params = new URLSearchParams();
                      if (eid) params.set("eid", eid);
                      if (en) params.set("en", en);
                      if (db) params.set("db", db);
                      if (asset_id) params.set("dbid", asset_id as string);
                      params.set("level", "schema");
                      params.set("sid", record.id);
                      params.set("sn", record.display_name || record.name);
                      router.push(`/explore/data-assets/schema/${record.id}?${params.toString()}`);
                      return;
                    }

                    const params = new URLSearchParams();
                    if (eid) params.set("eid", eid);
                    if (en) params.set("en", en);
                    if (db) params.set("db", db);
                    if (sn) params.set("sn", sn);
                    if (dbid) params.set("dbid", dbid);
                    if (asset_id) params.set("sid", asset_id as string);
                    params.set("an", record.display_name || record.name);
                    router.push(`/explore/data-assets/details/${record.id}?${params.toString()}`);
                  },
                  className: "cursor-pointer group",
                })}
                locale={{
                  emptyText: (
                    <Empty
                      image={<div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><Database className="text-slate-300" size={28} /></div>}
                      description={
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-700 font-medium text-sm">
                            No {level === "database" ? "Schemas" : "Objects"} Found
                          </span>
                          <span className="text-slate-400 text-[13px]">Try adjusting your search query.</span>
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
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
      `}</style>
    </div>
  );
}
