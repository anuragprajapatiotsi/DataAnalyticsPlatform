"use client";

import React from "react";
import Link from "next/link";
import { Shield, Edit2, Trash2, MoreVertical, Mail, Users } from "lucide-react";
import {
  Table,
  Button,
  Popconfirm,
  Badge as AntBadge,
  Spin,
  Empty,
  Dropdown,
  MenuProps,
} from "antd";
import type { Team } from "../types";

interface TeamsTableProps {
  teams: Team[];
  isLoading: boolean;
  isAdmin: boolean;
  onEditClick: (team: Team) => void;
  onDeleteConfirm: (id: string) => void;
  total: number;
  current: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  orgId?: string;
}

export function TeamsTable({
  teams,
  isLoading,
  isAdmin,
  onEditClick,
  onDeleteConfirm,
  total,
  current,
  pageSize,
  onPageChange,
  orgId,
}: TeamsTableProps) {
  const columns = [
    {
      title: "Display Name",
      key: "display_name",
      width: 250,
      render: (team: Team) => (
        <div className="flex items-center gap-2.5">
          <Link
            href={`/settings/organization-team-user-management/teams/${team.id}${orgId ? `?org_id=${orgId}` : ""}`}
            className="font-semibold text-slate-900 text-[14px] truncate hover:text-blue-600 transition-colors"
          >
            {team.display_name}
          </Link>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (email: string) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Mail size={13} className="text-slate-400 flex-shrink-0" />
          <span className="text-[14px] font-medium truncate">{email}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "team_type",
      key: "team_type",
      width: 120,
      render: (type: string) => (
        <AntBadge
          className="capitalize"
          count={type}
          style={{
            backgroundColor: "#f8fafc",
            color: "#475569",
            borderColor: "#e2e8f0",
            fontSize: "10.5px",
            height: "18px",
            lineHeight: "18px",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: 100,
      render: (isActive: boolean) => (
        <AntBadge
          count={isActive ? "Active" : "Inactive"}
          style={{
            backgroundColor: isActive ? "#ecfdf5" : "#fff1f2",
            color: isActive ? "#059669" : "#e11d48",
            borderColor: isActive ? "#d1fae5" : "#ffe4e6",
            fontSize: "10.5px",
            height: "18px",
            lineHeight: "18px",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      width: 80,
      render: (team: Team) => {
        if (!isAdmin) return null;

        const menuItems: MenuProps["items"] = [
          {
            key: "edit",
            label: "Edit Team",
            icon: <Edit2 size={13} />,
            onClick: () => onEditClick(team),
          },
          {
            key: "delete",
            label: (
              <Popconfirm
                title="Delete Team"
                description="Are you sure you want to delete this team?"
                onConfirm={() => onDeleteConfirm(team.id)}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <span className="text-red-600 block w-full text-left text-[13px]">
                  Delete Team
                </span>
              </Popconfirm>
            ),
            icon: <Trash2 size={13} className="text-red-600" />,
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
              icon={<MoreVertical size={14} className="text-slate-400" />}
              className="hover:bg-slate-100 rounded-lg h-7 w-7 flex items-center justify-center p-0 ml-auto"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">
      <Table<Team>
        columns={columns}
        dataSource={teams}
        rowKey="id"
        loading={isLoading && { indicator: <Spin className="text-blue-600" /> }}
        scroll={{ y: "calc(100vh - 420px)" }}
        pagination={{
          current,
          pageSize,
          total,
          onChange: onPageChange,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          className:
            "px-4 py-2.5 border-t border-slate-100 m-0 bg-white sticky bottom-0 z-10",
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-slate-400 font-medium text-[13px]">
                  No teams found
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
          font-size: 12px !important;
          text-transform: none !important;
          padding: 8px 12px !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          padding: 8px 12px !important;
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
