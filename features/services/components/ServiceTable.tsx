"use client";

import React from "react";
import { Table, Tag, Button, Space, Tooltip } from "antd";
import { Settings, Play, Trash2, Edit } from "lucide-react";
import { Service, ServiceEndpoint } from "../types";
import { getIcon } from "@/shared/utils/icon-mapper";

interface ServiceTableProps {
  services: (Service | ServiceEndpoint)[];
  isLoading: boolean;
  onEdit: (service: any) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}

export function ServiceTable({
  services,
  isLoading,
  onEdit,
  onDelete,
  onTest,
}: ServiceTableProps) {
  const columns = [
    {
      title: "Service",
      key: "name",
      render: (_: any, record: any) => {
        const displayLabel = record.display_label || record.extra?.display_name || record.service_name || record.name;
        const iconName = record.icon || record.extra?.icon || "server";
        const IconComponent = getIcon(iconName);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500">
              <IconComponent size={16} />
            </div>
            <div>
              <div className="font-bold text-slate-900">{displayLabel}</div>
              <div className="text-xs text-slate-500 truncate max-w-[200px]">
                {record.service_name || record.name}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Type",
      key: "type",
      render: (_: any, record: any) => (
        <Tag color="blue">
          {record.integration_label || record.service_name?.toUpperCase() || record.type}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Disabled"}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span className="text-xs text-slate-500">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Test Connection">
            <Button
              type="text"
              icon={<Play size={16} className="text-emerald-500" />}
              onClick={() => onTest(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<Edit size={16} className="text-blue-500" />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              onClick={() => onDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={services}
      loading={isLoading}
      rowKey="id"
      className="custom-table"
      pagination={false}
    />
  );
}
