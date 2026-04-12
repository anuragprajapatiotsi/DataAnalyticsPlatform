"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Alert,
  Empty,
  Modal,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  ExternalLink,
} from "lucide-react";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { CreateNotebookModal } from "@/features/notebooks/components/CreateNotebookModal";
import { UploadNotebookModal } from "@/features/notebooks/components/UploadNotebookModal";
import { useNotebooks } from "@/features/notebooks/hooks/useNotebooks";
import { notebookService } from "@/features/notebooks/services/notebook.service";
import type { CreateNotebookRequest, Notebook } from "@/features/notebooks/types";
import { useNotificationFeed } from "@/features/notifications/hooks/useNotificationFeed";
import type { NotificationNotebookRunItem } from "@/features/notifications/types";

function renderModeTag(notebook: Notebook) {
  const executionMode = notebook.execution_mode || "single_profile";
  const defaultProfile = notebook.default_execution_profile || "python";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag
        className={[
          "m-0 rounded-full text-[11px]",
          executionMode === "mixed_profile"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-blue-200 bg-blue-50 text-blue-700",
        ].join(" ")}
      >
        {executionMode === "mixed_profile" ? "Mixed Profile" : "Single Profile"}
      </Tag>
      <Tag className="m-0 rounded-full border-slate-200 bg-slate-50 text-[11px] text-slate-700">
        {defaultProfile}
      </Tag>
    </div>
  );
}

function getActivityBadgeClass(status?: string) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "success" || normalizedStatus === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "failed" || normalizedStatus === "error") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function getActivityLabel(item: NotificationNotebookRunItem) {
  if (item.schedule_id) {
    return item.schedule_name || "Schedule Run";
  }

  if (item.spark_job_id) {
    return item.spark_job_name || "Spark Job Run";
  }

  return item.notebook_name || "Notebook Run";
}

export default function NotebooksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

  const breadcrumbItems = [{ label: "Notebook" }];

  const {
    data: notebooks = [],
    isLoading,
    isError,
    refetch,
  } = useNotebooks();
  const { data: notificationFeed } = useNotificationFeed(50);

  const notebookActivity = React.useMemo(() => {
    const notebooksFeed = notificationFeed?.notebooks;
    if (!notebooksFeed) {
      return [];
    }

    return [
      ...(notebooksFeed.notebook_runs || []),
      ...(notebooksFeed.spark_job_runs || []),
      ...(notebooksFeed.schedule_runs || []),
    ]
      .sort((first, second) =>
        dayjs(second.updated_at || second.created_at).valueOf() -
        dayjs(first.updated_at || first.created_at).valueOf(),
      )
      .slice(0, 10);
  }, [notificationFeed]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateNotebookRequest) => notebookService.createNotebook(payload),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      message.success("Notebook created successfully.");
      setIsCreateOpen(false);
      if (response.id) {
        router.push(`/notebooks/${response.id}`);
      }
    },
    onError: () => {
      message.error("Failed to create notebook.");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => notebookService.uploadNotebook(file),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      message.success("Notebook uploaded successfully.");
      setIsUploadOpen(false);
      if (response.id) {
        router.push(`/notebooks/${response.id}`);
      }
    },
    onError: () => {
      message.error("Failed to upload notebook.");
    },
  });

  const runMutation = useMutation({
    mutationFn: (notebookId: string) => notebookService.runNotebook(notebookId),
    onSuccess: () => {
      message.success("Notebook run triggered successfully.");
    },
    onError: () => {
      message.error("Failed to trigger notebook run.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (notebookId: string) => notebookService.deleteNotebook(notebookId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      message.success("Notebook deleted successfully.");
    },
    onError: (error: unknown) => {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
          ? (error as { message?: string }).message
          : "Failed to delete notebook.";
      message.error(errorMessage);
    },
  });

  const columns: ColumnsType<Notebook> = [
    {
      title: "Notebook",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (value: string, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <BookOpen size={16} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {value}
            </div>
            <div className="mt-1 truncate text-[11px] text-slate-400">
              {record.path || "Notebook path not available yet"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "28%",
      render: (value?: string) => (
        <span className="line-clamp-2 text-sm text-slate-500">
          {value || "No description provided."}
        </span>
      ),
    },
    {
      title: "Execution",
      key: "execution",
      width: "20%",
      render: (_, record) => renderModeTag(record),
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      render: (value?: string) => {
        const formattedValue = value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-";

        return (
          <Tooltip title={value || formattedValue}>
            <span className="block truncate text-sm text-slate-500">
              {formattedValue}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      align: "right",
      fixed: "right",
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (_, record) => (
        <div
          className="flex flex-nowrap items-center justify-end gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Tooltip title="Open Notebook">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => router.push(`/notebooks/${record.id}`)}
            >
              <ExternalLink size={13} className="mr-1" />
              Open
            </Button>
          </Tooltip>
          <Tooltip title="Run Notebook">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => runMutation.mutate(record.id)}
            >
              <Play size={13} className="mr-1" />
              Run
            </Button>
          </Tooltip>
          <Tooltip title="Delete Notebook">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                Modal.confirm({
                  title: "Delete notebook?",
                  content: `This will remove "${record.name}" if there are no active runs.`,
                  okText: "Delete",
                  okType: "danger",
                  centered: true,
                  onOk: async () => {
                    await deleteMutation.mutateAsync(record.id);
                  },
                });
              }}
            >
              <Trash2 size={13} className="mr-1" />
              Delete
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
          <PageHeader
            title="Notebook"
            description="Create, upload, open, run, and manage notebooks with explicit execution mode support."
            breadcrumbItems={breadcrumbItems}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => refetch()}
            >
              <RefreshCw size={14} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => setIsUploadOpen(true)}
            >
              <UploadCloud size={14} className="mr-2" />
              Upload Notebook
            </Button>
            <Button
              className="h-9 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={14} className="mr-2" />
              New Notebook
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              {isError ? (
                <div className="p-6">
                  <Alert
                    type="error"
                    showIcon
                    title="Failed to load notebooks"
                    description="We couldn't load the notebook inventory right now."
                  />
                </div>
              ) : (
                <Table
                  rowKey="id"
                  dataSource={notebooks}
                  columns={columns}
                  tableLayout="fixed"
                  scroll={{ x: 1080 }}
                  loading={{
                    spinning: isLoading,
                    indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />,
                  }}
                  pagination={{
                    pageSize: 20,
                    hideOnSinglePage: true,
                    className: "px-6 py-4 border-t border-slate-100 !mb-0 bg-white",
                  }}
                  onRow={(record) => ({
                    onClick: () => router.push(`/notebooks/${record.id}`),
                    className: "cursor-pointer",
                  })}
                  locale={{
                    emptyText: (
                      <div className="py-16">
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="No notebooks found yet"
                        />
                      </div>
                    ),
                  }}
                />
              )}
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">Notebook Activity</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Live notebook, Spark job, and schedule events from the notifications feed.
                  </div>
                </div>
              </div>

              {notebookActivity.length ? (
                <div className="space-y-3">
                  {notebookActivity.map((item) => (
                    <div
                      key={`${item.category}-${item.id}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {getActivityLabel(item)}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.message || item.error_message || item.category}
                          </div>
                        </div>
                        <Tag className={`m-0 rounded-full text-[11px] ${getActivityBadgeClass(item.status)}`}>
                          {item.status || "pending"}
                        </Tag>
                      </div>
                      <div className="mt-3 text-xs text-slate-400">
                        {dayjs(item.updated_at || item.created_at).format("MMM D, YYYY h:mm A")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[280px] items-center justify-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No notebook activity yet"
                  />
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <CreateNotebookModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
        isSubmitting={createMutation.isPending}
      />

      <UploadNotebookModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={async (file) => {
          await uploadMutation.mutateAsync(file);
        }}
        isSubmitting={uploadMutation.isPending}
      />
    </div>
  );
}
