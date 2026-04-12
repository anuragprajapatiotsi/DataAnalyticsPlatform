"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Alert,
  Empty,
  Form,
  Input,
  Modal,
  Radio,
  Skeleton,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  Database,
  FileCode2,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Trash2,
  Copy,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { SqlResultViewer } from "@/features/sql-editor/components/SqlResultViewer";
import {
  SaveQueryModal,
  type SaveQueryFormValues,
} from "@/features/sql-editor/components/SaveQueryModal";
import {
  savedQueryService,
  type SavedQuery,
  type SavedQueryRunResponse,
} from "@/features/sql-editor/services/saved-query.service";
import { useSavedQueries } from "@/features/saved-queries/hooks/useSavedQueries";
import { datasetService } from "@/features/explore/services/dataset.service";
import type { QueryResultState } from "@/features/sql-editor/hooks/useSqlEditor";

function getExecutionErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      apiError.response?.data?.message ||
      apiError.message ||
      "Failed to run saved query."
    );
  }

  return "Failed to run saved query.";
}

function normalizeSavedQuerySql(query: SavedQuery | null) {
  if (!query) {
    return "";
  }

  return String(query.sql || query.query || "");
}

function createLoadingResult(query: SavedQuery): QueryResultState {
  return {
    id: `saved-query-run-${query.id}`,
    title: query.name || "Saved Query Result",
    query: normalizeSavedQuerySql(query),
    data: [],
    columns: [],
    totalRows: 0,
    executionTime: 0,
    loading: true,
    error: null,
    queryId: null,
    pagination: {
      pageSize: 50,
      current: 0,
    },
    status: "loading",
  };
}

function normalizeRunRows(
  response: SavedQueryRunResponse,
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

  return [];
}

function buildResultFromResponse(
  query: SavedQuery,
  response: SavedQueryRunResponse,
): QueryResultState {
  const columns = Array.isArray(response.columns) ? response.columns : [];
  const rows = normalizeRunRows(response, columns);

  return {
    id: `saved-query-run-${query.id}`,
    title: query.name || "Saved Query Result",
    query: normalizeSavedQuerySql(query),
    data: rows,
    columns,
    totalRows: rows.length,
    executionTime: Number(response.stats?.executionTimeMs || 0),
    loading: false,
    error: null,
    queryId: null,
    pagination: {
      pageSize: Number(response.limit || 50),
      current: Math.floor(Number(response.offset || 0) / Number(response.limit || 50 || 1)),
    },
    status: "success",
    totalCount:
      typeof response.total_count === "number"
        ? response.total_count
        : typeof response.stats?.processedRows === "number"
          ? response.stats.processedRows
          : rows.length,
  };
}

export default function SavedQueriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [selectedQueryId, setSelectedQueryId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false);
  const [editingQuery, setEditingQuery] = React.useState<SavedQuery | null>(null);
  const [runResult, setRunResult] = React.useState<QueryResultState | null>(null);
  const [publishForm] = Form.useForm<{ visibility: "public" | "private" }>();
  const [publishedApiInfo, setPublishedApiInfo] = React.useState<{
    api_id?: string;
    route_path?: string;
  } | null>(null);

  const breadcrumbItems = [{ label: "Saved Queries" }];

  const {
    data: savedQueries = [],
    isLoading,
    isError,
    refetch,
  } = useSavedQueries({
    search: search || undefined,
  });

  const selectedQuery = React.useMemo(
    () =>
      savedQueries.find((query) => query.id === selectedQueryId) ||
      savedQueries[0] ||
      null,
    [savedQueries, selectedQueryId],
  );

  React.useEffect(() => {
    if (!savedQueries.length) {
      setSelectedQueryId(null);
      return;
    }

    if (!selectedQueryId || !savedQueries.some((query) => query.id === selectedQueryId)) {
      setSelectedQueryId(savedQueries[0].id);
    }
  }, [savedQueries, selectedQueryId]);

  React.useEffect(() => {
    setRunResult(null);
    setPublishedApiInfo(null);
  }, [selectedQuery?.id]);

  const isOptionsQueryEnabled = isModalOpen;

  const { data: datasets = [], isLoading: isDatasetsLoading } = useQuery({
    queryKey: ["published-datasets", "saved-query-page"],
    queryFn: () =>
      datasetService.getDatasets({
        source_type: "published_api",
        skip: 0,
        limit: 100,
      }),
    enabled: isOptionsQueryEnabled,
    staleTime: 5 * 60 * 1000,
  });

  const invalidateSavedQueries = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["saved-queries"] });
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: async (values: SaveQueryFormValues) => {
      const payload = {
        dataset_id: values.dataset_id,
        name: values.name,
        description: values.description,
        sql: values.sql,
        catalog: "iceberg",
        extra_metadata: {},
      };

      if (editingQuery?.id) {
        return savedQueryService.updateSavedQuery(editingQuery.id, payload);
      }

      return savedQueryService.createSavedQuery(payload);
    },
    onSuccess: async (response) => {
      await invalidateSavedQueries();
      const nextId =
        (typeof response.id === "string" && response.id) ||
        (typeof response.saved_query_id === "string" && response.saved_query_id) ||
        editingQuery?.id ||
        null;

      if (nextId) {
        setSelectedQueryId(nextId);
      }

      setIsModalOpen(false);
      setEditingQuery(null);
      message.success(
        editingQuery ? "Saved query updated successfully." : "Saved query created successfully.",
      );
    },
    onError: (error: unknown) => {
      message.error(getExecutionErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savedQueryService.deleteSavedQuery(id),
    onSuccess: async (_, deletedId) => {
      await invalidateSavedQueries();
      if (selectedQueryId === deletedId) {
        setSelectedQueryId(null);
        setRunResult(null);
      }
      message.success("Saved query deleted successfully.");
    },
    onError: () => {
      message.error("Failed to delete saved query.");
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({
      id,
      visibility,
    }: {
      id: string;
      visibility: "public" | "private";
    }) => savedQueryService.publishSavedQuery(id, { visibility }),
    onSuccess: async (response) => {
      await invalidateSavedQueries();
      queryClient.setQueriesData<SavedQuery[] | undefined>(
        { queryKey: ["saved-queries"] },
        (previous) =>
          Array.isArray(previous)
            ? previous.map((query) =>
                query.id === selectedQuery?.id
                  ? {
                      ...query,
                      route_path:
                        typeof response.route_path === "string"
                          ? response.route_path
                          : query.route_path,
                      api_id:
                        typeof response.api_id === "string"
                          ? response.api_id
                          : query.api_id,
                    }
                  : query,
              )
            : previous,
      );
      setIsPublishModalOpen(false);
      setPublishedApiInfo({
        api_id: typeof response.api_id === "string" ? response.api_id : undefined,
        route_path: typeof response.route_path === "string" ? response.route_path : undefined,
      });
      message.success("Saved query published successfully.");
    },
    onError: () => {
      message.error("Failed to publish saved query.");
    },
  });

  const runMutation = useMutation({
    mutationFn: async (query: SavedQuery) => {
      setRunResult(createLoadingResult(query));
      const response = await savedQueryService.runSavedQuery(query.id);
      return { query, response };
    },
    onSuccess: ({ query, response }) => {
      setRunResult(buildResultFromResponse(query, response));
      message.success("Saved query executed successfully.");
    },
    onError: (error: unknown) => {
      setRunResult((previous) =>
        previous
          ? {
              ...previous,
              loading: false,
              status: "error",
              error: getExecutionErrorMessage(error),
            }
          : null,
      );
      message.error(getExecutionErrorMessage(error));
    },
  });

  const handleOpenCreate = () => {
    setEditingQuery(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedQuery) {
      return;
    }
    setEditingQuery(selectedQuery);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedQuery) {
      return;
    }

    Modal.confirm({
      title: "Delete saved query?",
      content: `This will permanently delete "${selectedQuery.name}".`,
      okText: "Delete",
      okType: "danger",
      centered: true,
      onOk: async () => {
        await deleteMutation.mutateAsync(selectedQuery.id);
      },
    });
  };

  const handlePublish = () => {
    if (!selectedQuery) {
      return;
    }

    publishForm.setFieldsValue({ visibility: "private" });
    setIsPublishModalOpen(true);
  };

  const handleRun = () => {
    if (!selectedQuery) {
      return;
    }

    runMutation.mutate(selectedQuery);
  };

  const initialValues = React.useMemo<Partial<SaveQueryFormValues>>(
    () => ({
      dataset_id: editingQuery?.dataset_id,
      name: editingQuery?.name || "",
      description: editingQuery?.description || "",
      sql: normalizeSavedQuerySql(editingQuery),
    }),
    [editingQuery],
  );

  const handleCopyPublishedPath = async (routePath?: string) => {
    const resolvedRoutePath = routePath || publishedApiInfo?.route_path || selectedQuery?.route_path;
    if (!resolvedRoutePath) {
      return;
    }

    try {
      await navigator.clipboard.writeText(resolvedRoutePath);
      message.success("API path copied.");
    } catch {
      message.error("Failed to copy API path.");
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
          <PageHeader
            title="Saved Queries"
            description="Browse reusable SQL, inspect the query text, and run saved workloads without reopening the editor."
            breadcrumbItems={breadcrumbItems}
          />
          <Button
            onClick={handleOpenCreate}
            className="h-9 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
          >
            <Plus size={16} className="mr-2" />
            New Saved Query
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="mx-auto grid h-full max-w-[1500px] grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Query Library</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Saved SQL snippets and reusable reports.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  className="h-9 w-9 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                >
                  <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                </Button>
              </div>
              <Input
                allowClear
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search saved queries"
                prefix={<Search size={14} className="text-slate-400" />}
                className="mt-4"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <Skeleton active paragraph={{ rows: 2 }} title={{ width: "65%" }} />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="p-5">
                  <Alert
                    type="error"
                    showIcon
                    message="Failed to load saved queries"
                    description="We couldn't load the saved query library right now."
                    action={
                      <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Retry
                      </Button>
                    }
                  />
                </div>
              ) : savedQueries.length === 0 ? (
                <div className="flex h-full items-center justify-center p-6">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No saved queries found"
                  />
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {savedQueries.map((query) => {
                    const isActive = selectedQuery?.id === query.id;

                    return (
                      <button
                        key={query.id}
                        type="button"
                        onClick={() => {
                          setSelectedQueryId(query.id);
                          setRunResult(null);
                        }}
                        className={[
                          "w-full rounded-xl border px-4 py-3 text-left transition-all",
                          isActive
                            ? "border-blue-200 bg-blue-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {query.name}
                            </div>
                            <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {query.description || "No description provided"}
                            </div>
                          </div>
                          <FileCode2 size={16} className="shrink-0 text-slate-400" />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">
                            {query.created_at
                              ? dayjs(query.created_at).format("MMM D, YYYY h:mm A")
                              : "Unknown date"}
                          </span>
                          {query.published_at && (
                            <Tag className="m-0 rounded-full border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">
                              Published
                            </Tag>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {!selectedQuery ? (
              <div className="flex h-full items-center justify-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Select a saved query to inspect details"
                />
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-lg font-semibold text-slate-900">
                          {selectedQuery.name}
                        </h2>
                        {selectedQuery.published_at && (
                          <Tag className="m-0 rounded-full border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">
                            Published
                          </Tag>
                        )}
                      </div>
                      <p className="mt-2 max-w-3xl text-sm text-slate-500">
                        {selectedQuery.description || "No description provided for this saved query."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={handleRun}
                        disabled={runMutation.isPending}
                        className="h-9 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                      >
                        {runMutation.isPending ? (
                          <Spin size="small" className="mr-2" />
                        ) : (
                          <Play size={14} className="mr-2" />
                        )}
                        Run Query
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleOpenEdit}
                        className="h-9 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
                      >
                        <Save size={14} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handlePublish}
                        disabled={publishMutation.isPending}
                        className="h-9 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
                      >
                        <Send size={14} className="mr-2" />
                        Publish
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="h-9 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 overflow-y-auto p-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
                  <div className="min-w-0 space-y-6">
                    {publishedApiInfo?.route_path ? (
                      <Alert
                        type="success"
                        showIcon
                        title="API Published Successfully"
                        description={
                          <div className="space-y-3">
                            <div>
                              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                API Path
                              </div>
                              <code className="block rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                                {publishedApiInfo.route_path}
                              </code>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => void handleCopyPublishedPath(publishedApiInfo.route_path)}
                              >
                                <Copy size={13} className="mr-2" />
                                Copy Path
                              </Button>
                            </div>
                          </div>
                        }
                      />
                    ) : null}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-4 py-3">
                        <div className="text-sm font-medium text-slate-700">SQL</div>
                        <Tooltip title="Saved query text">
                          <FileCode2 size={16} className="text-blue-600" />
                        </Tooltip>
                      </div>
                      <pre className="overflow-x-auto px-4 py-4 text-sm leading-6 text-slate-800">
                        <code>{normalizeSavedQuerySql(selectedQuery) || "-- No SQL available"}</code>
                      </pre>
                    </div>

                    <div className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          <Database size={15} className="text-blue-600" />
                          Query Results
                        </div>
                      </div>

                      {runResult ? (
                        <div className="flex min-h-0 flex-1 flex-col">
                          <SqlResultViewer
                            result={runResult}
                            catalog={selectedQuery.catalog}
                            schema={selectedQuery.schema}
                            onDismissError={() => setRunResult(null)}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-1 items-center justify-center bg-slate-50/50">
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Run this saved query to view results"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Metadata
                      </div>
                      <div className="mt-4 space-y-3 text-sm">
                        <div>
                          <div className="text-xs text-slate-400">Dataset ID</div>
                          <div className="mt-1 break-all font-medium text-slate-900">
                            {selectedQuery.dataset_id || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Catalog</div>
                          <div className="mt-1 font-medium text-slate-900">
                            {selectedQuery.catalog || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Schema</div>
                          <div className="mt-1 font-medium text-slate-900">
                            {selectedQuery.schema || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">API Route</div>
                          <div className="mt-1">
                            {selectedQuery.route_path ? (
                              <div className="flex items-center gap-2">
                                <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                                  {selectedQuery.route_path}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => void handleCopyPublishedPath(selectedQuery.route_path)}
                                >
                                  <Copy size={13} />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Created</div>
                          <div className="mt-1 font-medium text-slate-900">
                            {selectedQuery.created_at
                              ? dayjs(selectedQuery.created_at).format("MMM D, YYYY h:mm A")
                              : "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Updated</div>
                          <div className="mt-1 font-medium text-slate-900">
                            {selectedQuery.updated_at
                              ? dayjs(selectedQuery.updated_at).format("MMM D, YYYY h:mm A")
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Extra Details
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <div>
                          <div className="text-xs text-slate-400">Owners</div>
                          <div className="mt-1">
                            {Array.isArray(selectedQuery.owner_ids) &&
                            selectedQuery.owner_ids.length > 0
                              ? selectedQuery.owner_ids.join(", ")
                              : "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Tags</div>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Array.isArray(selectedQuery.tags) && selectedQuery.tags.length > 0 ? (
                              selectedQuery.tags.map((tag) => (
                                <Tag key={tag} className="m-0 rounded-full">
                                  {tag}
                                </Tag>
                              ))
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <SaveQueryModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuery(null);
        }}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
        isSubmitting={saveMutation.isPending}
        datasets={datasets}
        isDatasetsLoading={isDatasetsLoading}
        initialValues={initialValues}
        title={editingQuery ? "Update Saved Query" : "Create Saved Query"}
        submitLabel={editingQuery ? "Update Query" : "Save Query"}
        showSqlField={Boolean(editingQuery)}
      />

      <Modal
        title="Publish Saved Query"
        open={isPublishModalOpen}
        onCancel={() => setIsPublishModalOpen(false)}
        onOk={() => publishForm.submit()}
        okText="Publish"
        confirmLoading={publishMutation.isPending}
        centered
      >
        <Form
          form={publishForm}
          layout="vertical"
          initialValues={{ visibility: "private" }}
          onFinish={async (values) => {
            if (!selectedQuery) {
              return;
            }

            await publishMutation.mutateAsync({
              id: selectedQuery.id,
              visibility: values.visibility,
            });
          }}
          className="mt-4"
        >
          <Form.Item
            name="visibility"
            label="Visibility"
            rules={[{ required: true, message: "Please choose a visibility." }]}
          >
            <Radio.Group className="flex flex-col gap-3">
              <Radio value="private">
                <div className="inline-flex flex-col">
                  <span className="font-medium text-slate-900">Private</span>
                  <span className="text-xs text-slate-500">
                    Keep this saved query visible only to allowed internal users.
                  </span>
                </div>
              </Radio>
              <Radio value="public">
                <div className="inline-flex flex-col">
                  <span className="font-medium text-slate-900">Public</span>
                  <span className="text-xs text-slate-500">
                    Publish this saved query for broader discovery and reuse.
                  </span>
                </div>
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
