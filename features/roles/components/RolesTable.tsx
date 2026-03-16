"use client";

import React from "react";
import Link from "next/link";
import { Shield, Edit2, Trash2, MoreVertical } from "lucide-react";
import {
  Table,
  Button,
  Popconfirm,
  Badge as AntBadge,
  Spin,
  Empty,
  Dropdown,
  MenuProps,
  Popover,
} from "antd";
import { Role } from "../types";

interface RolesTableProps {
  roles: Role[];
  isLoading: boolean;
  onEditClick: (role: Role) => void;
  onDeleteConfirm: (id: string) => void;
  total: number;
  current: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function RolesTable({
  roles,
  isLoading,
  onEditClick,
  onDeleteConfirm,
  total,
  current,
  pageSize,
  onPageChange,
}: RolesTableProps) {
  const columns = [
    {
      title: "Name",
      key: "name",
      width: 280,
      render: (role: Role) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 flex-shrink-0">
            <Shield size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <Link
              href={`/settings/access-control/roles/${role.id}`}
              className="font-semibold text-slate-900 text-[14px] truncate hover:text-blue-600 transition-colors"
            >
              {role.name}
            </Link>
            {role.is_system_role && (
              <AntBadge
                className="w-fit"
                count="System Role"
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  borderColor: "#dbeafe",
                  fontSize: "9px",
                  height: "16px",
                  lineHeight: "16px",
                  textTransform: "uppercase",
                }}
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <p className="text-[14px] text-slate-600 m-0 line-clamp-2 leading-snug font-medium max-w-md">
          {text || "No description provided"}
        </p>
      ),
    },
    {
      title: "Policies",
      key: "policies",
      render: (role: Role) => (
        <div className="flex flex-wrap gap-1.5 max-w-xs items-center">
          {role.policies && role.policies.length > 0 ? (
            <>
              <div className="bg-slate-100/80 text-slate-600 text-[11px] font-bold py-0.5 px-2 rounded-md border border-slate-200/50">
                {role.policies[0].name}
              </div>
              
              {role.policies.length > 1 && (
                <Popover
                  content={
                    <div className="w-64 max-h-60 overflow-y-auto custom-scrollbar p-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Associated Policies ({role.policies.length})</p>
                      <div className="flex flex-col gap-1">
                        {role.policies.map((policy) => (
                          <div 
                            key={policy.id}
                            className="flex items-center gap-2 px-1 py-1.5 hover:bg-slate-50 rounded transition-colors group cursor-default"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] flex-shrink-0" />
                            <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                              {policy.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                  trigger="click"
                  placement="rightTop"
                  overlayClassName="policy-popover"
                >
                  <div className="bg-blue-50/50 text-blue-600 text-[11px] font-bold py-0.5 px-2 rounded-md border border-blue-100/50 cursor-pointer hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200 transition-all active:scale-95 select-none">
                    +{role.policies.length - 1} more
                  </div>
                </Popover>
              )}
            </>
          ) : (
            <span className="text-slate-400 text-[12px] italic">
              No policies attached
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      width: 80,
      render: (role: Role) => {
        if (role.is_system_role) return null;

        const menuItems: MenuProps["items"] = [
          {
            key: "edit",
            label: "Edit Role",
            icon: <Edit2 size={14} />,
            onClick: () => onEditClick(role),
          },
          {
            key: "delete",
            label: (
              <Popconfirm
                title="Delete Role"
                description="Are you sure you want to delete this role?"
                onConfirm={() => onDeleteConfirm(role.id)}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <span className="text-red-600 block w-full text-left">
                  Delete Role
                </span>
              </Popconfirm>
            ),
            icon: <Trash2 size={14} className="text-red-600" />,
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreVertical size={16} className="text-slate-400" />}
              className="hover:bg-slate-100 rounded-lg h-8 w-8 flex items-center justify-center p-0 ml-auto"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">
      <Table<Role>
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={isLoading && { indicator: <Spin className="text-blue-600" /> }}
        scroll={{ y: "calc(100vh - 400px)" }}
        pagination={{
          current,
          pageSize,
          total,
          onChange: onPageChange,
          showSizeChanger: false,
          className:
            "px-6 py-4 border-t border-slate-100 m-0 bg-white sticky bottom-0 z-10",
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-slate-400 font-medium">
                  No roles found
                </span>
              }
            />
          ),
        }}
        className="custom-table"
      />
      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          text-transform: none !important;
          padding: 12px 16px !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 14px !important;
          color: #334155 !important;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
