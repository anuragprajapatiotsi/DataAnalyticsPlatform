"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  Tabs,
  Input,
  Button,
  Switch,
  Space,
  Tooltip,
  Avatar,
  Spin,
  message,
  Card,
  Badge,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import {
  Database,
  Search,
  Settings2,
  Edit2,
  Table as TableIcon,
  PlaySquare,
  History,
  FileText,
  Info,
  ChevronRight,
  User,
  Tags,
  MoreVertical,
  Eye,
  Layers,
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
  const serviceLabel = isDatabaseService ? "Database Services" : 
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
        <Space size="middle" className="group/name">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover/name:bg-emerald-50 group-hover/name:border-emerald-100 transition-colors">
            <TableIcon
              size={18}
              className="text-slate-600 group-hover/name:text-emerald-600"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-blue-600 group-hover/name:text-blue-700 transition-all">
              {text}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              {record.object_type || "table"}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text) => (
        <span className="text-slate-500 text-sm italic line-clamp-1">
          {text || `standard ${schema} schema table`}
        </span>
      ),
    },
    {
      title: "Owners",
      dataIndex: "owners",
      key: "owners",
      width: "15%",
      render: (owners) => (
        <div className="flex items-center gap-2">
          {owners && owners.length > 0 ? (
            <Tooltip title={owners.join(", ")}>
              <Avatar
                size="small"
                className="bg-blue-600 text-[10px] font-bold"
              >
                {owners[0].charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          ) : (
            <span className="text-slate-400 text-xs font-semibold">
              No Owners
            </span>
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
        <div className="flex flex-wrap gap-1">
          {tags && tags.length > 0 ? (
            tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-500 font-bold uppercase tracking-wider"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-slate-300">--</span>
          )}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: "8%",
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
          <div className="flex items-center justify-end pr-3" onClick={(e) => e.stopPropagation()}>
            <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical size={16} />
              </button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  if (loading && !connection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-white">
        <Spin size="large" />
        <p className="text-slate-500 font-medium">Loading table details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-4 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <Database size={24} className="text-blue-600" />
              </div>
              <PageHeader
                title={schema}
                description={`Explore and manage tables within the ${schema} schema.`}
                breadcrumbItems={breadcrumbItems}
              />
            </div>

            {/* <div className="flex items-center gap-3">
              <Button
                icon={<Edit2 size={16} />}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-xs h-9 px-4 rounded-lg border border-slate-200"
              >
                Edit
              </Button>
              <Button
                type="text"
                icon={<Settings2 size={16} />}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-medium text-xs h-9 px-4 rounded-lg border border-slate-200"
              >
                Customize
              </Button>
            </div> */}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 mt-2">
            {[
              {
                id: "tables",
                label: "Tables",
                icon: TableIcon,
                count: objects.length,
              },
              {
                id: "procedures",
                label: "Stored Procedures",
                icon: PlaySquare,
              },
              {
                id: "activity",
                label: "Activity Feeds & Tasks",
                icon: History,
              },
              { id: "contract", label: "Contract", icon: FileText },
              { id: "custom", label: "Custom Properties", icon: Settings2 },
            ].map((tab, idx) => (
              <div
                key={tab.id}
                className={cn(
                  "pb-3 text-sm font-semibold capitalize transition-all relative cursor-pointer",
                  idx === 0
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <div className="flex items-center gap-2 px-1">
                  <tab.icon size={14} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[10px] rounded-md border border-slate-100 font-bold">
                      {tab.count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Tables Table Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Search & Actions Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <Input
                placeholder="Search for Table"
                prefix={<Search size={16} className="text-slate-400 mr-2" />}
                className="max-w-md h-10 rounded-xl border-slate-200 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Deleted
                  </span>
                  <Switch size="small" className="bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Table */}
            <Table
              dataSource={filteredObjects}
              columns={columns}
              rowKey="name"
              loading={loading}
              pagination={false}
              onRow={(record) => ({
                onClick: () =>
                  router.push(
                    `/explore/${serviceType}/${id}/${database}/${schema}/${record.name}`,
                  ),
                className:
                  "cursor-pointer transition-colors hover:bg-slate-50/80",
              })}
              className="custom-explore-table"
              locale={{
                emptyText: loading ? (
                  <Spin />
                ) : (
                  "No tables available in this schema."
                ),
              }}
            />
          </div>
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
          padding: 14px 24px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .custom-explore-table .ant-table-row:last-child > td {
          border-bottom: none !important;
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
