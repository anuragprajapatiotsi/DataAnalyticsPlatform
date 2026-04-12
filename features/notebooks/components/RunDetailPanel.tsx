"use client";

import React from "react";
import dayjs from "dayjs";
import { Alert, Descriptions, Empty, Spin, Tag } from "antd";
import { RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type DetailItem = {
  key: string;
  label: string;
  value: React.ReactNode;
};

type PayloadBlock = {
  key: string;
  label: string;
  value: unknown;
  tone?: "default" | "error";
};

function getStatusTagClass(status?: string) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "success" || normalizedStatus === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "failed" || normalizedStatus === "error" || normalizedStatus === "cancelled") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function formatTimestamp(value?: string | null) {
  return value ? dayjs(value).format("MMM D, YYYY h:mm:ss A") : "-";
}

function stringifyPayload(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

type RunDetailPanelProps = {
  title: string;
  subtitle: string;
  status?: string;
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  detailItems: DetailItem[];
  payloads?: PayloadBlock[];
  actions?: React.ReactNode;
};

export function RunDetailPanel({
  title,
  subtitle,
  status,
  isLoading,
  isError,
  onRefresh,
  detailItems,
  payloads = [],
  actions,
}: RunDetailPanelProps) {
  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              <Tag className={`m-0 rounded-full text-[11px] ${getStatusTagClass(status)}`}>
                {status || "pending"}
              </Tag>
            </div>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            <Button
              variant="outline"
              className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={onRefresh}
            >
              <RefreshCw size={14} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
          {isError ? (
            <Alert
              type="error"
              showIcon
              title="Failed to load run detail"
              description="We couldn't load the latest run detail right now."
            />
          ) : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {isLoading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
              </div>
            ) : detailItems.length ? (
              <Descriptions
                column={1}
                size="small"
                styles={{
                  label: { width: "28%", color: "#64748b" },
                  content: { color: "#0f172a" },
                }}
                items={detailItems.map((item) => ({
                  key: item.key,
                  label: item.label,
                  children: item.value,
                }))}
              />
            ) : (
              <div className="flex min-h-[180px] items-center justify-center">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No run detail found" />
              </div>
            )}
          </section>

          {payloads.map((payload) => (
            <section
              key={payload.key}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 text-base font-semibold text-slate-900">{payload.label}</div>
              <pre
                className={[
                  "overflow-x-auto rounded-xl p-4 text-xs",
                  payload.tone === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-50 text-slate-700",
                ].join(" ")}
              >
                {stringifyPayload(payload.value)}
              </pre>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export { formatTimestamp };
