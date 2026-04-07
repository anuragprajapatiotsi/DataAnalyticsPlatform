"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  Input,
  Switch,
  Tooltip,
  Avatar,
  Spin,
  message,
  Dropdown,
  Button
} from "antd";
import type { MenuProps } from "antd";
import {
  Database,
  Search,
  Settings2,
  Table as TableIcon,
  PlaySquare,
  History,
  FileText,
  MoreVertical,
  Eye,
  Layers,
  ArrowRight
} from "lucide-react";
import { CreateCatalogViewModal } from "@/features/explore/components/CreateCatalogViewModal";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { serviceService } from "@/features/services/services/service.service";
import { ServiceEndpoint, DBObjectInfo } from "@/features/services/types";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

export default function SchemaObjectsPage() {
  const params = useParams();
  const router = useRouter();
  const {
    service_type: serviceType,
    id,
    database,
    schema,
  } = params as {
    service_type: string;
    id: string;
    database: string;
    schema: string;
  };

  const [connection, setConnection] = useState<ServiceEndpoint | null>(null);
  const [objects, setObjects] = useState<DBObjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEndpointContext, setSelectedEndpointContext] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [connData, objectData] = await Promise.all([
          serviceService.getServiceEndpoint(id),
          serviceService.getDBObjects(id, database, schema).catch(() => []),
        ]);
        setConnection(connData);
        setObjects(objectData || []);
      } catch (err) {
        console.error("Failed to fetch objects:", err);
        message.error("Failed to load tables.");
      } finally {
        setLoading(false);
      }
    }
    if (id && database && schema) fetchData();
  }, [id, database, schema]);

  const isDatabaseService = serviceType === "database" || serviceType === "databases";
  const serviceLabel = isDatabaseService ? "Database" : 
    (serviceType.charAt(0).toUpperCase() + serviceType.slice(1));

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: serviceLabel, href: `/explore/${serviceType}` },
    { label: database, href: `/explore/${serviceType}/${id}/${database}` },
    { label: schema },
  ];

  const filteredObjects = objects.filter((obj) =>
    obj.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns: ColumnsType<DBObjectInfo> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-50/50 border border-emerald-100 text-emerald-600 group-hover/name:bg-emerald-600 group-hover/name:border-emerald-600 group-hover/name:text-white transition-all duration-200">
            <TableIcon size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover/name:text-emerald-600 transition-colors">
              {text}
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {record.object_type || "table"}
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
      render: (text) => (
        <span className="text-slate-500 text-[13px] line-clamp-2">
          {text || `Standard ${schema} schema table.`}
        </span>
      ),
    },
    {
      title: "Owners",
      dataIndex: "owners",
      key: "owners",
      width: "10%",
      render: (owners) => (
        <div className="flex items-center gap-1.5">
          {owners && owners.length > 0 ? (
            <Tooltip title={owners.join(", ")}>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold">
                {owners[0].charAt(0).toUpperCase()}
              </div>
            </Tooltip>
          ) : (
            <span className="text-slate-400 text-[13px]">—</span>
          )}
        </div>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "20%",
      render: (tags) => (
        <div className="flex flex-wrap gap-1.5">
          {tags && tags.length > 0 ? (
            tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-medium"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-[13px]">—</span>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record) => {
        const isEligible = !record.object_type || record.object_type.toLowerCase() === "table" || record.object_type.toLowerCase() === "view";

        const items: MenuProps["items"] = [
          {
            key: "view_details",
            label: "View Object Details",
            icon: <Eye size={14} className="text-slate-500" />,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              router.push(`/explore/${serviceType}/${id}/${database}/${schema}/${record.name}`);
            },
          },
        ];

        if (isEligible) {
          items.push({ type: "divider" });
          items.push({
            key: "create_view",
            label: "Create Catalog View",
            icon: <Layers size={14} className="text-blue-500" />,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              setSelectedEndpointContext({
                source_connection_id: id as string,
                source_schema: schema as string,
                source_table: record.name,
              });
              setIsModalOpen(true);
            },
          });
        }

        return (
          <div className="flex items-center justify-end gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
            <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
            <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
              <Button 
                type="text" 
                icon={<MoreVertical size={16} />} 
                className="flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 w-8 h-8 rounded-md p-0"
              />
            </Dropdown>
          </div>
        );
      },
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

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl border border-blue-100">
                <Database size={20} className="text-blue-600" />
              </div>
              <PageHeader
                title={schema}
                description={`Explore and manage tables within the ${schema} schema.`}
                breadcrumbItems={breadcrumbItems}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 mt-2">
            {[
              { id: "tables", label: "Tables", icon: TableIcon, count: objects.length },
              { id: "procedures", label: "Stored Procedures", icon: PlaySquare },
              { id: "activity", label: "Activity Feeds", icon: History },
              { id: "contract", label: "Contract", icon: FileText },
              { id: "custom", label: "Settings", icon: Settings2 },
            ].map((tab, idx) => (
              <div
                key={tab.id}
                className={cn(
                  "pb-3 text-[13px] font-semibold transition-all relative cursor-pointer flex items-center gap-2",
                  idx === 0
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300",
                )}
              >
                <tab.icon size={14} className={idx === 0 ? "text-blue-600" : "text-slate-400"} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    idx === 0 ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
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
          
          {/* Unified Toolbar */}
          <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex-1 flex items-center gap-2 px-2">
              <Search size={16} className="text-slate-400" />
              <Input
                placeholder="Search tables by name..."
                variant="borderless"
                className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 pr-2 border-l border-slate-100 pl-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Show Deleted
              </span>
              <Switch size="small" className="bg-slate-200 hover:bg-slate-300" />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <Table
              dataSource={filteredObjects}
              columns={columns}
              rowKey="name"
              loading={loading}
              pagination={false}
              scroll={{ y: "calc(100vh - 340px)" }}
              onRow={(record) => ({
                onClick: () => router.push(`/explore/${serviceType}/${id}/${database}/${schema}/${record.name}`),
                className: "cursor-pointer group",
              })}
              className="custom-explore-table flex-1 flex flex-col h-full"
              locale={{
                emptyText: loading ? (
                  <Spin className="my-8" />
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                    <TableIcon size={32} className="text-slate-300 mb-3" />
                    <span className="text-[14px] font-medium text-slate-700">No objects found</span>
                    <span className="text-[13px]">Try adjusting your search query.</span>
                  </div>
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
          display: none !important; /* Remove Antd default column separators */
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
        /* Custom scrollbar for the table */
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

      {selectedEndpointContext && (
        <CreateCatalogViewModal
          open={isModalOpen}
          initialEndpointContext={selectedEndpointContext}
          onCancel={() => {
            setIsModalOpen(false);
            setTimeout(() => setSelectedEndpointContext(null), 300);
          }}
          onSuccess={(viewId) => {
            if (viewId) router.push(`/explore/object-resources/${viewId}`);
          }}
        />
      )}
    </div>
  );
}