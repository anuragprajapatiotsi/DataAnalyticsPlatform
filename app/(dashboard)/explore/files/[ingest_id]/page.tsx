"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Table, Spin, Alert, Descriptions, Tag, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { File, HardDrive, Hash, Type, Fingerprint, Calendar, AlertCircle, Database } from "lucide-react";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { fileService } from "@/features/explore/services/file.service";
import { cn } from "@/shared/utils/cn";

export default function ExploreFileDetailPage() {
  const params = useParams();
  const ingestId = params.ingest_id as string;

  const { data: file, isLoading, isError } = useQuery({
    queryKey: ["file", ingestId],
    queryFn: () => fileService.getFileById(ingestId),
    enabled: !!ingestId,
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

  const schemaColumns: ColumnsType<any> = [
    {
      title: "Position",
      key: "index",
      width: "10%",
      render: (_, __, index) => <span className="text-slate-500 font-mono text-[13px]">{index + 1}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (name) => (
        <span className="font-medium text-slate-800">{name || "—"}</span>
      ),
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "data_type",
      width: "40%",
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
      width: "20%",
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

              {/* Metadata Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File size={16} className="text-slate-500" />
                    <h3 className="font-semibold text-slate-800 text-[15px] m-0">Overview & Metadata</h3>
                  </div>
                  <Tag color={getStatusColor(file.status)} className="m-0 border uppercase font-semibold text-[11px] px-3 py-0.5 rounded-full">
                    {file.status || "PENDING"}
                  </Tag>
                </div>
                <div className="p-6">
                  <Descriptions column={{ xs: 1, sm: 2, md: 3 }} colon={false} styles={{ label: { color: '#64748b', fontWeight: 500, fontSize: '13px' }, content: { color: '#0f172a', fontWeight: 500, fontSize: '14px' } }}>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Type size={14}/>File Name</div>}>
                      {file.file_name || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Fingerprint size={14}/>File Type</div>}>
                      <span className="uppercase">{file.file_type || file.file_name?.split('.').pop() || "—"}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><HardDrive size={14}/>File Size</div>}>
                      {formatBytes(file.file_size)}
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Calendar size={14}/>Created At</div>}>
                      {file.created_at ? dayjs(file.created_at).format("MMM D, YYYY h:mm A") : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Database size={14}/>Bucket Target</div>}>
                      {file.bucket || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<div className="flex items-center gap-1.5"><Hash size={14}/>Object Key</div>}>
                      <span className="font-mono text-[12px] truncate max-w-[200px]" title={file.object_key}>{file.object_key || "—"}</span>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>

              {/* Inferred Schema Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Database size={16} className="text-slate-500" />
                  <h3 className="font-semibold text-slate-800 text-[15px] m-0">Inferred Schema</h3>
                </div>
                <div className="p-0">
                  <Table
                    dataSource={file.inferred_schema && Array.isArray(file.inferred_schema) ? file.inferred_schema : []}
                    columns={schemaColumns}
                    rowKey={(record) => record.name || `col-${Math.random()}`}
                    pagination={false}
                    className="custom-schema-table"
                    locale={{
                      emptyText: (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Type className="text-slate-300" size={28} />
                          </div>
                          <span className="text-slate-700 font-medium text-sm">No Schema Available</span>
                          <span className="text-slate-400 text-[13px] mt-1 max-w-[280px]">Schema inference is either pending or not applicable for this file type.</span>
                        </div>
                      )
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-schema-table .ant-table {
          background: transparent !important;
        }
        .custom-schema-table .ant-table-thead > tr > th {
          background: #FAFAFA !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #E2E8F0 !important;
          padding: 12px 24px !important;
        }
        .custom-schema-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .custom-schema-table .ant-table-tbody > tr > td {
          padding: 12px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
        }
      `}</style>
    </div>
  );
}
