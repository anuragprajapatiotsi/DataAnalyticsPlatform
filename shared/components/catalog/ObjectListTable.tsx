"use client";

import React from "react";
import { Table, Tooltip, Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import { Table as TableIcon, MoreVertical, Eye, Layers, ArrowRight } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { DBObjectInfo } from "@/features/services/types";

interface ObjectListTableProps {
  objects: DBObjectInfo[];
  loading: boolean;
  onObjectClick: (obj: DBObjectInfo) => void;
  onViewDetails: (obj: DBObjectInfo) => void;
  onCreateCatalogView?: (obj: DBObjectInfo) => void;
}

export function ObjectListTable({
  objects,
  loading,
  onObjectClick,
  onViewDetails,
  onCreateCatalogView,
}: ObjectListTableProps) {
  const columns: ColumnsType<DBObjectInfo> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-50/50 border border-emerald-100 text-emerald-600 group-hover/name:bg-emerald-600 group-hover/name:border-emerald-600 group-hover/name:text-white transition-all duration-200">
            <TableIcon size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover/name:text-emerald-600 transition-colors">
              {text}
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {record.object_type || "table"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (text) => (
        <span className="text-slate-500 text-[13px] line-clamp-2">
          {text || "Standard schema object."}
        </span>
      ),
    },
    {
      title: "Owners",
      dataIndex: "owners",
      key: "owners",
      width: "10%",
      render: (owners: string[]) => (
        <div className="flex items-center gap-1.5">
          {owners && owners.length > 0 ? (
            <Tooltip title={owners.join(", ")}>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold">
                {owners[0].charAt(0).toUpperCase()}
              </div>
            </Tooltip>
          ) : (
            <span className="text-slate-400 text-[13px]">—</span>
          )}
        </div>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "20%",
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1.5">
          {tags && tags.length > 0 ? (
            tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-medium"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-[13px]">—</span>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record) => {
        const isEligible = !record.object_type || record.object_type.toLowerCase() === "table" || record.object_type.toLowerCase() === "view";

        const items: MenuProps["items"] = [
          {
            key: "view_details",
            label: "View Object Details",
            icon: <Eye size={14} className="text-slate-500" />,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              onViewDetails(record);
            },
          },
        ];

        if (isEligible && onCreateCatalogView) {
          items.push({ type: "divider" });
          items.push({
            key: "create_view",
            label: "Create Catalog View",
            icon: <Layers size={14} className="text-blue-500" />,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              onCreateCatalogView(record);
            },
          });
        }

        return (
          <div className="flex items-center justify-end gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
            <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
            <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
              <Button 
                type="text" 
                icon={<MoreVertical size={16} />} 
                className="flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 w-8 h-8 rounded-md p-0"
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={objects}
      columns={columns}
      rowKey="name"
      loading={loading}
      pagination={false}
      scroll={{ y: "calc(100vh - 300px)" }}
      onRow={(record) => ({
        onClick: () => onObjectClick(record),
        className: "cursor-pointer group",
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
