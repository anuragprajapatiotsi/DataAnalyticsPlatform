"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Button, Descriptions, Empty, Spin, Table, Tabs, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  Calendar,
  CheckCircle2,
  Database,
  File,
  Fingerprint,
  HardDrive,
  Type,
} from "lucide-react";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { FileAssetCatalogViewModal } from "@/features/explore/components/FileAssetCatalogViewModal";
import { useFileAssetDetail } from "@/features/explore/hooks/useFileAssetDetail";
import {
  useCreateCatalogView,
  type CreateCatalogViewFromFileAssetRequest,
} from "@/features/explore/hooks/useCreateCatalogView";
import type { IngestFilePreviewColumn } from "@/features/explore/services/file.service";

type PreviewRow = Record<string, unknown> & { __previewKey: string };

export default function FileAssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.job_id as string;
  const [activeTab, setActiveTab] = React.useState("columns");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data, isLoading, isError, error } = useFileAssetDetail(jobId);
  const createCatalogViewMutation = useCreateCatalogView();

  const file = data?.file;
  const preview = data?.preview;

  const orderedSchema = React.useMemo(() => {
    const schema = Array.isArray(preview?.inferred_schema) ? preview.inferred_schema : [];
    return [...schema].sort((a, b) => {
      const aPos = typeof a?.ordinal_position === "number" ? a.ordinal_position : Number.MAX_SAFE_INTEGER;
      const bPos = typeof b?.ordinal_position === "number" ? b.ordinal_position : Number.MAX_SAFE_INTEGER;
      return aPos - bPos;
    });
  }, [preview]);

  const sampleRows = React.useMemo<PreviewRow[]>(
    () =>
      (Array.isArray(preview?.preview_rows) ? preview.preview_rows : []).map((row, index) => ({
        ...row,
        __previewKey: `asset-preview-${index}-${JSON.stringify(row)}`,
      })),
    [preview],
  );

  const formatBytes = (bytes?: number, decimals = 2) => {
    if (bytes === undefined || bytes === null || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const formatCellValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const renderTruncatedText = (value: unknown, className = "max-w-[240px]") => {
    const displayValue = formatCellValue(value);
    return (
      <Tooltip title={displayValue}>
        <div className={`truncate text-sm text-slate-700 ${className}`}>{displayValue}</div>
      </Tooltip>
    );
  };

  const columnColumns: ColumnsType<IngestFilePreviewColumn> = [
    {
      title: "Position",
      dataIndex: "ordinal_position",
      key: "ordinal_position",
      width: 120,
      render: (value) => <span className="font-mono text-[13px] text-slate-500">{value ?? "-"}</span>,
    },
    {
      title: "Column Name",
      dataIndex: "name",
      key: "name",
      width: 260,
      render: (value) => <span className="font-medium text-slate-800">{value || "-"}</span>,
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "data_type",
      width: 220,
      render: (value) => (
        <span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-mono text-[12px] uppercase text-indigo-700">
          {value || "UNKNOWN"}
        </span>
      ),
    },
    {
      title: "Nullable",
      dataIndex: "nullable",
      key: "nullable",
      width: 160,
      render: (value) => (
        <Tag color={value ? "green" : "red"} className="m-0 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase">
          {value ? "Yes" : "No"}
        </Tag>
      ),
    },
  ];

  const isFileAsset = String(file?.asset_type || "").toLowerCase() === "file";
  const successfulStatuses = new Set(["success", "completed", "preview_ready"]);
  const isSuccessfulIngest = successfulStatuses.has(String(file?.status || "").toLowerCase());
  const canCreateCatalogView = Boolean(file?.asset_id) && isFileAsset && isSuccessfulIngest;

  const createButtonTooltip = !file?.asset_id
    ? "This file is not linked to a data asset yet."
    : !isFileAsset
      ? "Catalog Views can only be created from file assets."
      : !isSuccessfulIngest
        ? "The ingest job must complete successfully before creating a catalog view."
        : "Create a catalog view from this file asset.";

  const defaultCatalogViewName = React.useMemo(
    () => (file?.file_name || "file_asset").replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase(),
    [file?.file_name],
  );

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Files", href: "/explore/files" },
    { label: "File Group", href: "/explore/files" },
    { label: file?.file_name || jobId || "File Asset" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FAFAFA]">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !file || !preview) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          showIcon
          title="Unable to load file asset"
          description={
            error instanceof Error
              ? error.message
              : "We could not load the file asset detail right now."
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#FAFAFA] animate-in fade-in duration-500">
      <div className="border-b border-slate-200 bg-white px-6 pb-4 pt-5 shadow-sm">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <PageHeader
              title={file.file_name || "File Asset"}
              description="Inspect file asset metadata, inferred columns, and sample preview before creating a catalog view."
              breadcrumbItems={breadcrumbItems}
            />

            <Tooltip title={createButtonTooltip}>
              <Button
                type="primary"
                icon={<CheckCircle2 size={16} />}
                disabled={!canCreateCatalogView}
                onClick={() => setIsModalOpen(true)}
                className="h-9 rounded-md border-none bg-slate-900 px-4 font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Create Catalog View
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 pb-10">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start gap-4 px-6 py-5">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <File size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold text-slate-900">
                    {file.asset_name || file.file_name || "-"}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span className="uppercase">{file.file_type || "-"}</span>
                    <span className="text-slate-300">•</span>
                    <span>{formatBytes(file.file_size)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{preview.row_count_estimate ?? 0} rows estimated</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {file.description?.trim() || "Inspect this file asset before creating a catalog view."}
                  </div>
                </div>
              </div>
              <Tag color={isSuccessfulIngest ? "success" : "processing"} className="m-0 rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase">
                {file.status || "pending"}
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
                <Descriptions.Item label={<div className="flex items-center gap-1.5"><Type size={14} />File Name</div>}>
                  {file.file_name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<div className="flex items-center gap-1.5"><Fingerprint size={14} />Asset ID</div>}>
                  {file.asset_id || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<div className="flex items-center gap-1.5"><HardDrive size={14} />File Size</div>}>
                  {formatBytes(file.file_size)}
                </Descriptions.Item>
                <Descriptions.Item label={<div className="flex items-center gap-1.5"><Database size={14} />Dataset</div>}>
                  {file.dataset_name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<div className="flex items-center gap-1.5"><Type size={14} />Description</div>}>
                  {file.description?.trim() || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<div className="flex items-center gap-1.5"><Calendar size={14} />Created At</div>}>
                  {file.created_at ? dayjs(file.created_at).format("MMM D, YYYY h:mm A") : "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<div className="flex items-center gap-1.5"><Calendar size={14} />Completed At</div>}>
                  {file.completed_at ? dayjs(file.completed_at).format("MMM D, YYYY h:mm A") : "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<div className="flex items-center gap-1.5"><Calendar size={14} />Updated At</div>}>
                  {file.updated_at ? dayjs(file.updated_at).format("MMM D, YYYY h:mm A") : "-"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "columns",
                  label: "Columns",
                  children: orderedSchema.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table
                        dataSource={orderedSchema}
                        columns={columnColumns}
                        rowKey={(record) => record.name || String(record.ordinal_position || "column")}
                        pagination={false}
                        className="custom-file-asset-table"
                      />
                    </div>
                  ) : (
                    <div className="py-16">
                      <Empty description="No columns available" />
                    </div>
                  ),
                },
                {
                  key: "metadata",
                  label: "Metadata",
                  children: (
                    <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <h3 className="m-0 text-sm font-semibold text-slate-900">Asset Metadata</h3>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
                          <div><span className="font-medium text-slate-800">Job ID:</span> {jobId}</div>
                          <div><span className="font-medium text-slate-800">Asset Type:</span> {file.asset_type || "-"}</div>
                          <div><span className="font-medium text-slate-800">Column Count:</span> {file.column_count ?? orderedSchema.length}</div>
                          <div><span className="font-medium text-slate-800">Bucket:</span> {file.bucket || "-"}</div>
                          <div><span className="font-medium text-slate-800">Object Key:</span> {file.object_key || "-"}</div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <h3 className="m-0 text-sm font-semibold text-slate-900">Quality Summary</h3>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
                          <div><span className="font-medium text-slate-800">Preview Rows:</span> {sampleRows.length}</div>
                          <div><span className="font-medium text-slate-800">Estimated Rows:</span> {preview.row_count_estimate ?? "-"}</div>
                          <div><span className="font-medium text-slate-800">Nullable Columns:</span> {orderedSchema.filter((column) => column.nullable).length}</div>
                          <div><span className="font-medium text-slate-800">Non-nullable Columns:</span> {orderedSchema.filter((column) => !column.nullable).length}</div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "profile",
                  label: "Profile",
                  children: sampleRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table
                        dataSource={sampleRows}
                        columns={orderedSchema.map((column) => ({
                          title: column.name || "Unknown",
                          dataIndex: column.name,
                          key: column.name,
                          width: 220,
                          render: (value: unknown) => renderTruncatedText(value),
                        }))}
                        rowKey={(record) => record.__previewKey}
                        pagination={false}
                        className="custom-file-asset-table"
                      />
                    </div>
                  ) : (
                    <div className="py-16">
                      <Empty description="No sample data available" />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-file-asset-table .ant-table {
          background: transparent !important;
        }
        .custom-file-asset-table .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 24px !important;
        }
        .custom-file-asset-table .ant-table-tbody > tr > td {
          padding: 12px 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
      `}</style>

      <FileAssetCatalogViewModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataAssetId={file.asset_id || ""}
        defaultName={defaultCatalogViewName}
        defaultDisplayName={file.file_name || defaultCatalogViewName}
        isSubmitting={createCatalogViewMutation.isPending}
        onSubmit={async (values) => {
          let parsedSyncConfig: Record<string, unknown> | undefined;
          if (values.sync_config?.trim()) {
            parsedSyncConfig = JSON.parse(values.sync_config);
          }

          const payload: CreateCatalogViewFromFileAssetRequest = {
            data_asset_id: values.data_asset_id,
            name: values.name.trim(),
            display_name: values.display_name.trim(),
            description: values.description?.trim() || undefined,
            tags: values.tags ?? [],
            glossary_term_ids: values.glossary_term_ids ?? [],
            synonyms: values.synonyms ?? [],
            sync_mode: values.sync_mode || "on_demand",
            cron_expr: values.sync_mode === "scheduled" ? values.cron_expr?.trim() || undefined : undefined,
            sync_config: parsedSyncConfig,
          };

          await createCatalogViewMutation.mutateAsync(payload);
          setIsModalOpen(false);
          router.push("/explore/object-resources");
        }}
      />
    </div>
  );
}
