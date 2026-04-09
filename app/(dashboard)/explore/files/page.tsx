"use client";

import React, { useState } from "react";
import { Table, Spin, Empty, Tooltip, Button, Dropdown, message, Modal } from "antd";
import type { MenuProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { File, ArrowRight, RefreshCw, FileArchive, FileJson, FileSpreadsheet, FileUp, FileText, MoreVertical, Layers, Trash2 } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { fileService } from "@/features/explore/services/file.service";
import { FileUploadModal } from "@/features/explore/components/FileUploadModal";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { cn } from "@/shared/utils/cn";

export default function ExploreFilesPage() {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Files" },
  ];

  const {
    data: files = [],
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ["files"],
    queryFn: () => fileService.getFiles({ limit: 100 }),
  });

  const sortedFiles = React.useMemo(() => {
    if (!files) return [];
    return [...files].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [files]);

  const getFileIcon = (filename: string, filenameType = "") => {
    const ext = filename?.split(".").pop()?.toLowerCase() || filenameType.toLowerCase();
    switch (ext) {
      case "csv": return <FileSpreadsheet size={14} />;
      case "json": return <FileJson size={14} />;
      case "zip": return <FileArchive size={14} />;
      case "txt": return <FileText size={14} />;
      default: return <File size={14} />;
    }
  };

  const formatBytes = (bytes?: number, decimals = 2) => {
    if (bytes === undefined || bytes === null || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const columns: ColumnsType<any> = [
    {
      title: "File Name",
      dataIndex: "file_name",
      key: "file_name",
      width: "35%",
      render: (name, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 transition-all duration-200">
            {getFileIcon(name, record.file_type)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover/name:text-indigo-600 transition-colors">
              {name || "Unknown File"}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-mono text-slate-500">
                ID: {record.job_id?.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "File Type",
      dataIndex: "file_type",
      key: "file_type",
      width: "15%",
      render: (type, record) => {
        const fallback = record.filename?.split(".").pop()?.toUpperCase() || "UNKNOWN";
        return (
          <span className="text-[12px] font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded uppercase font-medium">
            {type || fallback}
          </span>
        );
      },
    },
    {
      title: "File Size",
      dataIndex: "file_size",
      key: "size",
      width: "15%",
      render: (sizeStr) => {
        const sizeByte = parseInt(sizeStr);
        return (
          <span className="text-[13px] text-slate-600 font-medium tracking-wide">
            {isNaN(sizeByte) ? "—" : formatBytes(sizeByte)}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status = "") => {
        const s = status.toLowerCase();
        const isSuccess = s === "preview_ready" || s === "success" || s === "completed";
        const isFailed = s === "failed" || s === "error";
        const isProcessing = s === "processing" || s === "pending";
        
        return (
          <div className={cn(
            "inline-flex flex-col items-start gap-1 justify-center rounded-full text-[11px] font-medium border px-2.5 py-1 capitalize",
            isSuccess ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            isFailed ? "bg-red-50 text-red-700 border-red-200" :
            isProcessing ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
            "bg-blue-50 text-blue-600 border-blue-200"
          )}>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full inline-block",
                isSuccess ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" :
                isFailed ? "bg-red-500" : 
                isProcessing ? "bg-yellow-500 animate-pulse" :
                "bg-blue-500 animate-pulse"
              )} />
              {s.replace("_", " ")}
            </div>
          </div>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: "15%",
      render: (dateStr) => (
        <span className="text-slate-500 text-[13px]">
          {dateStr ? dayjs(dateStr).format("MMM D, YYYY h:mm A") : "—"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, record) => {
        const isSuccess = record.status === "success";
        const isProcessing = record.status === "processing";

        const items: MenuProps["items"] = [
          {
            key: "create_catalog",
            label: "Create Catalog View",
            icon: <Layers size={14} className={cn("text-indigo-500", (isSuccess || isProcessing) && "opacity-50 grayscale")} />,
            disabled: isSuccess || isProcessing,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              Modal.confirm({
                title: "Create Catalog View",
                content: "Do you want to create a catalog view from this file?",
                okText: "Create View",
                okType: "primary",
                cancelText: "Cancel",
                centered: true,
                onOk: async () => {
                  try {
                    await fileService.confirmJob(record.job_id);
                    message.success(`Job confirmed successfully: ${record.file_name || record.job_id}`);
                    refetch();
                  } catch (error) {
                    message.error("Failed to generate catalog view. Please try again.");
                  }
                },
              });
            },
          },
          {
            key: "delete",
            label: <span className={cn("font-medium", isProcessing ? "text-slate-400" : "text-red-500")}>Delete File</span>,
            icon: <Trash2 size={14} className={cn(isProcessing ? "text-slate-400" : "text-red-500")} />,
            disabled: isProcessing,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              Modal.confirm({
                title: "Are you sure you want to delete this file?",
                content: `This will permanently delete the file "${record.file_name || record.job_id}". This action cannot be undone.`,
                okText: "Delete",
                okType: "danger",
                cancelText: "Cancel",
                centered: true,
                onOk: async () => {
                  try {
                    await fileService.deleteFile(record.job_id);
                    message.success(`Successfully deleted file: ${record.file_name || record.job_id}`);
                    refetch();
                  } catch (error) {
                    message.error("Failed to delete the file. Please try again.");
                  }
                },
              });
            },
          },
        ];

        return (
          <div className="flex items-center justify-end pr-2" onClick={(e) => e.stopPropagation()}>
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
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden relative">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 pb-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <PageHeader
            title="Ingested Files"
            description="Manage, upload, and monitor all ingested file assets through the data platform."
            breadcrumbItems={breadcrumbItems}
          />
          
          <div className="flex items-center gap-3">
            <Tooltip title="Refresh Files">
              <Button
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                icon={<RefreshCw size={14} className={isLoading || isRefetching ? "animate-spin" : ""} />}
                className="h-9 w-9 p-0 flex items-center justify-center rounded-md border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
              />
            </Tooltip>
            <Button
              type="primary"
              onClick={() => setIsUploadModalOpen(true)}
              icon={<FileUp size={16} />}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium h-9 px-4 shadow-sm border-none"
            >
              Upload File
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
            <Table
              dataSource={isError ? [] : sortedFiles}
              columns={columns}
              rowKey={(record) => record.job_id || record.id || `fallback-${Math.random()}`}
              loading={{
                spinning: isLoading,
                indicator: <Spin indicator={<RefreshCw className="animate-spin text-indigo-600" size={24} />} />
              }}
              pagination={{
                pageSize: 50,
                hideOnSinglePage: true,
                className: "px-6 py-4 border-t border-slate-100 !mb-0 bg-white",
              }}
              onRow={(record) => ({
                onClick: () => router.push(`/explore/files/${record.job_id}`),
                className: "cursor-pointer group hover:bg-slate-50/50 transition-colors",
              })}
              className="custom-explore-table"
              locale={{
                emptyText: isError ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
                      <FileText className="text-red-300" size={28} />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">Failed to Load Files</span>
                    <span className="text-slate-400 text-[13px] mt-1 max-w-[280px]">We encountered an error while fetching the ingest files. Please try again.</span>
                    <Button onClick={() => refetch()} className="mt-4" size="small">Retry</Button>
                  </div>
                ) : (
                  <Empty
                    image={
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <FileText className="text-slate-300" size={28} />
                      </div>
                    }
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700 font-medium text-sm">No files uploaded</span>
                        <span className="text-slate-400 text-[13px]">There are currently no files ingested in the platform.</span>
                      </div>
                    }
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Modern Table "Ghost" Styles with Sticky Header */
        .custom-explore-table .ant-table {
          background: transparent !important;
        }
        .custom-explore-table .ant-table-thead > tr > th {
          background: #FAFAFA !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #E2E8F0 !important;
          padding: 12px 24px !important;
          /* Sticky Header Logic */
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .custom-explore-table .ant-table-thead > tr > th::before {
          display: none !important; /* Remove Antd default column separators */
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
      `}</style>
      
      <FileUploadModal 
        open={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}
