"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Input,
  Progress,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";

import { serviceService } from "@/features/services/services/service.service";
import type { CatalogKpi } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";

function formatKpiValue(value?: number | string, unit?: string) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return unit ? `${value} ${unit}` : String(value);
}

function renderTrend(trend?: string) {
  const normalized = (trend || "").toLowerCase();

  if (normalized === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
        <ArrowUpRight size={12} />
        Up
      </span>
    );
  }

  if (normalized === "down") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700">
        <ArrowDownRight size={12} />
        Down
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
      <Activity size={12} />
      Stable
    </span>
  );
}

export default function ExploreKpisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  const {
    data: kpis = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["kpis"],
    queryFn: serviceService.getKpis,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: selectedKpi,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery({
    queryKey: ["kpi-detail", selectedKpiId],
    queryFn: () => serviceService.getKpiById(selectedKpiId as string),
    enabled: !!selectedKpiId,
    staleTime: 5 * 60 * 1000,
  });

  const filteredKpis = useMemo(() => {
    return kpis.filter((kpi) => {
      const haystack = [
        kpi.kpi_name,
        kpi.column_name,
        kpi.kpi_type,
        kpi.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [kpis, searchTerm]);

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "KPI" },
  ];

  const columns: ColumnsType<CatalogKpi> = [
    {
      title: "KPI Name",
      dataIndex: "kpi_name",
      key: "kpi_name",
      width: "20%",
      render: (value, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-blue-600">
            <TrendingUp size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
              {value || "Unnamed KPI"}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {record.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Column Name",
      dataIndex: "column_name",
      key: "column_name",
      width: "14%",
      render: (value) => <span className="text-[13px] text-slate-600">{value || "-"}</span>,
    },
    {
      title: "KPI Type",
      dataIndex: "kpi_type",
      key: "kpi_type",
      width: "12%",
      render: (value) => (
        <Tag className="m-0 rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          {value || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Current Value",
      key: "current_value",
      width: "14%",
      render: (_, record) => (
        <span className="font-medium text-slate-800">
          {formatKpiValue(record.current_value, record.unit)}
        </span>
      ),
    },
    {
      title: "Previous Value",
      dataIndex: "previous_value",
      key: "previous_value",
      width: "10%",
      render: (value) => <span className="text-[13px] text-slate-500">{value ?? "-"}</span>,
    },
    {
      title: "Trend",
      dataIndex: "trend",
      key: "trend",
      width: "10%",
      render: (value) => renderTrend(value),
    },
    {
      title: "Confidence Score",
      dataIndex: "confidence_score",
      key: "confidence_score",
      width: "12%",
      render: (value) => {
        const score = typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
        return (
          <div className="max-w-[120px]">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Confidence</span>
              <span className="font-medium text-slate-700">{score}%</span>
            </div>
            <Progress percent={score} showInfo={false} size="small" />
          </div>
        );
      },
    },
    {
      title: "Last Computed At",
      dataIndex: "last_computed_at",
      key: "last_computed_at",
      width: "14%",
      render: (value) => (
        <span className="text-[13px] text-slate-500">
          {value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-"}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: "4%",
      align: "right",
      render: () => (
        <ArrowRight size={16} className="mr-2 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title="KPIs"
              description="Explore catalog KPIs, trends, and confidence across your organization."
              breadcrumbItems={breadcrumbItems}
            />

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end pr-5 border-r border-slate-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">
                  Total KPIs
                </span>
                <span className="text-xl font-bold text-slate-900 leading-none">
                  {filteredKpis.length}
                </span>
              </div>
              <Tooltip title="Refresh KPIs">
                <Button
                  onClick={() => refetch()}
                  icon={<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />}
                  className="h-9 w-9 p-0 flex items-center justify-center rounded-md border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <div className="flex-1 flex items-center gap-2 px-2">
              <Search size={16} className="text-slate-400" />
              <Input
                placeholder="Search KPIs by name, type, column, or description..."
                variant="borderless"
                className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {isError ? (
              <div className="p-6">
                <Alert
                  title="Failed to load KPIs"
                  description="We couldn't load the KPI list right now."
                  type="error"
                  showIcon
                  action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
                />
              </div>
            ) : (
              <Table<CatalogKpi>
                dataSource={filteredKpis}
                columns={columns}
                rowKey="id"
                loading={{
                  spinning: isLoading,
                  indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />,
                }}
                pagination={{
                  pageSize: 50,
                  hideOnSinglePage: true,
                  className: "px-6 py-4 border-t border-slate-100 !mb-0 bg-white",
                }}
                className="custom-explore-table"
                onRow={(record) => ({
                  onClick: () => setSelectedKpiId(record.id),
                  className: "cursor-pointer group",
                })}
                locale={{
                  emptyText: (
                    <Empty
                      image={<div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><TrendingUp className="text-slate-300" size={28} /></div>}
                      description={
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-700 font-medium text-sm">No KPIs available</span>
                          <span className="text-slate-400 text-[13px]">No KPI records matched your current search.</span>
                        </div>
                      }
                    />
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={!!selectedKpiId}
        onClose={() => setSelectedKpiId(null)}
        placement="right"
        size="large"
        title="KPI Detail"
      >
        {isDetailLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin />
          </div>
        ) : isDetailError ? (
          <Alert
            title="Failed to load KPI detail"
            description="We couldn't load the KPI detail right now."
            type="error"
            showIcon
          />
        ) : selectedKpi ? (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-slate-900">{selectedKpi.kpi_name}</div>
              <div className="mt-2 text-sm text-slate-500">{selectedKpi.description || "No description provided."}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Basic Info</div>
              <div className="grid grid-cols-1 gap-3 text-sm text-slate-600">
                <div><span className="font-medium text-slate-800">KPI Type:</span> {selectedKpi.kpi_type || "-"}</div>
                <div><span className="font-medium text-slate-800">Column Name:</span> {selectedKpi.column_name || "-"}</div>
                <div><span className="font-medium text-slate-800">Asset ID:</span> {selectedKpi.asset_id || "-"}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Metrics</div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-xs text-slate-400">Current Value</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {formatKpiValue(selectedKpi.current_value, selectedKpi.unit)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Previous Value</div>
                  <div className="mt-1 text-sm text-slate-700">{selectedKpi.previous_value ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Trend</div>
                  <div className="mt-1">{renderTrend(selectedKpi.trend)}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-slate-400">Confidence Score</div>
                  <Progress percent={typeof selectedKpi.confidence_score === "number" ? selectedKpi.confidence_score : 0} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Timing</div>
              <div className="grid grid-cols-1 gap-3 text-sm text-slate-600">
                <div><span className="font-medium text-slate-800">Last Computed At:</span> {selectedKpi.last_computed_at ? dayjs(selectedKpi.last_computed_at).format("MMM D, YYYY h:mm A") : "-"}</div>
                <div><span className="font-medium text-slate-800">Created At:</span> {selectedKpi.created_at ? dayjs(selectedKpi.created_at).format("MMM D, YYYY h:mm A") : "-"}</div>
                <div><span className="font-medium text-slate-800">Updated At:</span> {selectedKpi.updated_at ? dayjs(selectedKpi.updated_at).format("MMM D, YYYY h:mm A") : "-"}</div>
              </div>
            </div>
          </div>
        ) : (
          <Empty description="No KPI selected" />
        )}
      </Drawer>

      <style jsx global>{`
        .custom-explore-table .ant-table {
          background: transparent !important;
        }
        .custom-explore-table .ant-table-thead > tr > th {
          background: #FAFAFA !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #E2E8F0 !important;
          padding: 12px 24px !important;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .custom-explore-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
      `}</style>
    </div>
  );
}
