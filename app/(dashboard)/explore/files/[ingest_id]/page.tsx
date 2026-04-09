"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Table, Spin, Alert, Descriptions, Tag, Empty, Tabs, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { File, HardDrive, Hash, Type, Fingerprint, Calendar, AlertCircle, Database } from "lucide-react";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import {
  fileService,
  type IngestFilePreviewColumn,
} from "@/features/explore/services/file.service";

export default function ExploreFileDetailPage() {
  const params = useParams();
  const ingestId = params.ingest_id as string;
  const [activeTab, setActiveTab] = React.useState("sample-data");

  const { data: file, isLoading, isError } = useQuery({
    queryKey: ["file", ingestId],
    queryFn: () => fileService.getFileById(ingestId),
    enabled: !!ingestId,
  });

  const shouldFetchPreview = activeTab === "sample-data" || activeTab === "column-info";
  const {
    data: preview,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    error: previewError,
  } = useQuery({
    queryKey: ["file-preview", ingestId],
    queryFn: () => fileService.getFilePreview(ingestId),
    enabled: !!ingestId && shouldFetchPreview,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Files", href: "/explore/files" },
    { label: file?.file_name || ingestId || "Detail" },
  ];

  const formatBytes = (bytes?: number, decimals = 2) => {
    if (bytes === undefined || bytes === null || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const orderedSchema = React.useMemo(() => {
    const schema = Array.isArray(preview?.inferred_schema) ? preview.inferred_schema : [];
    return [...schema].sort((a, b) => {
      const positionA = typeof a?.ordinal_position === "number" ? a.ordinal_position : Number.MAX_SAFE_INTEGER;
      const positionB = typeof b?.ordinal_position === "number" ? b.ordinal_position : Number.MAX_SAFE_INTEGER;
      return positionA - positionB;
    });
  }, [preview]);

  const sampleRows = React.useMemo(
    () =>
      (Array.isArray(preview?.preview_rows) ? preview.preview_rows : []).map((row, index) => ({
        ...row,
        __previewKey: `preview-row-${index}-${JSON.stringify(row)}`,
      })),
    [preview],
  );

  const formatCellValue = React.useCallback((value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return " - ";
    }

    if (typeof value === "number" || typeof value === "bigint") {
      return String(value);
    }

    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }

    if (typeof value === "string") {
      return value;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }, []);

  const renderTruncatedText = React.useCallback(
    (value: unknown, className = "max-w-[240px]") => {
      const displayValue = formatCellValue(value);

      return (
        <Tooltip title={displayValue}>
          <div className={`truncate text-sm text-slate-700 ${className}`}>{displayValue}</div>
        </Tooltip>
      );
    },
    [formatCellValue],
  );

  const columnInfoColumns: ColumnsType<IngestFilePreviewColumn> = [
    {
      title: "Position",
      dataIndex: "ordinal_position",
      key: "ordinal_position",
      width: 120,
      render: (value) => <span className="text-slate-500 font-mono text-[13px]">{value ?? "-"}</span>,
    },
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: 240,
      render: (name) => <span className="font-medium text-slate-800">{name || "-"}</span>,
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "data_type",
      width: 220,
      render: (type) => (
        <span className="text-[12px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
          {type || "UNKNOWN"}
        </span>
      ),
    },
    {
      title: "Nullable",
      dataIndex: "nullable",
      key: "nullable",
      width: 160,
      render: (nullable) => {
        const isNullable = Boolean(nullable);
        return (
          <Tag color={isNullable ? "green" : "red"} variant="filled" className="uppercase font-semibold tracking-wider text-[10px]">
            {isNullable ? "YES" : "NO"}
          </Tag>
        );
      },
    },
  ];

  // Derive status UI
  const getStatusColor = (status: string = "") => {
    const s = status.toUpperCase();
    if (s === "SUCCESS" || s === "COMPLETED") return "success";
    if (s === "FAILED" || s === "ERROR") return "error";
      return "processing";
  };

  const sampleDataColumns = React.useMemo<ColumnsType<Record<string, unknown>>>(() => {
    return orderedSchema.map((column) => ({
      title: column.name || "Unknown",
      dataIndex: column.name,
      key: column.name,
      width: 220,
      render: (value: unknown) => renderTruncatedText(value),
    }));
  }, [orderedSchema, renderTruncatedText]);

  const previewEmpty = !isPreviewLoading && !isPreviewError && orderedSchema.length === 0 && sampleRows.length === 0;

  const renderPreviewState = (mode: "sample" | "columns") => {
    if (isPreviewLoading) {
      return (
        <div className="flex items-center justify-center p-20">
          <Spin description="Loading preview..." size="large" />
        </div>
      );
    }

    if (isPreviewError) {
      return (
        <Alert
          title="Preview unavailable"
          description={
            previewError instanceof Error
              ? previewError.message
              : "Unable to fetch the file preview right now."
          }
          type="error"
          showIcon
          className="m-6 rounded-xl border-red-200 bg-red-50"
        />
      );
    }

    if (previewEmpty || (mode === "columns" && orderedSchema.length === 0) || (mode === "sample" && sampleRows.length === 0)) {
      return (
        <div className="py-16">
          <Empty
            description={mode === "sample" ? "No sample rows available" : "No column information available"}
          />
        </div>
      );
    }

    if (mode === "columns") {
      return (
        <div className="overflow-x-auto">
          <Table
            dataSource={orderedSchema}
            columns={columnInfoColumns}
            rowKey={(record) => record.name || String(record.ordinal_position || "column")}
            pagination={false}
            className="custom-preview-table"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {/* <div className="px-6 pt-5 text-sm text-slate-500">Showing first 50 rows</div> */}
        <div className="overflow-x-auto">
          <Table
            dataSource={sampleRows}
            columns={sampleDataColumns}
            rowKey={(record) => String(record.__previewKey)}
            pagination={false}
            className="custom-preview-table"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden relative">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 pb-4">
        <div className="max-w-[1400px] mx-auto">
          <PageHeader
            title={file?.file_name || "Loading..."}
            description={`Viewing detailed ingest profile and inferred schema for ${file?.file_name || ingestId}`}
            breadcrumbItems={breadcrumbItems}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-6 pb-12">
          
          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <Spin description="Loading file details..." size="large" />
            </div>
          ) : isError || !file ? (
            <Alert
              message="Data Load Error"
              description="Unable to fetch the file details. The ingest ID might be invalid or the service is temporarily down."
              type="error"
              showIcon
              className="border-red-200 bg-red-50 text-red-700"
            />
          ) : (
            <>
              {/* Error Banner if job failed explicitly */}
              {file.error_message && (
                <Alert
                  icon={<AlertCircle size={18} className="mt-0.5" />}
                  message={<span className="font-semibold text-[15px]">Ingest Operation Failed</span>}
                  description={
                    <div className="mt-1 font-mono text-[13px] bg-red-100 p-3 rounded text-red-800 break-words">
                      {file.error_message}
                    </div>
                  }
                  type="error"
                  showIcon
                  className="rounded-xl border-red-200 shadow-sm"
                />
              )}

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-start gap-4 px-6 py-5">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                      <File size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold text-slate-900">{file.file_name || "-"}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span className="uppercase">{file.file_type || file.file_name?.split(".").pop() || "-"}</span>
                        <span className="text-slate-300">•</span>
                        <span>{formatBytes(file.file_size)}</span>
                      </div>
                      <div className="mt-3 text-sm text-slate-500">
                        Preview ready for schema and sample inspection.
                      </div>
                    </div>
                  </div>
                  <Tag color={getStatusColor(file.status)} className="m-0 border uppercase font-semibold text-[11px] px-3 py-0.5 rounded-full">
                    {file.status || "PENDING"}
                  </Tag>
                </div>
                <div className="border-t border-slate-100 px-6 py-5">
                  <Descriptions
                    column={{ xs: 1, sm: 2, md: 3 }}
                    colon={false}
                    styles={{
                      label: { color: "#64748b", fontWeight: 500, fontSize: "13px" },
                      content: { color: "#0f172a", fontWeight: 500, fontSize: "14px" },
                    }}
                  >
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Type size={14}/>File Name</div>}>
                      {file.file_name || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Fingerprint size={14}/>File Type</div>}>
                      <span className="uppercase">{file.file_type || file.file_name?.split(".").pop() || "-"}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><HardDrive size={14}/>File Size</div>}>
                      {formatBytes(file.file_size)}
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Calendar size={14}/>Created At</div>}>
                      {file.created_at ? dayjs(file.created_at).format("MMM D, YYYY h:mm A") : "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Database size={14}/>Bucket Target</div>}>
                      {file.bucket || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Hash size={14}/>Object Key</div>}>
                      {renderTruncatedText(file.object_key, "max-w-[260px]")}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-1">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  animated
                  items={[
                    {
                      key: "sample-data",
                      label: "Sample Data",
                      children: <div className="transition-all duration-200 ease-out">{renderPreviewState("sample")}</div>,
                    },
                    {
                      key: "column-info",
                      label: "Column Info",
                      children: <div className="transition-all duration-200 ease-out">{renderPreviewState("columns")}</div>,
                    },
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-preview-table .ant-table {
          background: transparent !important;
        }
        .custom-preview-table .ant-table-thead > tr > th {
          background: #FAFAFA !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #E2E8F0 !important;
          padding: 12px 24px !important;
        }
        .custom-preview-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .custom-preview-table .ant-table-tbody > tr > td {
          padding: 12px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          vertical-align: top !important;
        }
        .custom-preview-table .ant-table-cell {
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
