"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Empty, Input, Spin, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  ArrowRight,
  FileText,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { serviceService } from "@/features/services/services/service.service";
import { type ExplorerFileAsset } from "@/features/services/types";

export default function DataAssetFileGroupPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetId = params.dataset_id as string;
  const datasetName = searchParams.get("dn") || "File Group";
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: fileAssets = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["file-assets", datasetId],
    queryFn: () =>
      serviceService.getDataAssets({
        dataset_id: datasetId,
        asset_type: "file",
        skip: 0,
        limit: 100,
      }),
    enabled: !!datasetId,
    staleTime: 30 * 1000,
  });

  const filteredFileAssets = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return fileAssets.filter((asset) => {
      const name = String(asset.name || "").toLowerCase();
      const displayName = String(asset.display_name || "").toLowerCase();
      const description = String(asset.description || "").toLowerCase();
      const fqn = String(asset.fully_qualified_name || "").toLowerCase();
      const sourceType = String(asset.source_type || "").toLowerCase();
      return (
        name.includes(normalizedSearch) ||
        displayName.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        fqn.includes(normalizedSearch) ||
        sourceType.includes(normalizedSearch)
      );
    });
  }, [fileAssets, searchTerm]);

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets", href: "/explore/data-assets" },
    { label: "Files", href: "/explore/data-assets?section=files" },
    { label: datasetName },
  ];

  const columns: ColumnsType<ExplorerFileAsset> = [
    {
      title: "Name",
      key: "name",
      width: "24%",
      render: (_, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 text-emerald-600">
            <FileText size={14} />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
              {record.display_name || record.name}
            </span>
            <span className="truncate text-[11px] text-slate-400">{record.name || record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "24%",
      render: (value) => (
        <span className="line-clamp-2 text-[13px] text-slate-500">
          {value || <span className="italic opacity-70">No description provided</span>}
        </span>
      ),
    },
    {
      title: "Asset Type",
      dataIndex: "asset_type",
      key: "asset_type",
      width: "10%",
      render: (value) => (
        <Tag className="m-0 rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-emerald-700">
          {value || "file"}
        </Tag>
      ),
    },
    {
      title: "Source Type",
      dataIndex: "source_type",
      key: "source_type",
      width: "10%",
      render: (value) => (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          <Shield size={12} />
          {value || "-"}
        </span>
      ),
    },
    {
      title: "Fully Qualified Name",
      dataIndex: "fully_qualified_name",
      key: "fully_qualified_name",
      width: "18%",
      render: (value) => (
        <span className="line-clamp-2 font-mono text-[12px] text-slate-500">
          {value || "-"}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: "14%",
      render: (value) => (
        <span className="text-[13px] text-slate-500">
          {value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-"}
        </span>
      ),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      width: "14%",
      render: (value) => (
        <span className="text-[13px] text-slate-500">
          {value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-"}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: "6%",
      align: "right",
      render: () => (
        <ArrowRight size={16} className="mr-2 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      ),
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA] animate-in fade-in duration-500">
      <div className="shrink-0 border-b border-slate-200 bg-white px-6 pt-5 shadow-sm">
        <div className="mx-auto max-w-[1400px] pb-4">
          <div className="flex items-center justify-between gap-4">
            <PageHeader
              title={datasetName}
              description="Browse file assets linked to this file group."
              breadcrumbItems={breadcrumbItems}
            />
            <Tooltip title="Refresh File Assets">
              <Button
                onClick={() => refetch()}
                icon={<RefreshCw size={14} className={isLoading || isRefetching ? "animate-spin" : ""} />}
                className="flex h-9 w-9 items-center justify-center rounded-md border-slate-200 p-0 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <FileText size={16} className="text-slate-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                File Asset Inventory
              </span>
            </div>
            <div className="flex max-w-md flex-1 items-center gap-2 px-2">
              <Search size={16} className="text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search file assets by name, description, or FQN"
                variant="borderless"
                className="h-9 w-full max-w-md px-2 text-[14px] shadow-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isError ? (
              <div className="p-6">
                <Alert
                  title="Failed to load file assets"
                  description="We couldn't load the file assets for this dataset right now."
                  type="error"
                  showIcon
                  action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
                />
              </div>
            ) : (
              <Table
                dataSource={filteredFileAssets}
                columns={columns}
                rowKey="id"
                loading={{
                  spinning: isLoading,
                  indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />,
                }}
                pagination={{
                  pageSize: 50,
                  hideOnSinglePage: true,
                  className: "px-6 py-4 border-t border-slate-100 !mb-0 bg-white",
                }}
                className="custom-explore-table"
                onRow={(record) => ({
                  onClick: () =>
                    router.push(
                      `/explore/data-assets/details/${record.id}?source=file&datasetId=${encodeURIComponent(datasetId)}&datasetName=${encodeURIComponent(datasetName)}&an=${encodeURIComponent(record.display_name || record.name || "File Asset")}`,
                    ),
                  className: "cursor-pointer group",
                })}
                locale={{
                  emptyText: (
                    <Empty
                      image={<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50"><FileText className="text-slate-300" size={28} /></div>}
                      description={
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-slate-700">No File Assets Found</span>
                          <span className="text-[13px] text-slate-400">Assets created from this dataset will appear here.</span>
                        </div>
                      }
                    />
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-explore-table .ant-table {
          background: transparent !important;
        }
        .custom-explore-table .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 24px !important;
        }
        .custom-explore-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
