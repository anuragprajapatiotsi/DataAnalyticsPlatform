"use client";

import React from "react";
import { Table, Tooltip, Button } from "antd";
import { LayoutDashboard, User, Globe, ArrowRight } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { SchemaInfo } from "@/features/services/types";

interface SchemaListTableProps {
  schemas: SchemaInfo[];
  loading: boolean;
  onSchemaClick: (schema: SchemaInfo) => void;
}

export function SchemaListTable({
  schemas,
  loading,
  onSchemaClick,
}: SchemaListTableProps) {
  const columns: ColumnsType<SchemaInfo> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (text) => (
        <div className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50/50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-200">
            <LayoutDashboard size={14} />
          </div>
          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {text}
          </span>
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
      title: "Owners",
      dataIndex: "owners",
      key: "owners",
      width: "15%",
      render: (owners: string[]) => (
        owners && owners.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {owners.map(owner => (
              <div key={owner} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium">
                <User size={10} className="text-slate-400" />
                <span className="truncate max-w-[100px]">{owner}</span>
              </div>
            ))}
          </div>
        ) : <span className="text-slate-400 text-[13px]">—</span>
      ),
    },
    {
      title: "Domains",
      dataIndex: "domains",
      key: "domains",
      width: "15%",
      render: (domains: string[]) => (
        domains && domains.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {domains.map(domain => (
              <div key={domain} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium">
                <Globe size={10} className="text-slate-400" />
                <span className="truncate max-w-[100px]">{domain}</span>
              </div>
            ))}
          </div>
        ) : <span className="text-slate-400 text-[13px]">—</span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: (_, record) => (
        <Tooltip title="View Schema Objects">
          <Button
            type="text"
            className="flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            icon={<ArrowRight size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              onSchemaClick(record);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      dataSource={schemas}
      columns={columns}
      rowKey="name"
      loading={loading}
      pagination={false}
      scroll={{ y: "calc(100vh - 300px)" }}
      onRow={(record) => ({
        onClick: () => onSchemaClick(record),
        className: "cursor-pointer",
      })}
      className="custom-catalog-table flex-1 flex flex-col h-full"
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
