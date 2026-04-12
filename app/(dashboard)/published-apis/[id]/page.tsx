"use client";

import React from "react";
import dayjs from "dayjs";
import { Alert, Descriptions, Empty, Spin, Tag, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Globe, Play, Power, RefreshCw } from "lucide-react";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { SqlResultViewer } from "@/features/sql-editor/components/SqlResultViewer";
import {
  publishedApiService,
  type PublishedApiExecutionResponse,
} from "@/features/published-apis/services/published-api.service";
import type { QueryResultState } from "@/features/sql-editor/hooks/useSqlEditor";

function getResponseColumns(response: PublishedApiExecutionResponse): string[] {
  if (Array.isArray(response.columns) && response.columns.length > 0) {
    return response.columns;
  }

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    !("rows" in response) &&
    !("data" in response) &&
    !("stats" in response) &&
    !("total_count" in response) &&
    !("returned" in response) &&
    !("limit" in response) &&
    !("offset" in response)
  ) {
    return Object.keys(response as Record<string, unknown>);
  }

  if (
    Array.isArray(response.rows) &&
    response.rows.length > 0 &&
    !Array.isArray(response.rows[0]) &&
    response.rows[0] &&
    typeof response.rows[0] === "object"
  ) {
    return Object.keys(response.rows[0] as Record<string, unknown>);
  }

  if (
    Array.isArray(response.data) &&
    response.data.length > 0 &&
    !Array.isArray(response.data[0]) &&
    response.data[0] &&
    typeof response.data[0] === "object"
  ) {
    return Object.keys(response.data[0] as Record<string, unknown>);
  }

  return [];
}

function normalizeRunRows(
  response: PublishedApiExecutionResponse,
  columns: string[],
): unknown[][] {
  if (Array.isArray(response.rows) && response.rows.every(Array.isArray)) {
    return response.rows as unknown[][];
  }

  if (Array.isArray(response.data) && response.data.every(Array.isArray)) {
    return response.data as unknown[][];
  }

  if (Array.isArray(response.rows)) {
    return (response.rows as Record<string, unknown>[]).map((row) =>
      columns.map((column) => row?.[column] ?? null),
    );
  }

  if (Array.isArray(response.data)) {
    return (response.data as Record<string, unknown>[]).map((row) =>
      columns.map((column) => row?.[column] ?? null),
    );
  }

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    !("rows" in response) &&
    !("data" in response) &&
    columns.length > 0
  ) {
    const record = response as Record<string, unknown>;
    return [columns.map((column) => record[column] ?? null)];
  }

  return [];
}

export default function PublishedApiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [runResult, setRunResult] = React.useState<QueryResultState | null>(
    null,
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["published-api-detail", id],
    queryFn: () => publishedApiService.getPublishedApiById(id),
    enabled: Boolean(id),
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      if (!data) {
        throw new Error("Published API not found.");
      }

      setRunResult({
        id: `published-api-run-${data.api_id}`,
        title: data.route_path || data.api_id,
        query: data.route_path || data.api_id,
        data: [],
        columns: [],
        totalRows: 0,
        executionTime: 0,
        loading: true,
        error: null,
        queryId: null,
        pagination: { pageSize: 100, current: 0 },
        status: "loading",
      });

      return publishedApiService.executePublishedApi(data.api_id, {
        limit: 100,
      });
    },
    onSuccess: (response) => {
      if (!data) {
        return;
      }

      const columns = getResponseColumns(response);
      const rows = normalizeRunRows(response, columns);
      setRunResult({
        id: `published-api-run-${data.api_id}`,
        title: data.route_path || data.api_id,
        query: data.route_path || data.api_id,
        data: rows,
        columns,
        totalRows: rows.length,
        executionTime: Number(response.stats?.executionTimeMs || 0),
        loading: false,
        error: null,
        queryId: null,
        pagination: {
          pageSize: Number(response.limit || 100),
          current: Math.floor(
            Number(response.offset || 0) / Number(response.limit || 100 || 1),
          ),
        },
        status: "success",
        totalCount:
          typeof response.total_count === "number"
            ? response.total_count
            : typeof response.stats?.processedRows === "number"
              ? response.stats.processedRows
              : rows.length,
      });
      message.success("Published API executed successfully.");
    },
    onError: () => {
      setRunResult((previous) =>
        previous
          ? {
              ...previous,
              loading: false,
              status: "error",
              error: "Failed to execute published API.",
            }
          : null,
      );
      message.error("Failed to execute published API.");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      if (!data) {
        throw new Error("Published API not found.");
      }

      return publishedApiService.deactivatePublishedApi(data.id || data.api_id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["published-apis"] });
      await queryClient.invalidateQueries({
        queryKey: ["published-api-detail", id],
      });
      message.success("Published API deactivated successfully.");
    },
    onError: () => {
      message.error("Failed to deactivate published API.");
    },
  });

  const handleCopy = async () => {
    if (!data?.route_path) {
      return;
    }

    try {
      await navigator.clipboard.writeText(data.route_path);
      message.success("API path copied.");
    } catch {
      message.error("Failed to copy API path.");
    }
  };

  const breadcrumbItems = [
    { label: "Published APIs", href: "/published-apis" },
    { label: data?.api_id || "Details" },
  ];

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
          <PageHeader
            title={data?.route_path || "Published API"}
            description="Inspect route metadata, execute the API, and manage its lifecycle."
            breadcrumbItems={breadcrumbItems}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-9 border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
              onClick={() => router.push("/published-apis")}
            >
              <ArrowLeft size={14} className="mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => refetch()}
            >
              <RefreshCw
                size={14}
                className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spin
                  indicator={
                    <RefreshCw
                      className="animate-spin text-blue-600"
                      size={24}
                    />
                  }
                />
              </div>
            ) : isError || !data ? (
              <Alert
                type="error"
                showIcon
                title="Failed to load published API"
                description="We couldn't load this published API right now."
              />
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-blue-600" />
                      <h2 className="text-lg font-semibold text-slate-900">
                        {data.route_path || data.api_id}
                      </h2>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Tag className="m-0 rounded-full border-blue-200 bg-blue-50 text-blue-700">
                        {data.visibility || "private"}
                      </Tag>
                      <Tag
                        className={[
                          "m-0 rounded-full",
                          data.is_active === false
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700",
                        ].join(" ")}
                      >
                        {data.is_active === false ? "Inactive" : "Active"}
                      </Tag>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pb-2">
                    <Button
                      className="h-9 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                      onClick={handleCopy}
                    >
                      <Copy size={14} className="mr-2" />
                      Copy Path
                    </Button>
                    <Button
                      className="h-9 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                      onClick={() => runMutation.mutate()}
                      disabled={runMutation.isPending || !data.is_active}
                    >
                      <Play size={14} className="mr-2" />
                      Run API
                    </Button>
                    <Button
                      variant="outline"
                      disabled={
                        data.is_active === false || deactivateMutation.isPending
                      }
                      className="h-9 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => deactivateMutation.mutate()}
                    >
                      <Power size={14} className="mr-2" />
                      Deactivate
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 text-sm font-semibold text-slate-900">
                    API Details
                  </div>
                  <Descriptions
                    column={1}
                    size="small"
                    styles={{ label: { width: "38%", color: "#64748b" } }}
                  >
                    <Descriptions.Item label="API ID">
                      {data.api_id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dataset ID">
                      {data.dataset_id || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Resource Type">
                      {data.resource_type || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Route Path">
                      <div className="break-all text-slate-900">{data.route_path || "-"}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">
                      {data.created_at
                        ? dayjs(data.created_at).format("MMM D, YYYY h:mm A")
                        : "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated">
                      {data.updated_at
                        ? dayjs(data.updated_at).format("MMM D, YYYY h:mm A")
                        : "-"}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </>
            )}
          </section>

          <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <Globe size={15} className="text-blue-600" />
                API Result
              </div>
            </div>

            {runResult ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <SqlResultViewer
                  result={runResult}
                  onDismissError={() => setRunResult(null)}
                />
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center bg-slate-50/50">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Run this published API to view response data"
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
