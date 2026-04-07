"use client";

import React from "react";
import { Table, Empty, Spin } from "antd";
import { Database, ArrowRight } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { DatabaseInfo } from "@/features/services/types";

interface DatabaseListTableProps {
  databases: DatabaseInfo[];
  loading: boolean;
  onDatabaseClick: (db: DatabaseInfo) => void;
}

export function DatabaseListTable({
  databases,
  loading,
  onDatabaseClick,
}: DatabaseListTableProps) {
  const columns: ColumnsType<DatabaseInfo> = [
    {
      title: "Database Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text) => (
        <div className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50/50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-200">
            <Database size={14} />
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
          {text || "Explore tables and schemas in this database."}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: "15%",
      render: () => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
          Active
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "10%",
      render: (type) => (
        <div className="inline-flex items-center px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium capitalize">
          {type || "Database"}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: () => (
        <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )
    },
  ];

  return (
    <Table
      dataSource={databases}
      columns={columns}
      rowKey="name"
      loading={loading}
      pagination={false}
      scroll={{ y: "calc(100vh - 250px)" }}
      onRow={(record) => ({
        onClick: () => onDatabaseClick(record),
        className: "cursor-pointer group",
      })}
      className="custom-catalog-table flex-1 flex flex-col h-full"
      locale={{
        emptyText: (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <Database size={32} className="text-slate-300 mb-3" />
            <span className="text-[14px] font-medium text-slate-700">No databases found</span>
            <span className="text-[13px]">There are no databases available in this connection.</span>
          </div>
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
