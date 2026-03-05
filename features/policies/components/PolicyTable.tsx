"use client";

import React from "react";
import {
  Table,
  TableProps,
  Button,
  Popconfirm,
  Spin,
  Empty,
  Tooltip,
  Dropdown,
  MenuProps,
} from "antd";
import { Trash2, Edit2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Policy } from "../types";

interface PolicyTableProps {
  policies: Policy[];
  isLoading: boolean;
  onEdit: (policy: Policy) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function PolicyTable({
  policies,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
}: PolicyTableProps) {
  const columns: TableProps<Policy>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link
          href={`/settings/access-control/policies/${record.id}`}
          className="text-blue-600 font-medium hover:underline"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span className="text-slate-600 truncate max-w-md block">
          {text || "No description provided."}
        </span>
      ),
    },
    {
      title: "Roles",
      key: "roles",
      render: () => <span className="text-slate-400">--</span>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "edit",
            label: "Edit Policy",
            icon: <Edit2 size={14} />,
            onClick: () => onEdit(record),
          },
          {
            key: "delete",
            label: (
              <Popconfirm
                title="Delete Policy"
                description="Are you sure you want to delete this policy?"
                onConfirm={() => onDelete(record.id)}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <span className="text-red-600 block w-full text-left">
                  Delete Policy
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
              className="hover:bg-slate-100 rounded-lg h-8 w-8 flex items-center justify-center p-0"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <Table
        columns={columns}
        dataSource={policies}
        rowKey="id"
        loading={isLoading && { indicator: <Spin className="text-blue-600" /> }}
        pagination={{
          pageSize: 50,
          hideOnSinglePage: true,
          className: "px-6 py-4 border-t border-slate-100",
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No policies found."
            />
          ),
        }}
        className="custom-policy-table"
      />
      <style jsx global>{`
        .custom-policy-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          text-transform: none !important;
          padding: 12px 16px !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .custom-policy-table .ant-table-tbody > tr > td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 14px !important;
          color: #334155 !important;
        }
        .custom-policy-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
