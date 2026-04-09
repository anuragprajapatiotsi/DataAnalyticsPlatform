"use client";

import { useMemo, useState } from "react";
import { Bot, RefreshCw, Search, Workflow } from "lucide-react";
import { Empty, Input, Select, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useNotificationFeed } from "@/features/notifications/hooks/useNotificationFeed";
import type {
  NotificationBotItem,
  NotificationSyncItem,
} from "@/features/notifications/types";
import {
  formatNotificationTimestamp,
  getNotificationStatusTone,
  mapBotNotification,
  mapSyncNotification,
  notificationSearchText,
  sortNotificationsByNewest,
  type NotificationListItem,
} from "@/features/notifications/utils";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";

const PAGE_LIMIT = 100;

function NotificationMetricCard({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: number;
  accentClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className={cn("mt-2 text-2xl font-bold", accentClass)}>{value}</p>
    </div>
  );
}

function NotificationStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
        getNotificationStatusTone(status),
      )}
    >
      {status}
    </span>
  );
}

function SyncTable({
  items,
  loading,
}: {
  items: NotificationSyncItem[];
  loading: boolean;
}) {
  const columns: ColumnsType<NotificationSyncItem> = [
    {
      title: "Catalog View",
      dataIndex: "catalog_view_name",
      key: "catalog_view_name",
      render: (value: string, record) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {value || "Catalog sync"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {record.catalog_view_id}
          </p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => <NotificationStatusBadge status={status} />,
    },
    {
      title: "Trigger",
      dataIndex: "trigger",
      key: "trigger",
      width: 150,
      render: (value: string) => (
        <span className="text-sm text-slate-600">{value || "Unknown"}</span>
      ),
    },
    {
      title: "Rows Synced",
      dataIndex: "rows_synced",
      key: "rows_synced",
      width: 130,
      render: (value: number) => (
        <span className="font-medium text-slate-700">{value ?? 0}</span>
      ),
    },
    {
      title: "Columns Synced",
      dataIndex: "columns_synced",
      key: "columns_synced",
      width: 150,
      render: (value: number) => (
        <span className="font-medium text-slate-700">{value ?? 0}</span>
      ),
    },
    {
      title: "Message",
      key: "message",
      render: (_, record) => (
        <span className="block max-w-[360px] truncate text-sm text-slate-600">
          {record.error_message || "Sync completed without errors."}
        </span>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 160,
      render: (value: string, record) => (
        <span className="text-xs text-slate-500">
          {formatNotificationTimestamp(value || record.created_at)}
        </span>
      ),
    },
  ];

  return (
    <Table<NotificationSyncItem>
      columns={columns}
      dataSource={items}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No sync notifications found"
          />
        ),
      }}
      className="notifications-table"
      scroll={{ x: 1100 }}
    />
  );
}

function BotRunsTable({
  items,
  loading,
}: {
  items: NotificationBotItem[];
  loading: boolean;
}) {
  const columns: ColumnsType<NotificationBotItem> = [
    {
      title: "Bot Name",
      dataIndex: "bot_name",
      key: "bot_name",
      render: (value: string, record) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {value || "Bot run"}
          </p>
          <p className="truncate text-xs text-slate-500">{record.bot_id}</p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => <NotificationStatusBadge status={status} />,
    },
    {
      title: "Trigger Source",
      dataIndex: "trigger_source",
      key: "trigger_source",
      width: 170,
      render: (value: string) => (
        <span className="text-sm text-slate-600">{value || "Unknown"}</span>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (value: string) => (
        <span className="block max-w-[440px] truncate text-sm text-slate-600">
          {value || "Bot run completed."}
        </span>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 160,
      render: (value: string, record) => (
        <span className="text-xs text-slate-500">
          {formatNotificationTimestamp(value || record.created_at)}
        </span>
      ),
    },
  ];

  return (
    <Table<NotificationBotItem>
      columns={columns}
      dataSource={items}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No bot run notifications found"
          />
        ),
      }}
      className="notifications-table"
      scroll={{ x: 980 }}
    />
  );
}

export function NotificationsPage() {
  const { data, isLoading, isError, refetch, isFetching } =
    useNotificationFeed(PAGE_LIMIT);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [triggerFilter, setTriggerFilter] = useState<string | undefined>();

  const syncNotifications = useMemo(() => {
    return sortNotificationsByNewest(
      (data?.sync ?? []).map(mapSyncNotification),
    );
  }, [data?.sync]);

  const botRunNotifications = useMemo(() => {
    return sortNotificationsByNewest(
      (data?.bots ?? []).map(mapBotNotification),
    );
  }, [data?.bots]);

  const allNotifications = useMemo(() => {
    return [...syncNotifications, ...botRunNotifications];
  }, [syncNotifications, botRunNotifications]);

  const statusOptions = useMemo(() => {
    return [...new Set(allNotifications.map((item) => item.status).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ label: value, value }));
  }, [allNotifications]);

  const triggerOptions = useMemo(() => {
    return [...new Set(allNotifications.map((item) => item.trigger).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ label: value, value }));
  }, [allNotifications]);

  const applyFilters = (items: NotificationListItem[]) => {
    return items.filter((item) => {
      const matchesSearch =
        !searchValue || notificationSearchText(item).includes(searchValue.toLowerCase());
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesTrigger = !triggerFilter || item.trigger === triggerFilter;

      return matchesSearch && matchesStatus && matchesTrigger;
    });
  };

  const filteredSync = applyFilters(syncNotifications);
  const filteredBotRuns = applyFilters(botRunNotifications);

  const breadcrumbItems = [
    { label: "Notifications" },
  ];

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 pt-2 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Notifications"
        description="Review recent sync activity and bot runs across your workspace."
        breadcrumbItems={breadcrumbItems}
      >
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          Refresh
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <NotificationMetricCard
          label="Total Notifications"
          value={allNotifications.length}
          accentClass="text-slate-900"
        />
        <NotificationMetricCard
          label="Sync"
          value={syncNotifications.length}
          accentClass="text-blue-700"
        />
        <NotificationMetricCard
          label="Bot Runs"
          value={botRunNotifications.length}
          accentClass="text-emerald-700"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_220px_220px_auto]">
          <Input
            allowClear
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            prefix={<Search size={16} className="mr-2 text-slate-400" />}
            placeholder="Search across names, status, trigger, messages, ids, and timestamps..."
            className="notifications-search h-10"
          />

          <Select
            allowClear
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={statusOptions}
            placeholder="Filter status"
            className="h-10"
          />

          <Select
            allowClear
            value={triggerFilter}
            onChange={(value) => setTriggerFilter(value)}
            options={triggerOptions}
            placeholder="Filter trigger"
            className="h-10"
          />

          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              setStatusFilter(undefined);
              setTriggerFilter(undefined);
            }}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {isError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-base font-semibold text-slate-800">
              Unable to load notifications
            </p>
            <p className="text-sm text-slate-500">
              Please refresh and try again.
            </p>
          </div>
        ) : (
          <Tabs
            defaultActiveKey="sync"
            items={[
              {
                key: "sync",
                label: (
                  <span className="inline-flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Sync
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {filteredSync.length}
                    </span>
                  </span>
                ),
                children: (
                  <SyncTable
                    items={filteredSync.map(
                      (item) => item.raw as NotificationSyncItem,
                    )}
                    loading={isLoading}
                  />
                ),
              },
              {
                key: "bot_runs",
                label: (
                  <span className="inline-flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Bot Runs
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {filteredBotRuns.length}
                    </span>
                  </span>
                ),
                children: (
                  <BotRunsTable
                    items={filteredBotRuns.map(
                      (item) => item.raw as NotificationBotItem,
                    )}
                    loading={isLoading}
                  />
                ),
              },
            ]}
          />
        )}
      </div>

      <style jsx global>{`
        .notifications-search .ant-input-affix-wrapper,
        .ant-select-selector {
          border-radius: 10px !important;
          border-color: #e2e8f0 !important;
          min-height: 40px !important;
          box-shadow: none !important;
        }
        .notifications-search .ant-input-affix-wrapper:hover,
        .notifications-search .ant-input-affix-wrapper-focused,
        .ant-select-focused .ant-select-selector,
        .ant-select-selector:hover {
          border-color: #3b82f6 !important;
        }
        .notifications-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569 !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.04em !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 16px !important;
        }
        .notifications-table .ant-table-tbody > tr > td {
          padding: 14px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          vertical-align: top !important;
        }
        .notifications-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        .ant-tabs-nav {
          margin: 0 0 12px 0 !important;
          padding: 0 10px !important;
        }
      `}</style>
    </div>
  );
}

