"use client";

import React from "react";
import { message } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { RunDetailPanel, formatTimestamp } from "@/features/notebooks/components/RunDetailPanel";
import { notebookService } from "@/features/notebooks/services/notebook.service";

export default function NotebookSparkJobRunDetailPage() {
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
    queryKey: ["notebook-spark-job-run-detail", runId],
    queryFn: () => notebookService.getNotebookSparkJobRunById(runId, true),
    enabled: Boolean(runId),
  });

  const stopMutation = useMutation({
    mutationFn: () => notebookService.stopNotebookSparkJobRun(runId),
    onSuccess: async () => {
      await refetch();
      message.success("Spark job run stop requested.");
    },
    onError: () => {
      message.error("Failed to stop Spark job run.");
    },
  });

  const rerunMutation = useMutation({
    mutationFn: () => notebookService.rerunNotebookSparkJobRun(runId),
    onSuccess: async () => {
      await refetch();
      message.success("Spark job rerun triggered successfully.");
    },
    onError: () => {
      message.error("Failed to rerun Spark job.");
    },
  });

  const isRunning = String(run?.status || "").toLowerCase() === "running";

  return (
    <RunDetailPanel
      title="Spark Job Run Detail"
      subtitle="Inspect Spark job execution state, submission identifiers, arguments, and failure details."
      status={run?.status}
      isLoading={isLoading}
      isError={isError}
      onRefresh={() => {
        void refetch();
      }}
      actions={
        <>
          <Button
            variant="outline"
            className="h-9 border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
            onClick={() => router.push(`/notebooks/${notebookId}`)}
          >
            Back to Notebook
          </Button>
          {isRunning ? (
            <Button
              variant="outline"
              className="h-9 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
            >
              Stop Run
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => rerunMutation.mutate()}
              disabled={rerunMutation.isPending}
            >
              Rerun
            </Button>
          )}
        </>
      }
      detailItems={[
        {
          key: "run-id",
          label: "Run ID",
          value: <span className="font-mono text-xs">{run?.id || runId}</span>,
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
          key: "spark-submission",
          label: "Spark Submission ID",
          value: <span className="font-mono text-xs">{run?.spark_submission_id || "-"}</span>,
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
          key: "app-args",
          label: "App Args",
          value: run?.app_args,
        },
        {
          key: "spark-properties",
          label: "Spark Properties",
          value: run?.spark_properties,
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
