"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Alert,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Copy,
  Power,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { datasetService } from "@/features/explore/services/dataset.service";
import { usePublishedApis } from "@/features/published-apis/hooks/usePublishedApis";
import {
  publishedApiService,
  type PublishedApi,
} from "@/features/published-apis/services/published-api.service";

export default function PublishedApisPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [datasetId, setDatasetId] = React.useState<string | undefined>(undefined);
  const [resourceType, setResourceType] = React.useState<string | undefined>(undefined);

  const breadcrumbItems = [{ label: "Published APIs" }];

  const { data: datasets = [] } = useQuery({
    queryKey: ["published-datasets", "published-apis-page"],
    queryFn: () =>
      datasetService.getDatasets({
        source_type: "published_api",
        skip: 0,
        limit: 100,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: publishedApis = [],
    isLoading,
    isError,
    refetch,
  } = usePublishedApis({
    dataset_id: datasetId,
    resource_type: resourceType,
  });

  const filteredApis = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return publishedApis;
    }

    return publishedApis.filter((apiItem) => {
      const values = [
        apiItem.api_id,
        apiItem.id,
        apiItem.dataset_id,
        apiItem.resource_type,
        apiItem.visibility,
        apiItem.route_path,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(normalizedSearch),
      );
    });
  }, [publishedApis, search]);

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => publishedApiService.deactivatePublishedApi(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["published-apis"] });
      message.success("Published API deactivated successfully.");
    },
    onError: () => {
      message.error("Failed to deactivate published API.");
    },
  });

  const handleCopy = async (routePath?: string) => {
    if (!routePath) {
      return;
    }

    try {
      await navigator.clipboard.writeText(routePath);
      message.success("API path copied.");
    } catch {
      message.error("Failed to copy API path.");
    }
  };

  const columns: ColumnsType<PublishedApi> = [
    {
      title: "API ID",
      dataIndex: "api_id",
      key: "api_id",
      width: 220,
      render: (value: string) => <span className="font-mono text-xs text-slate-700">{value}</span>,
    },
    {
      title: "Dataset ID",
      dataIndex: "dataset_id",
      key: "dataset_id",
      width: 210,
      render: (value?: string) => <span className="font-mono text-xs text-slate-500">{value || "-"}</span>,
    },
    {
      title: "Resource Type",
      dataIndex: "resource_type",
      key: "resource_type",
      width: 130,
      render: (value?: string) => <Tag className="m-0 rounded-full">{value || "-"}</Tag>,
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
      width: 120,
      render: (value?: string) => (
        <Tag className="m-0 rounded-full border-blue-200 bg-blue-50 text-blue-700">
          {value || "private"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (value?: boolean) => (
        <Tag
          className={[
            "m-0 rounded-full",
            value === false
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {value === false ? "Inactive" : "Active"}
        </Tag>
      ),
    },
    {
      title: "Route Path",
      dataIndex: "route_path",
      key: "route_path",
      width: 320,
      ellipsis: true,
      render: (value?: string) => (
        <Tooltip title={value || "-"}>
          <div className="flex items-center gap-2 overflow-hidden">
            <code className="block truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
              {value || "-"}
            </code>
            {value ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleCopy(value);
                }}
              >
                <Copy size={13} />
              </Button>
            ) : null}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (value?: string) => (
        <span className="text-sm text-slate-500">
          {value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 190,
      render: (_, record) => (
        <Space onClick={(event) => event.stopPropagation()}>
          <Tooltip title="View Details">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => router.push(`/published-apis/${record.id || record.api_id}`)}
            >
              <ExternalLink size={13} className="mr-1" />
              View
            </Button>
          </Tooltip>
          <Tooltip title={record.is_active === false ? "API already inactive" : "Deactivate API"}>
            <Button
              variant="outline"
              size="sm"
              disabled={record.is_active === false || deactivateMutation.isPending}
              className="h-8 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                Modal.confirm({
                  title: "Deactivate published API?",
                  content: "This API will stop serving requests until it is reactivated from backend support tools.",
                  okText: "Deactivate",
                  okType: "danger",
                  centered: true,
                  onOk: async () => {
                    await deactivateMutation.mutateAsync(record.id || record.api_id);
                  },
                });
              }}
            >
              <Power size={13} className="mr-1" />
              Deactivate
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
          <PageHeader
            title="Published APIs"
            description="Browse published query APIs, inspect their routes, execute them, and deactivate them when needed."
            breadcrumbItems={breadcrumbItems}
          />
          <Button
            variant="outline"
            className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => refetch()}
          >
            <RefreshCw size={14} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="mx-auto h-full max-w-[1500px]">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px_auto]">
                <Input
                  allowClear
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by API ID, dataset, route, or visibility"
                  prefix={<Search size={14} className="text-slate-400" />}
                />
                <Select
                  allowClear
                  value={datasetId}
                  onChange={(value) => setDatasetId(value)}
                  placeholder="Filter Dataset"
                  options={datasets.map((dataset) => ({
                    label: dataset.display_name || dataset.name || dataset.id,
                    value: dataset.id,
                  }))}
                />
                <Select
                  allowClear
                  value={resourceType}
                  onChange={(value) => setResourceType(value)}
                  placeholder="Resource Type"
                  options={[
                    { label: "Save Query", value: "saved_query" },
                    { label: "Table", value: "table" },
                    { label: "Dataset", value: "dataset" },
                  ]}
                />
                {/* <Button
                  variant="outline"
                  className="h-10 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => refetch()}
                >
                  <RefreshCw size={14} className="mr-2" />
                  Refresh
                </Button> */}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {isError ? (
                <div className="p-5">
                  <Alert
                    type="error"
                    showIcon
                    message="Failed to load published APIs"
                    description="We couldn't load the published API inventory right now."
                  />
                </div>
              ) : (
                <Table
                  rowKey={(record) => record.id || record.api_id}
                  dataSource={filteredApis}
                  columns={columns}
                  loading={{
                    spinning: isLoading,
                    indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />,
                  }}
                  scroll={{ x: 1450 }}
                  pagination={{
                    pageSize: 25,
                    hideOnSinglePage: true,
                    className: "px-6 py-4 border-t border-slate-100 !mb-0 bg-white",
                  }}
                  onRow={(record) => ({
                    onClick: () => router.push(`/published-apis/${record.id || record.api_id}`),
                    className: "cursor-pointer",
                  })}
                  locale={{
                    emptyText: (
                      <div className="py-14">
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="No published APIs found"
                        />
                      </div>
                    ),
                  }}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
