import React from "react";
import { Table, Badge, Empty, Space, Tooltip, Avatar, Dropdown, Popconfirm, Button } from "antd";
import { Database, ChevronRight, User, MoreVertical, Trash2 } from "lucide-react";
import { ServiceEndpoint, GroupedServiceCategory } from "../types";
import { getIcon } from "@/shared/utils/icon-mapper";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

interface GroupedConnectionListProps {
  groups: GroupedServiceCategory[];
  loading: boolean;
  onRowClick: (endpoint: ServiceEndpoint) => void;
  onDelete?: (endpoint: ServiceEndpoint) => Promise<void>;
  emptyText?: string;
}

export const GroupedConnectionList: React.FC<GroupedConnectionListProps> = ({
  groups,
  loading,
  onRowClick,
  onDelete,
  emptyText = "No connections found.",
}) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  if (!loading && (!groups || !Array.isArray(groups) || groups.length === 0)) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Empty
          image={<Database className="mx-auto text-slate-200" size={48} />}
          description={emptyText}
        />
      </div>
    );
  }

  // Ensure groups is an array even after the check (for TypeScript or unexpected edge cases)
  const groupList = Array.isArray(groups) ? groups : [];

  return (
    <div className="space-y-8 pb-10">
      {groupList.map((item: any) => {
        const categoryName =
          item.category_name ||
          item.category ||
          item.group ||
          item.name ||
          "General";
        const iconSlug = item.category_slug || item.category || "database";
        const connections = Array.isArray(item.connections)
          ? item.connections
          : item.endpoints || [];

        if (connections.length === 0) return null;

        const columns: ColumnsType<ServiceEndpoint> = [
          {
            title: "Name",
            dataIndex: "service_name",
            key: "name",
            width: "30%",
            render: (text, record) => {
              const Icon = getIcon(
                iconSlug || record.extra?.integration_slug || "database",
              );
              return (
                <Space size="middle" className="group/name">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover/name:bg-blue-50 group-hover/name:border-blue-100 transition-colors">
                    <Icon
                      size={18}
                      className="text-slate-600 group-hover/name:text-blue-600"
                    />
                  </div>
                  <span className="font-bold text-blue-600 group-hover/name:text-blue-600 transition-all">
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
            width: "30%",
            render: (text) => (
              <Tooltip title={text}>
                <span className="text-slate-500 text-sm line-clamp-1 max-w-sm">
                  {text || "No description provided."}
                </span>
              </Tooltip>
            ),
          },
          {
            title: "Status",
            dataIndex: "is_active",
            key: "status",
            width: "10%",
            render: (isActive: boolean) => (
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  isActive
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/20"
                    : "bg-slate-50 text-slate-400 border-slate-100",
                )}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            title: "Owners",
            key: "owners",
            width: "25%",
            render: (_, record) => {
              const orgId = record.org_id || "default";
              // Deterministic mapping for Demo
              const isDefaultOrg =
                orgId === "e6b935cf-bee2-4420-8b84-dfe3c7197a6c";
              const ownerName = isDefaultOrg ? "Admin User" : "Org Owner";
              const initials = ownerName.charAt(0).toUpperCase();

              return (
                <div className="flex items-center">
                  <Tooltip
                    title={`Owner: ${ownerName} (Org: ${orgId.substring(
                      0,
                      8,
                    )}...)`}
                  >
                    <Avatar
                      size="small"
                      className={cn(
                        "border-2 border-white text-[10px] font-bold flex items-center justify-center shadow-sm hover:scale-110 transition-transform",
                        isDefaultOrg ? "bg-blue-600" : "bg-indigo-500",
                      )}
                    >
                      {initials}
                    </Avatar>
                  </Tooltip>
                </div>
              );
            },
          },
          {
            title: "Actions",
            key: "actions",
            width: "5%",
            render: (_, record) => (
              <div onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "delete",
                        label: (
                          <Popconfirm
                            title="Delete Connection"
                            description="Are you sure you want to delete this connection? This action cannot be undone."
                            onConfirm={async () => {
                              try {
                                setDeletingId(record.id);
                                if (onDelete) {
                                  await onDelete(record);
                                }
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true, size: "small" }}
                            cancelButtonProps={{ size: "small" }}
                            placement="leftTop"
                          >
                            <div className="flex items-center gap-2 text-red-600 font-medium py-1 px-1">
                              <Trash2 size={14} />
                              <span>Delete Connection</span>
                            </div>
                          </Popconfirm>
                        ),
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    loading={deletingId === record.id}
                    icon={
                      deletingId === record.id ? null : (
                        <MoreVertical
                          size={18}
                          className="text-slate-400 group-hover:text-slate-600 transition-colors"
                        />
                      )
                    }
                    className="flex items-center justify-center hover:bg-slate-100 rounded-lg h-9 w-9 p-0"
                  />
                </Dropdown>
              </div>
            ),
          },
        ];

        return (
          <div
            key={categoryName}
            className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <Table
                dataSource={connections}
                columns={columns}
                rowKey="id"
                pagination={false}
                loading={loading}
                onRow={(record) => ({
                  onClick: () => onRowClick(record),
                  className:
                    "cursor-pointer transition-colors hover:bg-slate-50/80",
                })}
                className="custom-grouped-table"
              />
            </div>
          </div>
        );
      })}

      <style jsx global>{`
        .custom-grouped-table .ant-table-thead > tr > th {
          background: #fcfdfe !important;
          color: #94a3b8 !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 12px 24px !important;
        }
        .custom-grouped-table .ant-table-tbody > tr > td {
          padding: 14px 24px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .custom-grouped-table .ant-table-row:last-child > td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
};
