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
} from "antd";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { Policy } from "../types";

interface PolicyTableProps {
  policies: Policy[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function PolicyTable({
  policies,
  isLoading,
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
      render: (_, record) => (
        <Popconfirm
          title="Delete Policy"
          description="Are you sure you want to delete this policy?"
          onConfirm={() => onDelete(record.id)}
          okText="Yes"
          cancelText="No"
          okType="danger"
        >
          <Button
            type="text"
            icon={
              <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
            }
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
          color: #64748b !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.025em !important;
          padding: 16px 24px !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .custom-policy-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .custom-policy-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
