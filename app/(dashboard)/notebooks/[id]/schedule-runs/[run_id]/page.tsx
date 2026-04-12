"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { RunDetailPanel, formatTimestamp } from "@/features/notebooks/components/RunDetailPanel";
import { notebookService } from "@/features/notebooks/services/notebook.service";

export default function NotebookScheduleRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notebookId = params.id as string;
  const runId = params.run_id as string;

  const {
    data: run,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notebook-schedule-run-detail", runId],
    queryFn: () => notebookService.getNotebookScheduleRunById(runId, true),
    enabled: Boolean(runId),
  });

  const scheduleDetailQuery = useQuery({
    queryKey: ["notebook-schedule-detail", run?.schedule_id],
    queryFn: () => notebookService.getNotebookScheduleById(run?.schedule_id as string),
    enabled: Boolean(run?.schedule_id),
  });

  return (
    <RunDetailPanel
      title="Schedule Run Detail"
      subtitle="Inspect schedule execution state, linked identifiers, and any orchestration errors."
      status={run?.status}
      isLoading={isLoading || scheduleDetailQuery.isLoading}
      isError={isError || scheduleDetailQuery.isError}
      onRefresh={() => {
        void refetch();
        void scheduleDetailQuery.refetch();
      }}
      actions={
        <Button
          variant="outline"
          className="h-9 border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
          onClick={() => router.push(`/notebooks/${notebookId}`)}
        >
          Back to Notebook
        </Button>
      }
      detailItems={[
        {
          key: "run-id",
          label: "Run ID",
          value: <span className="font-mono text-xs">{run?.id || runId}</span>,
        },
        {
          key: "schedule-id",
          label: "Schedule ID",
          value: <span className="font-mono text-xs">{run?.schedule_id || "-"}</span>,
        },
        {
          key: "schedule-name",
          label: "Schedule Name",
          value: scheduleDetailQuery.data?.name || "-",
        },
        {
          key: "spark-job-id",
          label: "Spark Job ID",
          value: <span className="font-mono text-xs">{run?.spark_job_id || "-"}</span>,
        },
        {
          key: "notebook-id",
          label: "Notebook ID",
          value: <span className="font-mono text-xs">{run?.notebook_id || notebookId}</span>,
        },
        {
          key: "cron",
          label: "Cron Expression",
          value: scheduleDetailQuery.data?.cron_expr || "-",
        },
        {
          key: "started",
          label: "Started At",
          value: formatTimestamp(run?.started_at),
        },
        {
          key: "completed",
          label: "Completed At",
          value: formatTimestamp(run?.completed_at),
        },
        {
          key: "created",
          label: "Created At",
          value: formatTimestamp(run?.created_at),
        },
        {
          key: "updated",
          label: "Updated At",
          value: formatTimestamp(run?.updated_at),
        },
      ]}
      payloads={[
        {
          key: "default-conf",
          label: "Schedule Default Conf",
          value: scheduleDetailQuery.data?.default_conf,
        },
        {
          key: "error",
          label: "Error Message",
          value: run?.error_message,
          tone: run?.error_message ? "error" : "default",
        },
      ]}
    />
  );
}
