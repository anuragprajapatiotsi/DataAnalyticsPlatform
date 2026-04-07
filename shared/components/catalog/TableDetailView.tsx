"use client";

import React, { useState, useEffect } from "react";
import { Table, Input, Tooltip, Spin, message, Empty, Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { 
  Database, 
  Search, 
  Table as TableIcon, 
  Info, 
  Key, 
  Columns, 
  Plus, 
  History, 
  FileText, 
  Settings2,
  MoreVertical,
  Layers,
  ArrowRight
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { serviceService } from "@/features/services/services/service.service";
import { 
  ServiceEndpoint, 
  DBTableDetail, 
  ColumnInfo 
} from "@/features/services/types";
import { ColumnDetailDrawer } from "./ColumnDetailDrawer";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

interface TableDetailViewProps {
  id: string;
  database: string;
  schema: string;
  table: string;
  breadcrumbItems: { label: string; href?: string }[];
  onTitleClick?: () => void;
  onCreateCatalogView?: () => void;
}

export function TableDetailView({
  id,
  database,
  schema,
  table,
  breadcrumbItems,
  onCreateCatalogView,
}: TableDetailViewProps) {
  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [tableDetail, setTableDetail] = useState<DBTableDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("columns");
  const [selectedColumn, setSelectedColumn] = useState<ColumnInfo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [connData, detailData] = await Promise.all([
          serviceService.getServiceEndpoint(id),
          serviceService.getTableDetail(id, database, schema, table).catch(() => null),
        ]);
        setConnection(connData);
        setTableDetail(detailData);
      } catch (err) {
        console.error("Failed to fetch table details:", err);
        message.error("Failed to load columns.");
      } finally {
        setLoading(false);
      }
    }
    if (id && database && schema && table) fetchData();
  }, [id, database, schema, table]);

  const filteredColumns = tableDetail?.columns?.filter((col) =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || [];

  const columns: ColumnsType<ColumnInfo> = [
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          {record.ordinal_position === 1 ? (
            <Tooltip title="Primary Key">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-50 border border-amber-100 text-amber-600">
                <Key size={14} />
              </div>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-50 border border-slate-100 text-slate-400">
              <Columns size={14} />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{text}</span>
            {!record.is_nullable && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Not Null
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "data_type",
      width: "15%",
      render: (text) => (
        <div className="inline-flex items-center px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono">
          {text}
        </div>
      ),
    },
    {
      title: "Constraint",
      key: "constraint",
      width: "15%",
      render: (_, record) => (
        record.ordinal_position === 1 ? (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold tracking-wide uppercase">
            Primary Key
          </div>
        ) : (
          <span className="text-slate-300 text-[13px]">—</span>
        )
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (text) => (
        <span className="text-slate-500 text-[13px] line-clamp-2">
          {text || "No description provided."}
        </span>
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

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#FAFAFA]">
        <Spin size="large" />
        <p className="text-slate-500 font-medium text-[13px]">Loading table details...</p>
      </div>
    );
  }

  const dropdownItems: MenuProps["items"] = [
    {
      key: "create_view",
      label: "Create Catalog View",
      icon: <Layers size={14} className="text-blue-500" />,
      onClick: onCreateCatalogView,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100">
                <TableIcon size={20} className="text-emerald-600" />
              </div>
              <PageHeader
                title={table}
                description={`Standard ${schema} schema table definitions.`}
                breadcrumbItems={breadcrumbItems}
              />
            </div>
            {onCreateCatalogView && (
              <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
                <Button 
                  type="text" 
                  icon={<MoreVertical size={16} />} 
                  className="flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 w-8 h-8 rounded-md p-0"
                />
              </Dropdown>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 mt-2">
            {[
              { id: "columns", label: "Columns", icon: Info, count: tableDetail?.columns?.length },
              { id: "activity", label: "Activity Feeds", icon: History },
              { id: "contract", label: "Contract", icon: FileText },
              { id: "custom", label: "Settings", icon: Settings2 },
            ].map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-[13px] font-semibold transition-all relative cursor-pointer flex items-center gap-2",
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300",
                )}
              >
                <tab.icon size={14} className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    activeTab === tab.id ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {tab.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4 h-full">
          {activeTab === "columns" ? (
            <>
              {/* Unified Toolbar */}
              <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex-1 flex items-center gap-2 px-2">
                  <Search size={16} className="text-slate-400" />
                  <Input
                    placeholder="Search columns by name..."
                    variant="borderless"
                    className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                <Table
                  dataSource={filteredColumns}
                  columns={columns}
                  rowKey="name"
                  loading={loading}
                  pagination={false}
                  scroll={{ y: "calc(100vh - 350px)" }}
                  onRow={(record) => ({
                    onClick: () => {
                      setSelectedColumn(record);
                      setIsDrawerOpen(true);
                    },
                    className: "cursor-pointer group",
                  })}
                  className="custom-discovery-table flex-1 flex flex-col h-full"
                  locale={{
                    emptyText: loading ? (
                      <Spin className="my-8" />
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                        <Columns size={32} className="text-slate-300 mb-3" />
                        <span className="text-[14px] font-medium text-slate-700">No columns found</span>
                        <span className="text-[13px]">Try adjusting your search query.</span>
                      </div>
                    ),
                  }}
                />
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 italic text-[13px] bg-white rounded-xl border border-slate-200 border-dashed">
              This tab's content is managed within the data quality context.
            </div>
          )}
        </div>
      </div>

      {/* Column Detail Drawer */}
      <ColumnDetailDrawer 
        column={selectedColumn}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setTimeout(() => setSelectedColumn(null), 300);
        }}
      />

      <style jsx global>{`
        .custom-discovery-table .ant-table {
          background: transparent !important;
        }
        .custom-discovery-table .ant-table-thead > tr > th {
          background: #FAFAFA !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          border-bottom: 1px solid #E2E8F0 !important;
          padding: 12px 24px !important;
        }
        .custom-discovery-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-discovery-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
        .custom-discovery-table .ant-table-body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-discovery-table .ant-table-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-discovery-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .custom-discovery-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
}
