"use client";

import React from "react";
import { Empty, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { ChatResultPreview as ChatResultPreviewType } from "@/features/chatbot/types";

function buildRows(preview: ChatResultPreviewType) {
  if (Array.isArray(preview.row_objects) && preview.row_objects.length) {
    return preview.row_objects.map((row, index) => ({
      __rowKey: `row-${index}`,
      ...row,
    }));
  }

  if (Array.isArray(preview.rows) && preview.rows.length) {
    return preview.rows.map((row, index) => {
      const record: Record<string, unknown> = { __rowKey: `row-${index}` };
      preview.columns.forEach((column, columnIndex) => {
        record[column] = Array.isArray(row) ? row[columnIndex] : null;
      });
      return record;
    });
  }

  return [];
}

export function ChatResultPreview({
  preview,
  embedded = false,
}: {
  preview: ChatResultPreviewType;
  embedded?: boolean;
}) {
  const rows = React.useMemo(() => buildRows(preview), [preview]);

  const columns = React.useMemo<ColumnsType<Record<string, unknown>>>(
    () =>
      preview.columns.map((column) => ({
        title:
          preview.column_metadata?.[column]?.display_label ||
          column,
        dataIndex: preview.display_fields?.[column] || column,
        key: column,
        width: 180,
        ellipsis: true,
        render: (value: unknown, record) => {
          const displayKey = preview.display_fields?.[column];
          const displayValue =
            displayKey && record[displayKey] !== undefined
              ? record[displayKey]
              : value;

          return (
            <span className="text-sm text-slate-700">
              {displayValue === null || displayValue === undefined || displayValue === ""
                ? "-"
                : String(displayValue)}
            </span>
          );
        },
      })),
    [preview],
  );

  const content = (
    <div className="min-w-0 p-3 sm:p-4">
      <div className="w-full overflow-x-auto">
        <Table<Record<string, unknown>>
          rowKey="__rowKey"
          dataSource={rows}
          columns={columns}
          tableLayout="fixed"
          scroll={{ x: Math.max(720, preview.columns.length * 180) }}
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No preview rows returned"
              />
            ),
          }}
        />
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="text-base font-semibold text-slate-900">Result Preview</div>
        <div className="mt-1 text-sm text-slate-500">
          {typeof preview.row_count === "number"
            ? `${preview.row_count} row${preview.row_count === 1 ? "" : "s"} available in this preview.`
            : "Preview rows returned from the AI response."}
        </div>
      </div>
      {content}
    </div>
  );
}
