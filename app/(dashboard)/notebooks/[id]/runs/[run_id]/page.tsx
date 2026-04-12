"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { RunDetailPanel, formatTimestamp } from "@/features/notebooks/components/RunDetailPanel";
import { notebookService } from "@/features/notebooks/services/notebook.service";

export default function NotebookRunDetailPage() {
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
    queryKey: ["notebook-run-detail", notebookId, runId],
    queryFn: () => notebookService.getNotebookRunById(notebookId, runId, true),
    enabled: Boolean(notebookId && runId),
  });

  return (
    <RunDetailPanel
      title="Notebook Run Detail"
      subtitle="Inspect the latest notebook run state with refresh-aware status tracking."
      status={run?.status}
      isLoading={isLoading}
      isError={isError}
      onRefresh={() => {
        void refetch();
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
          key: "error",
          label: "Error Message",
          value: run?.error_message,
          tone: run?.error_message ? "error" : "default",
        },
      ]}
    />
  );
}
