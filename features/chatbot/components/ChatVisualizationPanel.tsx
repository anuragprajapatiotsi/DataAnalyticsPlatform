"use client";

import React from "react";
import { BarChart3, LineChart, PieChart, Sparkles } from "lucide-react";
import { Empty, Tag, Tooltip } from "antd";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
import type {
  ChatResultPreview,
  ChatVisualizationConfig,
} from "@/features/chatbot/types";

function getChartTitle(visualization?: ChatVisualizationConfig | null) {
  if (!visualization) {
    return "Suggested Visualization";
  }

  return visualization.title || `${String(visualization.type || "chart").toUpperCase()} chart`;
}

type ChartRow = Record<string, unknown>;

function normalizePreviewRows(preview?: ChatResultPreview | null): ChartRow[] {
  if (!preview) {
    return [];
  }

  if (Array.isArray(preview.row_objects) && preview.row_objects.length) {
    return preview.row_objects.filter(
      (row): row is ChartRow => Boolean(row) && typeof row === "object",
    );
  }

  if (Array.isArray(preview.rows) && Array.isArray(preview.columns)) {
    return preview.rows.map((row) => {
      const nextRow: ChartRow = {};
      preview.columns.forEach((column, index) => {
        nextRow[column] = row[index];
      });
      return nextRow;
    });
  }

  return [];
}

function getMetricValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function getLabelValue(value: unknown) {
  if (value === null || value === undefined) {
    return "Unknown";
  }

  return String(value);
}

function buildChartData(
  preview: ChatResultPreview | null | undefined,
  visualization: ChatVisualizationConfig | null | undefined,
) {
  const rows = normalizePreviewRows(preview);
  if (!rows.length || !visualization) {
    return [];
  }

  const xKey = visualization.x || visualization.columns?.[0];
  const valueKeys = [
    visualization.y,
    ...(Array.isArray(visualization.series) ? visualization.series : []),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  if (!xKey || !valueKeys.length) {
    return [];
  }

  return rows
    .slice(0, 8)
    .map((row) => {
      const label = getLabelValue(row[xKey]);
      const metrics = valueKeys
        .map((key) => ({
          key,
          value: getMetricValue(row[key]),
        }))
        .filter((item): item is { key: string; value: number } => item.value !== null);

      if (!metrics.length) {
        return null;
      }

      return {
        label,
        metrics,
      };
    })
    .filter(
      (item): item is { label: string; metrics: { key: string; value: number }[] } =>
        Boolean(item),
    );
}

function formatMetricValue(value: number) {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function renderBarChart(
  chartData: { label: string; metrics: { key: string; value: number }[] }[],
) {
  const maxValue = Math.max(
    ...chartData.flatMap((item) => item.metrics.map((metric) => metric.value)),
    1,
  );

  return (
    <div className="space-y-3">
      {chartData.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <span className="truncate font-medium text-slate-700">{item.label}</span>
            <span className="shrink-0 text-slate-400">
              {item.metrics.map((metric) => formatMetricValue(metric.value)).join(" • ")}
            </span>
          </div>
          <div className="space-y-2">
            {item.metrics.map((metric, index) => (
              <div key={`${item.label}-${metric.key}`} className="flex items-center gap-2">
                <div className="w-20 shrink-0 truncate text-[11px] text-slate-500">
                  {metric.key}
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      index % 2 === 0 ? "bg-blue-500" : "bg-emerald-500",
                    )}
                    style={{ width: `${Math.max((metric.value / maxValue) * 100, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderLineChart(
  chartData: { label: string; metrics: { key: string; value: number }[] }[],
) {
  const primarySeries = chartData
    .map((item) => item.metrics[0]?.value ?? null)
    .filter((value): value is number => value !== null);

  if (!primarySeries.length) {
    return null;
  }

  const maxValue = Math.max(...primarySeries);
  const minValue = Math.min(...primarySeries);
  const width = 320;
  const height = 160;

  const points = primarySeries.map((value, index) => {
    const x = (index / Math.max(primarySeries.length - 1, 1)) * width;
    const y =
      maxValue === minValue
        ? height / 2
        : height - ((value - minValue) / (maxValue - minValue)) * (height - 24) - 12;

    return `${x},${y}`;
  });

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points.join(" ")}
          />
          {points.map((point, index) => {
            const [cx, cy] = point.split(",");
            return (
              <circle
                key={`${point}-${index}`}
                cx={cx}
                cy={cy}
                r="4"
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {chartData.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
          >
            <span className="font-semibold text-slate-900">{item.label}:</span>{" "}
            {formatMetricValue(item.metrics[0]?.value ?? 0)}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderPieChart(
  chartData: { label: string; metrics: { key: string; value: number }[] }[],
) {
  const values = chartData.map((item) => item.metrics[0]?.value ?? 0);
  const total = values.reduce((sum, value) => sum + value, 0);

  if (!total) {
    return null;
  }

  const colors = ["#2563eb", "#0f766e", "#f59e0b", "#7c3aed", "#ef4444", "#06b6d4"];
  let cumulative = 0;

  const slices = chartData.map((item, index) => {
    const value = item.metrics[0]?.value ?? 0;
    const start = cumulative / total;
    cumulative += value;
    const end = cumulative / total;

    const largeArcFlag = end - start > 0.5 ? 1 : 0;
    const startAngle = start * Math.PI * 2 - Math.PI / 2;
    const endAngle = end * Math.PI * 2 - Math.PI / 2;
    const radius = 70;
    const center = 90;
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    return {
      path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: colors[index % colors.length],
      label: item.label,
      value,
    };
  });

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
        <svg viewBox="0 0 180 180" className="h-44 w-44">
          {slices.map((slice) => (
            <path key={slice.label} d={slice.path} fill={slice.color} />
          ))}
          <circle cx="90" cy="90" r="34" fill="#ffffff" />
        </svg>
      </div>
      <div className="flex-1 space-y-2">
        {slices.map((slice) => (
          <div
            key={slice.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate font-medium text-slate-700">{slice.label}</span>
            </div>
            <span className="shrink-0 text-slate-500">
              {formatMetricValue(slice.value)} ({Math.round((slice.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatVisualizationPanel({
  visualization,
  chartOptions,
  chartPrompt,
  resultPreview,
  selectedChartType,
  onSelectChartType,
  isSaving,
  embedded = false,
}: {
  visualization?: ChatVisualizationConfig | null;
  chartOptions?: ChatVisualizationConfig[];
  chartPrompt?: string | null;
  resultPreview?: ChatResultPreview | null;
  selectedChartType?: string | null;
  onSelectChartType?: (type: string) => void;
  isSaving?: boolean;
  embedded?: boolean;
}) {
  const options = Array.isArray(chartOptions) ? chartOptions : [];
  const activeChartType =
    selectedChartType || visualization?.type || options[0]?.type || null;
  const currentVisualization =
    options.find((option) => option.type === activeChartType) || visualization || null;
  const chartData = React.useMemo(
    () => buildChartData(resultPreview, currentVisualization),
    [currentVisualization, resultPreview],
  );

  if (!currentVisualization && !options.length) {
    const emptyState = (
      <div className="p-6">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No chart suggestion returned yet"
        />
      </div>
    );

    if (embedded) {
      return emptyState;
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="text-base font-semibold text-slate-900">Visualization</div>
          <div className="mt-1 text-sm text-slate-500">
            Chart suggestions from the AI assistant will appear here when available.
          </div>
        </div>
        {emptyState}
      </div>
    );
  }

  const content = (
    <div className="space-y-4 p-4 sm:p-5">
      {embedded ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">Visualization</div>
            <div className="mt-1 break-words text-sm text-slate-500">
              {chartPrompt || "Review the suggested chart structure returned by the assistant."}
            </div>
          </div>
          {currentVisualization?.type ? (
            <Tag className="m-0 w-fit max-w-full rounded-full border-blue-200 bg-blue-50 text-[11px] text-blue-700">
              {currentVisualization.type}
            </Tag>
          ) : null}
        </div>
      ) : null}

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {String(currentVisualization?.type || "").toLowerCase() === "line" ? (
              <LineChart size={18} />
            ) : String(currentVisualization?.type || "").toLowerCase() === "pie" ? (
              <PieChart size={18} />
            ) : (
              <BarChart3 size={18} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="break-words text-sm font-semibold text-slate-900">
              {getChartTitle(currentVisualization)}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="break-words rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">X Axis:</span>{" "}
                {currentVisualization?.x_label || currentVisualization?.x || "-"}
              </div>
              <div className="break-words rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Y Axis:</span>{" "}
                {currentVisualization?.y_label || currentVisualization?.y || "-"}
              </div>
              <div className="break-words rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Series:</span>{" "}
                {Array.isArray(currentVisualization?.series) && currentVisualization?.series.length
                  ? currentVisualization.series.join(", ")
                  : currentVisualization?.series_label || "-"}
              </div>
              <div className="break-words rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Type:</span>{" "}
                {currentVisualization?.type || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 text-sm font-semibold text-slate-900">Chart Preview</div>
        {chartData.length ? (
          String(currentVisualization?.type || "").toLowerCase() === "line" ? (
            renderLineChart(chartData)
          ) : String(currentVisualization?.type || "").toLowerCase() === "pie" ? (
            renderPieChart(chartData)
          ) : (
            renderBarChart(chartData)
          )
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            We have the chart suggestion, but not enough numeric preview data to draw it yet.
          </div>
        )}
      </div>

      {options.length ? (
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles size={15} className="text-blue-600" />
            Chart Options
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const isActive = option.type === activeChartType;

              return (
                <Tooltip
                  key={`${option.type}-${option.x || "x"}-${option.y || "y"}`}
                  title={
                    option.type === "table"
                      ? "Return to table view"
                      : `${String(option.type || "chart").toUpperCase()} using ${option.x || "x"} and ${option.y || "y"}`
                  }
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 whitespace-nowrap border-slate-200 text-slate-600 hover:bg-slate-100",
                      isActive && "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                    )}
                    onClick={() => option.type && onSelectChartType?.(option.type)}
                    disabled={isSaving || !option.type}
                  >
                    {String(option.type || "chart")}
                  </Button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">Visualization</div>
            <div className="mt-1 break-words text-sm text-slate-500">
              {chartPrompt || "Review the suggested chart structure returned by the assistant."}
            </div>
          </div>
          {currentVisualization?.type ? (
            <Tag className="m-0 w-fit max-w-full rounded-full border-blue-200 bg-blue-50 text-[11px] text-blue-700">
              {currentVisualization.type}
            </Tag>
          ) : null}
        </div>
      </div>
      {content}
    </div>
  );
}
