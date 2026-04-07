"use client";

import React from "react";
import { Table, Spin, Empty, Tooltip, Button } from "antd";
import { Server, Network, ArrowRight, RefreshCw } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { ServiceEndpoint } from "@/features/services/types";
import { cn } from "@/shared/utils/cn";

interface ServiceListTableProps {
  services: ServiceEndpoint[];
  loading: boolean;
  onServiceClick: (record: ServiceEndpoint) => void;
  serviceType: string;
}

export function ServiceListTable({
  services,
  loading,
  onServiceClick,
  serviceType,
}: ServiceListTableProps) {
  const columns: ColumnsType<ServiceEndpoint> = [
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
      width: "25%",
      render: (text, record) => (
        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => onServiceClick(record)}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50/50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-200">
            <Server size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {text}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text) => (
        <span className="text-slate-500 text-[13px] line-clamp-2">
          {text || "No description provided."}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: "15%",
      render: (active) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
          active 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-slate-50 text-slate-600 border-slate-200"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            active ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" : "bg-slate-400"
          )} />
          {active ? "Connected" : "Disconnected"}
        </div>
      ),
    },
    {
      title: "Infrastructure",
      key: "infrastructure",
      width: "15%",
      render: (_, record) => {
        const host = record.extra?.host || "N/A";
        const port = record.extra?.port || "";
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono w-fit">
            <Network size={12} className="text-slate-400" />
            <span className="truncate max-w-[120px]">{host}</span>
            {port && <span className="text-slate-400">:{port}</span>}
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            className="flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            icon={<ArrowRight size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              onServiceClick(record);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      dataSource={services}
      columns={columns}
      rowKey="id"
      loading={{
        spinning: loading,
        indicator: <RefreshCw className="animate-spin text-blue-600" size={24} />
      }}
      scroll={{ y: "calc(100vh - 310px)" }}
      onRow={(record) => ({
        onClick: () => onServiceClick(record),
        className: "cursor-pointer"
      })}
      pagination={{ 
        pageSize: 50, 
        hideOnSinglePage: true,
        className: "px-6 py-4 border-t border-slate-100 mt-auto !mb-0 flex-shrink-0 bg-white" 
      }}
      className="custom-catalog-table flex-1 flex flex-col h-full"
      locale={{
        emptyText: (
          <Empty
            image={
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Server className="text-slate-300" size={28} />
              </div>
            }
            description={
              <div className="flex flex-col gap-1">
                <span className="text-slate-700 font-medium text-sm">No instances found</span>
                <span className="text-slate-400 text-[13px]">Try adjusting your search or filters.</span>
              </div>
            }
          />
        ),
      }}
    />
  );
}

const tableScrollStyles = `
  .custom-catalog-table .ant-table-body::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-catalog-table .ant-table-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-catalog-table .ant-table-body::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }
  .custom-catalog-table .ant-table-body::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = tableScrollStyles;
  document.head.appendChild(style);
}
