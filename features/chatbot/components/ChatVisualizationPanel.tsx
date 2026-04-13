"use client";

import React from "react";
import { BarChart3, LineChart, PieChart, Sparkles } from "lucide-react";
import { Empty, Select, Tag, Tooltip, message } from "antd";

import { Button } from "@/shared/components/ui/button";
import type {
  ChatResultPreview,
  ChatVisualizationConfig,
} from "@/features/chatbot/types";

const CHART_PALETTE = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#06b6d4"];

type ChartRow = Record<string, unknown>;
type ChartMetric = { key: string; value: number };
type ChartDatum = { label: string; metrics: ChartMetric[] };
type ColumnKind = "number" | "date" | "category";
type ChartSpec = {
  chartType: string;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  xKind: ColumnKind;
  seriesKeys: string[];
  data: ChartDatum[];
  maxValue: number;
  xLabelRotation: number;
};

function getChartTitle(visualization?: ChatVisualizationConfig | null) {
  if (!visualization) {
    return "Suggested Visualization";
  }

  return (
    visualization.title || `${String(visualization.type || "chart").toUpperCase()} chart`
  );
}

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

function getColumnKind(
  preview: ChatResultPreview | null | undefined,
  rows: ChartRow[],
  column: string,
): ColumnKind {
  const metadataType = preview?.column_metadata?.[column]?.type?.toLowerCase();

  if (metadataType) {
    if (
      metadataType.includes("int") ||
      metadataType.includes("decimal") ||
      metadataType.includes("float") ||
      metadataType.includes("double") ||
      metadataType.includes("number")
    ) {
      return "number";
    }

    if (
      metadataType.includes("date") ||
      metadataType.includes("time") ||
      metadataType.includes("timestamp")
    ) {
      return "date";
    }
  }

  const samples = rows
    .map((row) => row[column])
    .filter((value) => value !== null && value !== undefined)
    .slice(0, 6);

  if (!samples.length) {
    return "category";
  }

  if (samples.every((value) => getMetricValue(value) !== null)) {
    return "number";
  }

  if (
    samples.every(
      (value) =>
        typeof value === "string" &&
        !/^\d+$/.test(value.trim()) &&
        !Number.isNaN(Date.parse(value)),
    )
  ) {
    return "date";
  }

  return "category";
}

function formatAxisLabel(value: string, kind: ColumnKind) {
  if (kind === "date") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(parsed);
    }
  }

  return value;
}

function buildChartSpec(
  preview: ChatResultPreview | null | undefined,
  visualization: ChatVisualizationConfig | null | undefined,
): ChartSpec | null {
  if (!preview || !visualization) {
    return null;
  }

  const rows = normalizePreviewRows(preview);
  const availableColumns = Array.isArray(preview.columns) ? preview.columns : [];
  if (!rows.length || !availableColumns.length) {
    return null;
  }

  const numericColumns = availableColumns.filter(
    (column) => getColumnKind(preview, rows, column) === "number",
  );
  const categoryColumns = availableColumns.filter(
    (column) => getColumnKind(preview, rows, column) !== "number",
  );

  const requestedX = visualization.x || "";
  const requestedY = visualization.y || "";
  const xKey =
    categoryColumns.find((column) => column === requestedX) ||
    categoryColumns[0] ||
    availableColumns.find((column) => column !== requestedY) ||
    availableColumns[0] ||
    "";
  const yKey =
    numericColumns.find((column) => column === requestedY) ||
    numericColumns[0] ||
    availableColumns.find((column) => column !== xKey) ||
    "";

  const requestedSeries = Array.isArray(visualization.series)
    ? visualization.series.filter((series): series is string => numericColumns.includes(series))
    : [];
  const seriesKeys = Array.from(new Set([yKey, ...requestedSeries].filter(Boolean)));

  if (!xKey || !yKey || !seriesKeys.length) {
    return null;
  }

  const data = rows
    .slice(0, 12)
    .map((row) => {
      const label = getLabelValue(row[xKey]);
      const metrics = seriesKeys
        .map((key) => ({
          key,
          value: getMetricValue(row[key]),
        }))
        .filter((metric): metric is ChartMetric => metric.value !== null);

      if (!metrics.length) {
        return null;
      }

      return { label, metrics };
    })
    .filter((item): item is ChartDatum => Boolean(item));

  if (!data.length) {
    return null;
  }

  return {
    chartType: String(visualization.type || "bar").toLowerCase(),
    xKey,
    yKey,
    xLabel: visualization.x_label || xKey,
    yLabel: visualization.y_label || yKey,
    xKind: getColumnKind(preview, rows, xKey),
    seriesKeys,
    data,
    maxValue: Math.max(
      ...data.flatMap((item) => item.metrics.map((metric) => metric.value)),
      1,
    ),
    xLabelRotation:
      data.length > 8 ? 30 : data.some((item) => item.label.length > 12) ? 18 : 0,
  };
}

function renderLegend(seriesKeys: string[]) {
  if (seriesKeys.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {seriesKeys.map((key, index) => (
        <div
          key={`${key}-${index}`}
          className="flex items-center gap-1.5 text-[11px] text-slate-500"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CHART_PALETTE[index % CHART_PALETTE.length] }}
          />
          <span>{key}</span>
        </div>
      ))}
    </div>
  );
}

function renderChartHeader(chartSpec: ChartSpec) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs text-slate-500">
        <span className="font-medium text-slate-700">X:</span> {chartSpec.xLabel}
        <span className="mx-2 text-slate-300">|</span>
        <span className="font-medium text-slate-700">Y:</span> {chartSpec.yLabel}
      </div>
      {renderLegend(chartSpec.seriesKeys)}
    </div>
  );
}

function renderBarChart(chartSpec: ChartSpec) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {renderChartHeader(chartSpec)}

        <div className="grid grid-cols-[auto,1fr] gap-3">
          <div className="flex items-center">
            <span className="rotate-180 text-[11px] font-medium text-slate-500 [writing-mode:vertical-rl]">
              {chartSpec.yLabel}
            </span>
          </div>
          <div className="space-y-3">
            <div className="relative h-72 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {[0, 25, 50, 75, 100].map((tick) => (
                <div
                  key={tick}
                  className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-slate-200"
                  style={{ bottom: `${tick}%` }}
                />
              ))}

              <div className="absolute inset-0 grid grid-cols-[1fr_auto]">
                <div className="relative">
                  <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-around gap-3 px-4 pb-3 pt-4">
                    {chartSpec.data.map((item, itemIndex) => (
                      <div
                        key={`${item.label}-${itemIndex}`}
                        className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                      >
                        <div className="flex h-full items-end gap-1.5">
                          {item.metrics.map((metric, metricIndex) => {
                            const height = Math.max(
                              (metric.value / chartSpec.maxValue) * 100,
                              6,
                            );

                            return (
                              <Tooltip
                                key={`${item.label}-${metric.key}-${itemIndex}-${metricIndex}`}
                                title={`${item.label} - ${metric.key}: ${formatMetricValue(metric.value)}`}
                              >
                                <div className="flex h-full items-end">
                                  <div className="flex flex-col items-center justify-end">
                                    <span className="mb-1 text-[10px] font-medium text-slate-500">
                                      {formatMetricValue(metric.value)}
                                    </span>
                                    <div
                                      className="min-h-[12px] w-5 rounded-t-md shadow-sm transition-opacity hover:opacity-85"
                                      style={{
                                        backgroundColor:
                                          CHART_PALETTE[
                                            metricIndex % CHART_PALETTE.length
                                          ],
                                        height: `${height}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </Tooltip>
                            );
                          })}
                        </div>
                        <div
                          className="mt-2 w-full text-center text-[11px] font-medium text-slate-600"
                          style={{
                            transform:
                              chartSpec.xLabelRotation > 0
                                ? `rotate(-${chartSpec.xLabelRotation}deg)`
                                : undefined,
                            transformOrigin: "top center",
                          }}
                        >
                          <span className="inline-block max-w-full truncate">
                            {formatAxisLabel(item.label, chartSpec.xKind)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex h-full flex-col justify-between border-l border-slate-200 px-2 py-3 text-[10px] text-slate-400">
                  <span>{formatMetricValue(chartSpec.maxValue)}</span>
                  <span>{formatMetricValue(chartSpec.maxValue * 0.75)}</span>
                  <span>{formatMetricValue(chartSpec.maxValue * 0.5)}</span>
                  <span>{formatMetricValue(chartSpec.maxValue * 0.25)}</span>
                  <span>0</span>
                </div>
              </div>
            </div>

            <div className="text-center text-[11px] font-medium text-slate-500">
              {chartSpec.xLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderLineChart(chartSpec: ChartSpec) {
  const metricSeries = chartSpec.seriesKeys
    .map((key) => ({
      key,
      values: chartSpec.data
        .map((item) => item.metrics.find((metric) => metric.key === key)?.value ?? null)
        .filter((value): value is number => value !== null),
    }))
    .filter((series) => series.values.length);

  if (!metricSeries.length) {
    return null;
  }

  const width = 320;
  const height = 160;
  const flattenedValues = metricSeries.flatMap((series) => series.values);
  const maxValue = Math.max(...flattenedValues);
  const minValue = Math.min(...flattenedValues);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {renderChartHeader(chartSpec)}
        <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
          {[0, 25, 50, 75, 100].map((tick) => (
            <line
              key={tick}
              x1="0"
              y1={height - (tick / 100) * (height - 20) - 10}
              x2={width}
              y2={height - (tick / 100) * (height - 20) - 10}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          ))}

          {metricSeries.map((series, seriesIndex) => {
            const points = series.values.map((value, index) => {
              const x = (index / Math.max(series.values.length - 1, 1)) * width;
              const y =
                maxValue === minValue
                  ? height / 2
                  : height -
                    ((value - minValue) / (maxValue - minValue)) * (height - 24) -
                    12;

              return `${x},${y}`;
            });

            return (
              <g key={`${series.key}-${seriesIndex}`}>
                <polyline
                  fill="none"
                  stroke={CHART_PALETTE[seriesIndex % CHART_PALETTE.length]}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={points.join(" ")}
                />
                {points.map((point, index) => {
                  const [cx, cy] = point.split(",");
                  const value = series.values[index];

                  return (
                    <g key={`${series.key}-${point}-${index}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill="#ffffff"
                        stroke={CHART_PALETTE[seriesIndex % CHART_PALETTE.length]}
                        strokeWidth="2"
                      />
                      <text
                        x={cx}
                        y={Number(cy) - 8}
                        textAnchor="middle"
                        className="fill-slate-500 text-[10px]"
                      >
                        {formatMetricValue(value)}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        <div className="mt-3 grid grid-cols-[auto,1fr] gap-3 text-[11px] text-slate-500">
          <div className="font-medium text-slate-700">Y</div>
          <div>{chartSpec.yLabel}</div>
          <div className="font-medium text-slate-700">X</div>
          <div>{chartSpec.xLabel}</div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {chartSpec.data.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
          >
            <span className="font-semibold text-slate-900">{item.label}:</span>{" "}
            {item.metrics
              .map((metric) => `${metric.key}: ${formatMetricValue(metric.value)}`)
              .join(" | ")}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderPieChart(chartSpec: ChartSpec) {
  const values = chartSpec.data.map((item) => item.metrics[0]?.value ?? 0);
  const total = values.reduce((sum, value) => sum + value, 0);

  if (!total) {
    return null;
  }

  let cumulative = 0;
  const slices = chartSpec.data.map((item, index) => {
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
      color: CHART_PALETTE[index % CHART_PALETTE.length],
      label: item.label,
      value,
    };
  });

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {renderChartHeader(chartSpec)}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
            <svg viewBox="0 0 180 180" className="h-44 w-44">
              {slices.map((slice, index) => (
                <path key={`${slice.label}-${index}`} d={slice.path} fill={slice.color} />
              ))}
              <circle cx="90" cy="90" r="34" fill="#ffffff" />
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            {slices.map((slice, index) => (
              <div
                key={`${slice.label}-${index}`}
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
  onSelectChartType?: (config: {
    type: string;
    x?: string;
    y?: string;
    series?: string[];
    columns?: string[];
  }) => void;
  isSaving?: boolean;
  embedded?: boolean;
}) {
  const options = React.useMemo(
    () => (Array.isArray(chartOptions) ? chartOptions : []),
    [chartOptions],
  );
  const previewRows = React.useMemo(
    () => normalizePreviewRows(resultPreview),
    [resultPreview],
  );
  const availableColumns = React.useMemo(
    () => (Array.isArray(resultPreview?.columns) ? resultPreview.columns : []),
    [resultPreview?.columns],
  );
  const numericColumns = React.useMemo(
    () =>
      availableColumns.filter(
        (column) => getColumnKind(resultPreview, previewRows, column) === "number",
      ),
    [availableColumns, previewRows, resultPreview],
  );
  const categoryColumns = React.useMemo(
    () =>
      availableColumns.filter(
        (column) => getColumnKind(resultPreview, previewRows, column) !== "number",
      ),
    [availableColumns, previewRows, resultPreview],
  );
  const defaultVisualization = React.useMemo(() => {
    const fallbackOption = options[0] || null;
    const baseVisualization = visualization || fallbackOption || null;
    const fallbackX = baseVisualization?.x || categoryColumns[0] || availableColumns[0] || "";
    const fallbackY =
      baseVisualization?.y ||
      numericColumns.find((column) => column !== fallbackX) ||
      numericColumns[0] ||
      availableColumns.find((column) => column !== fallbackX) ||
      "";

    return {
      type: baseVisualization?.type || selectedChartType || "bar",
      x: fallbackX,
      y: fallbackY,
      series: Array.isArray(baseVisualization?.series) ? baseVisualization.series : [],
      columns:
        Array.isArray(baseVisualization?.columns) && baseVisualization.columns.length
          ? baseVisualization.columns
          : availableColumns,
    };
  }, [
    availableColumns,
    categoryColumns,
    numericColumns,
    options,
    selectedChartType,
    visualization,
  ]);
  const [config, setConfig] = React.useState(defaultVisualization);

  React.useEffect(() => {
    setConfig(defaultVisualization);
  }, [defaultVisualization]);

  const activeChartType = config.type || "bar";
  const currentVisualization = React.useMemo(
    () => ({
      ...(options.find((option) => option.type === activeChartType) || visualization || {}),
      type: activeChartType,
      x: config.x,
      y: config.y,
      series: config.series,
      columns: config.columns,
    }),
    [activeChartType, config.columns, config.series, config.x, config.y, options, visualization],
  );
  const chartSpec = React.useMemo(
    () => buildChartSpec(resultPreview, currentVisualization),
    [currentVisualization, resultPreview],
  );
  const selectOptions = React.useMemo(
    () =>
      availableColumns.map((column) => ({
        label: column,
        value: column,
      })),
    [availableColumns],
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

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Chart Type
          </div>
          <Select
            value={config.type}
            className="w-full"
            disabled={!availableColumns.length || isSaving}
            options={[
              { label: "Bar", value: "bar" },
              { label: "Line", value: "line" },
              { label: "Pie", value: "pie" },
            ]}
            onChange={(value) =>
              setConfig((previous) => ({
                ...previous,
                type: value,
              }))
            }
          />
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Columns
          </div>
          <Select
            mode="multiple"
            value={config.columns}
            className="w-full"
            disabled={!availableColumns.length || isSaving}
            options={selectOptions}
            onChange={(value) =>
              setConfig((previous) => ({
                ...previous,
                columns: value.length ? value : availableColumns,
              }))
            }
          />
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            X Axis
          </div>
          <Select
            value={config.x || undefined}
            className="w-full"
            disabled={!categoryColumns.length || isSaving}
            options={categoryColumns.map((column) => ({ label: column, value: column }))}
            onChange={(value) =>
              setConfig((previous) => ({
                ...previous,
                x: value,
              }))
            }
          />
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Y Axis
          </div>
          <Select
            value={config.y || undefined}
            className="w-full"
            disabled={!numericColumns.length || isSaving}
            options={numericColumns.map((column) => ({ label: column, value: column }))}
            onChange={(value) =>
              setConfig((previous) => ({
                ...previous,
                y: value,
              }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Series
          </div>
          <Select
            mode="multiple"
            value={config.series}
            className="w-full"
            disabled={!numericColumns.length || isSaving}
            options={numericColumns.map((column) => ({ label: column, value: column }))}
            onChange={(value) =>
              setConfig((previous) => ({
                ...previous,
                series: value,
              }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
          disabled={!availableColumns.length || isSaving}
          onClick={() => {
            if (!config.x || !config.y) {
              message.error("Select X and Y axis");
              return;
            }

            onSelectChartType?.({
              type: config.type,
              x: config.x,
              y: config.y,
              series: config.series,
              columns: config.columns.length ? config.columns : availableColumns,
            });
          }}
        >
          Apply Visualization
        </Button>
      </div>

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
        {chartSpec ? (
          chartSpec.chartType === "line" ? (
            renderLineChart(chartSpec)
          ) : chartSpec.chartType === "pie" ? (
            renderPieChart(chartSpec)
          ) : (
            renderBarChart(chartSpec)
          )
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No data available for the selected chart mapping"
          />
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
                    className={[
                      "h-8 whitespace-nowrap border-slate-200 text-slate-600 hover:bg-slate-100",
                      isActive && "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      if (!option.type) {
                        return;
                      }

                      const nextConfig = {
                        type: option.type,
                        x: option.x || config.x,
                        y: option.y || config.y,
                        series: Array.isArray(option.series) ? option.series : config.series,
                        columns:
                          Array.isArray(option.columns) && option.columns.length
                            ? option.columns
                            : config.columns.length
                              ? config.columns
                              : availableColumns,
                      };

                      setConfig(nextConfig);
                      onSelectChartType?.(nextConfig);
                    }}
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
