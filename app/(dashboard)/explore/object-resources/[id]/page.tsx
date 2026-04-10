"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  message,
  Alert,
  Skeleton,
  Table,
  Button,
  Tooltip,
  Tabs,
  Dropdown,
  Space,
} from "antd";
import {
  Layers,
  Database,
  Clock,
  Calendar,
  AlertTriangle,
  Settings,
  Activity,
  RefreshCw,
  Hash,
  ShieldAlert,
  Terminal,
  LayoutDashboard,
  Play,
  Square,
  ExternalLink,
  ChevronDown,
  FileCode,
  Table as TableIcon,
} from "lucide-react";
import type { MenuProps } from "antd";
import Editor from "@monaco-editor/react";
import { NOTIFICATION_FEED_QUERY_KEY } from "@/features/notifications/constants";
import { useNotificationFeed } from "@/features/notifications/hooks/useNotificationFeed";
import type { NotificationSyncItem } from "@/features/notifications/types";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogView, SyncConfig } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import { ShieldCheck, Cpu } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { registerSqlAutocomplete } from "@/features/sql-editor/services/autocomplete";

interface ResultTab {
  id: string;
  name: string;
  query: string;
  data: any[];
  columns: any[];
  status: "success" | "error" | "loading";
  error?: string;
  timestamp: string;
}

interface QueryTab {
  id: string;
  name: string;
  query: string;
  resultTabs: ResultTab[];
  activeResultTabId: string | null;
}

type SyncAlertState = {
  type: "success" | "error" | "info";
  message: string;
  description: string;
} | null;

type ColumnMetadataRow = {
  key: string;
} & Record<string, unknown>;

const IN_PROGRESS_SYNC_STATUSES = new Set([
  "syncing",
  "running",
  "pending",
  "queued",
  "in_progress",
]);

const SUCCESS_SYNC_STATUSES = new Set(["success", "completed"]);

function getNotificationTimestamp(notification: NotificationSyncItem | null) {
  if (!notification) return 0;
  return new Date(notification.updated_at || notification.created_at).getTime();
}

function isInProgressSyncStatus(status?: string | null) {
  return IN_PROGRESS_SYNC_STATUSES.has((status || "").toLowerCase());
}

function isSuccessfulSyncStatus(status?: string | null) {
  return SUCCESS_SYNC_STATUSES.has((status || "").toLowerCase());
}

function normalizeColumnMetadata(columns: unknown): ColumnMetadataRow[] {
  if (!Array.isArray(columns)) {
    return [];
  }

  return columns
    .filter((column): column is Record<string, unknown> => {
      return !!column && typeof column === "object";
    })
    .map((column, index) => {
      return {
        ...column,
        key:
          typeof column.id === "string"
            ? column.id
            : typeof column.name === "string"
              ? `${column.name}-${index}`
              : typeof column.column_name === "string"
                ? `${column.column_name}-${index}`
                : `column-${index}`,
      };
    });
}

function extractColumnMetadata(viewDetail: CatalogView | null): ColumnMetadataRow[] {
  if (!viewDetail) {
    return [];
  }

  const candidateSources: unknown[] = [
    (viewDetail as unknown as Record<string, unknown>).column_metadata,
    viewDetail.sync_config?.column_metadata,
    (viewDetail as unknown as Record<string, unknown>).columns,
    viewDetail.sync_config?.columns,
    viewDetail.sync_config?.source_columns,
    viewDetail.sync_config?.table_columns,
    viewDetail.sync_config?.last_export_columns,
  ];

  for (const source of candidateSources) {
    const normalized = normalizeColumnMetadata(source);
    if (normalized.length > 0) {
      return normalized;
    }

      if (Array.isArray(source) && source.every((item) => typeof item === "string")) {
        return source.map((name, index) => ({
          key: `${name}-${index}`,
          name,
        }));
      }
  }

  return [];
}

export default function ExploreObjectResourceDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const searchParams = useSearchParams();
  const viewId = params.id as string;
  const isCreatedFlow = searchParams.get("created") === "1";

  const [viewDetail, setViewDetail] = useState<CatalogView | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryTabs, setQueryTabs] = useState<QueryTab[]>([]);
  const [activeQueryTabId, setActiveQueryTabId] = useState<string | null>(null);
  const [activePageTab, setActivePageTab] = useState("overview");
  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(null);
  const [isSyncConfigLoading, setIsSyncConfigLoading] = useState(false);
  const [sampleDataRows, setSampleDataRows] = useState<Record<string, unknown>[]>(
    [],
  );
  const [sampleDataColumns, setSampleDataColumns] = useState<
    {
      title: string;
      dataIndex: string;
      key: string;
      ellipsis: boolean;
      render: (value: unknown) => React.ReactNode;
    }[]
  >([]);
  const [isSampleDataLoading, setIsSampleDataLoading] = useState(false);
  const [sampleDataError, setSampleDataError] = useState<string | null>(null);
  const [sampleDataFetchedFor, setSampleDataFetchedFor] = useState<string | null>(
    null,
  );
  const [syncRequestedAt, setSyncRequestedAt] = useState<number | null>(null);
  const [syncAlert, setSyncAlert] = useState<SyncAlertState>(null);
  const editorRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { data: notificationFeed } = useNotificationFeed(100);

  const activeQueryTab = queryTabs.find((t) => t.id === activeQueryTabId);
  const latestViewSyncNotification = useMemo(() => {
    const notifications = (notificationFeed?.sync ?? []).filter(
      (item) => item.catalog_view_id === viewId,
    );

    if (notifications.length === 0) {
      return null;
    }

    return notifications.reduce<NotificationSyncItem | null>((latest, item) => {
      if (!latest) {
        return item;
      }

      return getNotificationTimestamp(item) > getNotificationTimestamp(latest)
        ? item
        : latest;
    }, null);
  }, [notificationFeed?.sync, viewId]);
  const sampleDataTarget = useMemo(() => {
    if (!viewDetail) {
      return null;
    }

    return (
      viewDetail.sync_config?.iceberg_table ||
      `${viewDetail.source_schema || "schema"}.${viewDetail.source_table || "table"}`
    );
  }, [viewDetail]);
  const overviewColumns = useMemo(() => {
    return extractColumnMetadata(viewDetail);
  }, [viewDetail]);
  const overviewColumnTableColumns = useMemo(() => {
    if (overviewColumns.length === 0) {
      return [];
    }

    const preferredOrder = [
      "name",
      "column_name",
      "display_name",
      "data_type",
      "type",
      "column_type",
      "description",
      "comment",
      "display_description",
      "is_nullable",
      "nullable",
    ];

    const discoveredKeys = Array.from(
      new Set(
        overviewColumns.flatMap((column) =>
          Object.keys(column).filter((key) => key !== "key"),
        ),
      ),
    );

    const orderedKeys = [
      ...preferredOrder.filter((key) => discoveredKeys.includes(key)),
      ...discoveredKeys.filter((key) => !preferredOrder.includes(key)),
    ];

      return orderedKeys.map((field) => ({
        title: field
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        dataIndex: field,
        key: field,
        render: (value: unknown) => {
          if (value === null || value === undefined || value === "") {
            return <span className="text-slate-400">-</span>;
        }

        if (typeof value === "boolean") {
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold",
                value
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {value ? "Yes" : "No"}
            </span>
          );
        }

        if (Array.isArray(value)) {
          return (
            <span className="block whitespace-pre-wrap break-words text-sm text-slate-600">
              {value.join(", ")}
            </span>
          );
        }

        if (typeof value === "object") {
          const formattedValue = JSON.stringify(value);
          return (
            <Tooltip title={formattedValue}>
              <span className="block cursor-help whitespace-pre-wrap break-words text-sm text-slate-600">
                {formattedValue}
              </span>
            </Tooltip>
          );
        }

        const renderedValue = String(value);
        const isDataTypeField = ["data_type", "type", "column_type"].includes(
          field,
        );

        return isDataTypeField ? (
          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[12px] text-slate-700">
            {renderedValue}
          </span>
        ) : (
          <span className="block whitespace-pre-wrap break-words text-sm text-slate-700">
            {renderedValue}
          </span>
        );
      },
    }));
  }, [overviewColumns]);

  const addQueryTab = (initialQuery: string = "") => {
    const newId = Date.now().toString();
    const newTab: QueryTab = {
      id: newId,
      name: `Query ${queryTabs.length + 1}`,
      query: initialQuery,
      resultTabs: [],
      activeResultTabId: null,
    };
    setQueryTabs((prev) => [...prev, newTab]);
    setActiveQueryTabId(newId);
    return newId;
  };

  const removeQueryTab = (targetId: string) => {
    const newTabs = queryTabs.filter((tab) => tab.id !== targetId);
    if (newTabs.length === 0) {
      // Always keep at least one tab or handle empty state
      setQueryTabs([]);
      setActiveQueryTabId(null);
      return;
    }
    setQueryTabs(newTabs);
    if (activeQueryTabId === targetId) {
      setActiveQueryTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const updateQueryTab = useCallback(
    (
      targetTabId: string,
      updater: Partial<QueryTab> | ((prev: QueryTab) => Partial<QueryTab>),
    ) => {
      setQueryTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === targetTabId) {
            const updates =
              typeof updater === "function" ? updater(tab) : updater;
            return { ...tab, ...updates };
          }
          return tab;
        }),
      );
    },
    [],
  );

  const fetchSyncConfig = useCallback(async () => {
    if (!viewId) return;
    try {
      setIsSyncConfigLoading(true);
      const data = await serviceService.getSyncConfig(viewId);
      setSyncConfig(data);
    } catch (err) {
      console.error("Failed to fetch sync config:", err);
      message.error("Failed to load sync configurations.");
    } finally {
      setIsSyncConfigLoading(false);
    }
  }, [viewId]);

  const fetchSampleData = useCallback(
    async (force: boolean = false) => {
      if (!sampleDataTarget || viewDetail?.sync_status !== "success") {
        return;
      }

      if (
        !force &&
        (isSampleDataLoading || sampleDataFetchedFor === sampleDataTarget)
      ) {
        return;
      }

      try {
        setIsSampleDataLoading(true);
        setSampleDataError(null);

        const response = await serviceService.executeTrinoQuery({
          sql: `SELECT * FROM ${sampleDataTarget} LIMIT 50`,
          catalog: "iceberg",
          schema: "catalog_views",
          limit: 50,
        });

        const { columns = [], rows = [] } =
          (response as { columns?: string[]; rows?: unknown[][] }) || {};

        const mappedColumns = columns.map((column) => ({
          title: column
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          dataIndex: column,
          key: column,
          ellipsis: true,
          render: (value: unknown) => {
            if (value === null || value === undefined) {
              return <span className="italic text-slate-400">null</span>;
            }

            if (typeof value === "object") {
              const formattedValue = JSON.stringify(value);
              return (
                <Tooltip title={formattedValue}>
                  <span className="block max-w-[220px] cursor-help truncate text-slate-500">
                    {formattedValue}
                  </span>
                </Tooltip>
              );
            }

            return <span className="text-slate-700">{String(value)}</span>;
          },
        }));

        const mappedRows = rows.map((row, rowIndex) => {
          const rowObject: Record<string, unknown> = {
            __rowKey: `${viewId}-${rowIndex}`,
          };

          columns.forEach((column, columnIndex) => {
            rowObject[column] = row[columnIndex];
          });

          return rowObject;
        });

        setSampleDataColumns(mappedColumns);
        setSampleDataRows(mappedRows);
        setSampleDataFetchedFor(sampleDataTarget);
      } catch (error: any) {
        console.error("Failed to fetch sample data:", error);
        setSampleDataError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load sample data.",
        );
        setSampleDataFetchedFor(sampleDataTarget);
      } finally {
        setIsSampleDataLoading(false);
      }
    },
    [
      sampleDataFetchedFor,
      isSampleDataLoading,
      sampleDataTarget,
      viewDetail?.sync_status,
      viewId,
    ],
  );

  useEffect(() => {
    setSampleDataRows([]);
    setSampleDataColumns([]);
    setSampleDataError(null);
    setSampleDataFetchedFor(null);
  }, [sampleDataTarget, viewId]);

  useEffect(() => {
    if (
      activePageTab === "sync-config" &&
      !syncConfig &&
      !isSyncConfigLoading
    ) {
      fetchSyncConfig();
    }
  }, [activePageTab, syncConfig, isSyncConfigLoading, fetchSyncConfig]);

  useEffect(() => {
    if (
      activePageTab === "sample-data" &&
      viewDetail?.sync_status === "success" &&
      !isSampleDataLoading
    ) {
      void fetchSampleData();
    }
  }, [
    activePageTab,
    fetchSampleData,
    isSampleDataLoading,
    viewDetail?.sync_status,
  ]);

  useEffect(() => {
    if (viewDetail && queryTabs.length === 0) {
      const target =
        viewDetail.sync_config?.iceberg_table ||
        `${viewDetail.source_schema || "schema"}.${viewDetail.source_table || "table"}`;
      addQueryTab(`SELECT * FROM ${target}`);
    }
  }, [viewDetail, queryTabs.length]);

  const handleExecuteQuery = useCallback(
    async (
      openNewTab: boolean = false,
      queryOverride?: string,
      isAutoRun: boolean = false,
    ) => {
      const targetQueryTabId = activeQueryTabId;
      if (!targetQueryTabId) return;
      const currentTab = queryTabs.find((t) => t.id === targetQueryTabId);
      if (!currentTab) return;

      let executeQuerySql = "";
      if (queryOverride) {
        executeQuerySql = queryOverride;
      } else if (isAutoRun) {
        executeQuerySql = currentTab.query;
      } else {
        // Manual trigger: check selection first, fallback to full query
        const selection = editorRef.current?.getSelection();
        const selectedText = selection
          ? editorRef.current?.getModel().getValueInRange(selection)
          : "";
        if (selectedText && selectedText.trim().length > 0) {
          executeQuerySql = selectedText;
        } else {
          executeQuerySql = currentTab.query;
        }
      }

      if (!executeQuerySql || executeQuerySql.trim().length === 0) {
        message.warning("Query workspace is empty.");
        return;
      }
      const currentQuery = executeQuerySql;

      const tabId =
        openNewTab || currentTab.resultTabs.length === 0
          ? `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`
          : currentTab.activeResultTabId!;

      const timestamp = dayjs().format("HH:mm:ss");

      if (openNewTab || currentTab.resultTabs.length === 0) {
        updateQueryTab(targetQueryTabId, (prev) => {
          const nextResultNumber = prev.resultTabs.length + 1;
          const newResultTab: ResultTab = {
            id: tabId,
            name: `Result ${nextResultNumber}`,
            query: currentQuery,
            data: [],
            columns: [],
            status: "loading",
            timestamp,
          };
          return {
            resultTabs: [...prev.resultTabs, newResultTab],
            activeResultTabId: tabId,
          };
        });
      } else {
        updateQueryTab(targetQueryTabId, (prev) => ({
          resultTabs: prev.resultTabs.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  status: "loading",
                  query: currentQuery,
                  timestamp,
                }
              : t,
          ),
        }));
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setIsExecuting(true);
        const res = await serviceService.executeTrinoQuery(
          {
            sql: currentQuery,
            catalog: "iceberg",
            schema: "catalog_views",
            limit: 10,
          },
          controller.signal,
        );

        const { columns = [], rows = [] } =
          (res as { columns?: string[]; rows?: any[][] }) || {};

        const newCols = columns.map((col) => ({
          title: col
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          dataIndex: col,
          key: col,
          ellipsis: true,
          render: (val: any) => {
            if (val === null || val === undefined)
              return <span className="text-slate-400 italic">null</span>;
            if (typeof val === "object") {
              const strVal = JSON.stringify(val);
              return (
                <Tooltip title={strVal}>
                  <span className="text-slate-500 truncate block max-w-[200px] cursor-help">
                    {strVal}
                  </span>
                </Tooltip>
              );
            }
            return <span className="text-slate-700">{String(val)}</span>;
          },
        }));

        const mappedData = rows.map((rowArray, idx) => {
          const rowObj: any = { __uid: `${tabId}-${idx}` };
          columns.forEach((col, colIdx) => {
            rowObj[col] = rowArray[colIdx];
          });
          return rowObj;
        });

        updateQueryTab(targetQueryTabId, (prev) => ({
          resultTabs: prev.resultTabs.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  data: mappedData,
                  columns: newCols,
                  status: "success",
                }
              : t,
          ),
        }));
        message.success("Query executed successfully.");
      } catch (err: any) {
        if (err.name === "AbortError" || err.message === "canceled") {
          updateQueryTab(targetQueryTabId, (prev) => ({
            resultTabs: prev.resultTabs.map((t) =>
              t.id === tabId
                ? {
                    ...t,
                    status: "error",
                    error: "Query execution was cancelled by the user.",
                  }
                : t,
            ),
          }));
          return;
        }
        console.error("Query Execution Error:", err);
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to execute query.";
        updateQueryTab(targetQueryTabId, (prev) => ({
          resultTabs: prev.resultTabs.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  status: "error",
                  error: errorMsg,
                }
              : t,
          ),
        }));
        message.error("Failed to execute query.");
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          setIsExecuting(false);
        }
      }
    },
    [activeQueryTabId, queryTabs, updateQueryTab],
  );

  const handleCancelQuery = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsExecuting(false);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    registerSqlAutocomplete(monaco);
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const selection = editor.getSelection();
      const selectedText = selection
        ? editor.getModel().getValueInRange(selection)
        : "";

      if (selectedText && selectedText.trim().length > 0) {
        handleExecuteQuery(false, selectedText);
      } else {
        handleExecuteQuery(false);
      }
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sqlParam = searchParams.get("sql");
    if (sqlParam && queryTabs.length > 0 && activeQueryTabId) {
      updateQueryTab(activeQueryTabId, { query: decodeURIComponent(sqlParam) });
    }
  }, [queryTabs.length, activeQueryTabId]);

  useEffect(() => {
    if (!latestViewSyncNotification) {
      return;
    }

    setViewDetail((prev) => {
      if (!prev) {
        return prev;
      }

      const nextStatus = latestViewSyncNotification.status || prev.sync_status;
      const nextError = latestViewSyncNotification.error_message || null;

      if (
        prev.sync_status === nextStatus &&
        (prev.sync_error || null) === nextError
      ) {
        return prev;
      }

      return {
        ...prev,
        sync_status: nextStatus,
        sync_error: nextError || undefined,
      };
    });
  }, [latestViewSyncNotification]);

  useEffect(() => {
    if (!syncRequestedAt || !latestViewSyncNotification) {
      return;
    }

    const notificationTime = getNotificationTimestamp(latestViewSyncNotification);
    if (!notificationTime || notificationTime < syncRequestedAt) {
      return;
    }

    const latestStatus = latestViewSyncNotification.status || "syncing";
    if (isInProgressSyncStatus(latestStatus)) {
      return;
    }

    setSyncRequestedAt(null);

    if (isSuccessfulSyncStatus(latestStatus)) {
      void fetchSampleData(true);
      setSyncAlert({
        type: "success",
        message: "Sync completed successfully",
        description:
          latestViewSyncNotification.catalog_view_name ||
          "The catalog view sync has completed successfully.",
      });
      return;
    }

    setSyncAlert({
      type: "error",
      message: "Sync failed",
      description:
        latestViewSyncNotification.error_message ||
        "The catalog view sync failed. Please review the latest sync details.",
    });
  }, [fetchSampleData, syncRequestedAt, latestViewSyncNotification]);

  const handleSync = async () => {
    if (!viewDetail?.id) return;
    try {
      setSyncAlert(null);
      setSyncRequestedAt(Date.now());
      setIsSyncing(true);
      setViewDetail((prev) =>
        prev
          ? {
              ...prev,
              sync_status: "syncing",
              sync_error: undefined,
            }
          : prev,
      );
      await serviceService.syncCatalogView(viewDetail.id, {
        sync_data: true,
        force: false,
      });
      await queryClient.invalidateQueries({ queryKey: NOTIFICATION_FEED_QUERY_KEY });
      message.info("Sync started. Status will update automatically.");
    } catch (err: any) {
      console.error(err);
      setSyncRequestedAt(null);
      message.error(err?.response?.data?.message || "Failed to trigger sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    // { label: "Data", href: "/explore/object-resources" },
    { label: "Catalog Views", href: "/explore/object-resources" },
    { label: viewDetail?.display_name || "Loading..." },
  ];

  const isInitialMount = useRef(true);
  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await serviceService.getCatalogViewById(viewId);
      setViewDetail(resp);
    } catch (err) {
      console.error("Failed to fetch catalog view detail:", err);
      message.error("Failed to load catalog view details.");
    } finally {
      setLoading(false);
    }
  }, [viewId]);

  useEffect(() => {
    if (isInitialMount.current) {
      fetchDetail();
      isInitialMount.current = false;
    }
  }, [fetchDetail]);

  const getStatusConfig = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === "success")
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]",
      };
    if (s === "failed")
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-500",
      };
    if (
      s === "syncing" ||
      s === "running" ||
      s === "pending" ||
      s === "queued" ||
      s === "in_progress"
    )
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.4)]",
      };
    if (s === "never" || !s)
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };
    return {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
    };
  };

  const statusConfig = getStatusConfig(viewDetail?.sync_status);
  const isSyncSuccess = isSuccessfulSyncStatus(viewDetail?.sync_status);
  const shouldLockCreatedFlowActions = isCreatedFlow && !isSyncSuccess;
  const isSyncButtonDisabled =
    shouldLockCreatedFlowActions ||
    isSyncing ||
    isInProgressSyncStatus(viewDetail?.sync_status);

  useEffect(() => {
    if (!isCreatedFlow || !viewDetail) {
      return;
    }

    const currentStatus = viewDetail.sync_status || "syncing";

    if (isInProgressSyncStatus(currentStatus)) {
      setSyncAlert({
        type: "info",
        message: "Catalog view is syncing",
        description:
          "The catalog view is still being prepared. Sample Data and Sync Now will unlock after the first successful sync.",
      });
      return;
    }

    if (isSuccessfulSyncStatus(currentStatus)) {
      setSyncAlert({
        type: "success",
        message: "Catalog view is ready",
        description:
          "Initial sync completed successfully. Sample Data and sync actions are now available.",
      });
      return;
    }

    setSyncAlert({
      type: "error",
      message: "Initial sync failed",
      description:
        viewDetail.sync_error ||
        "The first sync did not complete successfully. This catalog view will remain locked until it reaches success.",
    });
  }, [isCreatedFlow, viewDetail]);

  if (loading) {
    return (
      <div className="p-8 space-y-8 h-full bg-[#FAFAFA] animate-in fade-in">
        <Skeleton active paragraph={{ rows: 2 }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton.Node active style={{ width: "100%", height: 300 }} />
          <Skeleton.Node active style={{ width: "100%", height: 300 }} />
        </div>
      </div>
    );
  }

  if (!viewDetail) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FAFAFA] animate-in fade-in">
        <Alert
          type="error"
          message={<span className="font-semibold">Resource Not Found</span>}
          description={
            <span className="text-[13px]">
              The requested catalog view could not be located or you lack
              permissions to view it.
            </span>
          }
          showIcon
          icon={<AlertTriangle className="mt-1" />}
          className="max-w-md border-red-200 bg-red-50 rounded-xl"
        />
      </div>
    );
  }

  const configData = viewDetail.sync_config
    ? Object.entries(viewDetail.sync_config).map(([key, value]) => ({
        key,
        value,
      }))
    : [];

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto pb-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                <Layers size={20} />
              </div>
              <div className="flex flex-col w-full">
                <PageHeader
                  title={viewDetail.display_name || viewDetail.name}
                  description={
                    viewDetail.description ||
                    "No description provided for this resource."
                  }
                  breadcrumbItems={breadcrumbItems}
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded uppercase font-medium tracking-wider">
                    ID: {viewDetail.id}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-medium">
                    {viewDetail.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full justify-start lg:w-auto lg:justify-end">
              <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-end lg:gap-6">
                {/* {viewDetail.sync_mode === "on_demand" && (
                  <Tooltip title="Trigger Manual Sync">
                    <Button
                      icon={
                        <RefreshCw
                          size={14}
                          className={cn(isSyncing && "animate-spin")}
                        />
                      }
                      onClick={handleSync}
                      loading={isSyncing}
                      disabled={isSyncButtonDisabled}
                      className="flex h-9 items-center justify-center rounded-md border-slate-200 bg-white px-4 font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      Sync Now
                    </Button>
                  </Tooltip>
                )} */}

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Status:
                  </span>
                  <div
                    className={cn(
                      "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
                      statusConfig.bg,
                      statusConfig.text,
                      statusConfig.border,
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dot)}
                    />
                    {viewDetail.sync_status || "Never"}
                  </div>
                </div>

                {viewDetail.sync_mode === "on_demand" && (
                  <Tooltip title="Trigger Manual Sync">
                    <Button
                      icon={
                        <RefreshCw
                          size={14}
                          className={cn(isSyncing && "animate-spin")}
                        />
                      }
                      onClick={handleSync}
                      loading={isSyncing}
                      disabled={isSyncButtonDisabled}
                      className="flex h-9 items-center justify-center rounded-md border-slate-200 bg-white px-4 font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      Sync Now
                    </Button>
                  </Tooltip>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col">
          {syncAlert && (
            <Alert
              type={syncAlert.type}
              showIcon
              closable
              onClose={() => setSyncAlert(null)}
              title={<span className="font-semibold">{syncAlert.message}</span>}
              description={syncAlert.description}
                className={cn(
                  "mb-4 rounded-xl border shadow-sm",
                  syncAlert.type === "success"
                    ? "border-emerald-200 bg-emerald-50"
                    : syncAlert.type === "info"
                      ? "border-blue-200 bg-blue-50"
                      : "border-red-200 bg-red-50",
                )}
              />
            )}

          <Tabs
            activeKey={activePageTab}
            onChange={(key) => setActivePageTab(key)}
            className="custom-detail-tabs"
            items={[
              {
                key: "overview",
                label: (
                  <div className="flex items-center gap-2">
                    <LayoutDashboard size={14} />
                    <span>Overview</span>
                  </div>
                ),
                children: (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4">
                    {viewDetail.sync_error && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <ShieldAlert
                          size={18}
                          className="text-red-500 mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col">
                          <h4 className="text-[13px] font-semibold text-red-800">
                            Synchronization Error Detected
                          </h4>
                          <span className="text-[12px] font-mono text-red-600/80 mt-1 whitespace-pre-wrap">
                            {viewDetail.sync_error}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Column 1: Overview & Source Information */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
                          <Database size={14} className="text-slate-400" />{" "}
                          General Overview
                        </h3>

                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                              Source Schema
                            </span>
                            {viewDetail.source_schema ? (
                              <span className="text-[12px] font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded w-fit">
                                {viewDetail.source_schema}
                              </span>
                            ) : (
                              <span className="text-[13px] text-slate-400">
                                —
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                              Source Table
                            </span>
                            {viewDetail.source_table ? (
                              <span className="text-[12px] font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded w-fit">
                                {viewDetail.source_table}
                              </span>
                            ) : (
                              <span className="text-[13px] text-slate-400">
                                —
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                              Object Type
                            </span>
                            {viewDetail.source_object_type ? (
                              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded uppercase tracking-widest w-fit">
                                {viewDetail.source_object_type}
                              </span>
                            ) : (
                              <span className="text-[13px] text-slate-400">
                                —
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                              Connection ID
                            </span>
                            {viewDetail.source_connection_id ? (
                              <span className="text-[12px] font-mono text-slate-500">
                                {viewDetail.source_connection_id}
                              </span>
                            ) : (
                              <span className="text-[13px] text-slate-400 italic">
                                Not Configured
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                              Created At
                            </span>
                            <span className="text-[12px] font-medium text-slate-700">
                              {viewDetail.created_at
                                ? dayjs(viewDetail.created_at).format(
                                    "MMM D, YYYY h:mm A",
                                  )
                                : "—"}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                              Updated At
                            </span>
                            <span className="text-[12px] font-medium text-slate-700">
                              {viewDetail.updated_at
                                ? dayjs(viewDetail.updated_at).format(
                                    "MMM D, YYYY h:mm A",
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Sync & Configuration Details */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
                          <Activity size={14} className="text-slate-400" /> Sync
                          & Configuration
                        </h3>

                        <div className="flex flex-col gap-6">
                          {/* Sync Metadata Highlights */}
                          <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex-1 flex flex-col gap-1.5 min-w-[100px]">
                              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
                                <Settings size={12} /> Mode
                              </span>
                              <span className="text-[13px] font-medium text-slate-900 capitalize">
                                {viewDetail.sync_mode || "Manual"}
                              </span>
                            </div>
                            <div className="w-px bg-slate-200 hidden sm:block" />
                            <div className="flex-1 flex flex-col gap-1.5 min-w-[120px]">
                              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
                                <Clock size={12} /> Last Synced
                              </span>
                              <span className="text-[13px] font-medium text-slate-900">
                                {viewDetail.last_synced_at ? (
                                  dayjs(viewDetail.last_synced_at).fromNow()
                                ) : (
                                  <span className="italic text-slate-400 text-[12px]">
                                    Not synced yet
                                  </span>
                                )}
                              </span>
                            </div>
                            {viewDetail.cron_expr && (
                              <>
                                <div className="w-px bg-slate-200 hidden sm:block" />
                                <div className="flex-1 flex flex-col gap-1.5 min-w-[100px]">
                                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
                                    <Calendar size={12} /> Schedule
                                  </span>
                                  <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px] w-fit">
                                    {viewDetail.cron_expr}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Dynamic Sync Configuration Table */}
                          <div className="flex flex-col gap-3 mt-2">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 m-0">
                              <Hash size={14} className="text-slate-400" />{" "}
                              Technical Configuration
                            </h4>

                            {configData.length > 0 ? (
                              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <Table
                                  dataSource={configData}
                                  pagination={false}
                                  showHeader={false}
                                  size="small"
                                  columns={[
                                    {
                                      dataIndex: "key",
                                      width: "40%",
                                      render: (text) => (
                                        <span className="text-[12px] font-medium text-slate-500">
                                          {text}
                                        </span>
                                      ),
                                    },
                                    {
                                      dataIndex: "value",
                                      render: (val: any) => {
                                        const stringVal =
                                          val === null || val === undefined
                                            ? "null"
                                            : String(val);
                                        const isNull =
                                          val === null || val === undefined;

                                        return (
                                          <Tooltip
                                            title={stringVal}
                                            mouseEnterDelay={0.5}
                                          >
                                            <span
                                              className={cn(
                                                "text-[12px] font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 inline-block truncate max-w-[280px]",
                                                isNull
                                                  ? "text-slate-400 italic"
                                                  : "text-slate-900",
                                              )}
                                            >
                                              {stringVal}
                                            </span>
                                          </Tooltip>
                                        );
                                      },
                                    },
                                  ]}
                                  className="custom-explore-table"
                                />
                              </div>
                            ) : (
                              <div className="p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                                <Settings
                                  size={20}
                                  className="text-slate-300 mb-2"
                                />
                                <span className="text-[13px] font-medium text-slate-600">
                                  No configuration mapped
                                </span>
                                <span className="text-[12px] text-slate-400 mt-0.5">
                                  This view has no technical parameters.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ),
              },
              {
                key: "column-info",
                label: (
                  <div className="flex items-center gap-2">
                    <TableIcon size={14} />
                    <span>Column Info</span>
                  </div>
                ),
                children: (
                  <div className="mt-4 animate-in fade-in duration-500">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <TableIcon size={16} className="text-slate-400" />
                          <h3 className="m-0 text-[12px] font-semibold uppercase tracking-wider text-slate-800">
                            Column Information
                          </h3>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {overviewColumns.length} columns
                        </span>
                      </div>

                      {overviewColumns.length > 0 ? (
                        <Table<ColumnMetadataRow>
                          dataSource={overviewColumns}
                          rowKey="key"
                          pagination={false}
                          size="small"
                          scroll={{ x: "max-content" }}
                          columns={overviewColumnTableColumns}
                          className="custom-column-info-table"
                          locale={{
                            emptyText: (
                              <div className="py-8 text-center">
                                <p className="text-sm font-medium text-slate-700">
                                  No column metadata available
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Column information for this catalog view will
                                  appear here when the API returns it.
                                </p>
                              </div>
                            ),
                          }}
                        />
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                          <p className="text-sm font-medium text-slate-700">
                            No column metadata available
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Name, data type, description, and other column
                            attributes for this catalog view will appear here
                            when provided by the API.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "sample-data",
                label: (
                  <div className="flex items-center gap-2">
                    <TableIcon size={14} />
                    <span>Sample Data</span>
                  </div>
                ),
                disabled: viewDetail?.sync_status !== "success",
                children: (
                  <div className="mt-4 flex flex-col gap-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                          Preview
                        </span>
                        <span className="text-[14px] font-medium text-slate-800">
                          Top 50 rows from {sampleDataTarget || "the synced table"}
                        </span>
                      </div>
                      <Button
                        onClick={() => void fetchSampleData(true)}
                        loading={isSampleDataLoading}
                        disabled={viewDetail?.sync_status !== "success"}
                        icon={
                          <RefreshCw
                            size={14}
                            className={cn(isSampleDataLoading && "animate-spin")}
                          />
                        }
                        className="h-9 rounded-md border-slate-200 bg-white px-4 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        Refresh Sample
                      </Button>
                    </div>

                    {sampleDataError ? (
                      <Alert
                        type="error"
                        showIcon
                        title={
                          <span className="font-semibold">
                            Unable to load sample data
                          </span>
                        }
                        description={sampleDataError}
                        className="rounded-xl border border-red-200 bg-red-50"
                      />
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <Table
                          dataSource={sampleDataRows}
                          columns={sampleDataColumns}
                          rowKey="__rowKey"
                          loading={isSampleDataLoading}
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            className:
                              "px-4 py-3 border-t border-slate-100 !mb-0",
                          }}
                          scroll={{ x: "max-content" }}
                          className="custom-sample-data-table"
                          locale={{
                            emptyText:
                              viewDetail?.sync_status !== "success" ? (
                                <div className="py-10 text-center">
                                  <p className="text-sm font-medium text-slate-700">
                                    Sample data is available after a successful
                                    sync.
                                  </p>
                                </div>
                              ) : (
                                <div className="py-10 text-center">
                                  <p className="text-sm font-medium text-slate-700">
                                    No sample rows found
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Try refreshing after the next sync completes.
                                  </p>
                                </div>
                              ),
                          }}
                        />
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "sync-config",
                label: (
                  <div className="flex items-center gap-2">
                    <Settings size={14} />
                    <span>Sync Configurations</span>
                  </div>
                ),
                children: (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4">
                    {isSyncConfigLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton.Node
                          active
                          style={{ width: "100%", height: 320 }}
                        />
                        <Skeleton.Node
                          active
                          style={{ width: "100%", height: 320 }}
                        />
                      </div>
                    ) : syncConfig ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Sync Config Section */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
                            <Activity size={14} className="text-slate-400" />{" "}
                            Sync Config
                          </h3>

                          <div className="grid grid-cols-1 gap-4">
                            {[
                              {
                                label: "Iceberg Table",
                                value: syncConfig.sync_config.iceberg_table,
                                isMono: true,
                              },
                              {
                                label: "Last Export Rows",
                                value: syncConfig.sync_config.last_export_rows,
                              },
                              {
                                label: "Last Iceberg Table",
                                value:
                                  syncConfig.sync_config.last_iceberg_table,
                                isMono: true,
                              },
                              {
                                label: "Last Airflow Run ID",
                                value:
                                  syncConfig.sync_config.last_airflow_run_id,
                                isMono: true,
                              },
                              {
                                label: "Current Airflow Run ID",
                                value:
                                  syncConfig.sync_config.current_airflow_run_id,
                                isMono: true,
                              },
                              {
                                label: "Last Export Finished At",
                                value: syncConfig.sync_config
                                  .last_export_finished_at
                                  ? dayjs(
                                      syncConfig.sync_config
                                        .last_export_finished_at,
                                    ).format("MMM D, YYYY h:mm:ss A")
                                  : null,
                              },
                              {
                                label: "Last Export Columns",
                                value: syncConfig.sync_config
                                  .last_export_columns?.length
                                  ? syncConfig.sync_config.last_export_columns.join(
                                      ", ",
                                    )
                                  : null,
                              },
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                              >
                                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                                  {item.label}
                                </span>
                                <span
                                  className={cn(
                                    "text-[13px] text-slate-700 font-medium break-all",
                                    item.isMono &&
                                      "font-mono text-[12px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-fit",
                                  )}
                                >
                                  {item.value !== null &&
                                  item.value !== undefined
                                    ? String(item.value)
                                    : "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Effective Config Section */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
                            <ShieldCheck size={14} className="text-slate-400" />{" "}
                            Effective Config
                          </h3>

                          <div className="grid grid-cols-1 gap-4">
                            {[
                              {
                                label: "Batch Size",
                                value: syncConfig.effective_config.batch_size,
                              },
                              {
                                label: "Max Rows Per Table",
                                value:
                                  syncConfig.effective_config
                                    .max_rows_per_table,
                              },
                              {
                                label: "Parquet Compression",
                                value:
                                  syncConfig.effective_config
                                    .parquet_compression,
                              },
                              {
                                label: "Parquet Partition Col",
                                value:
                                  syncConfig.effective_config
                                    .parquet_partition_col,
                                isMono: true,
                              },
                              {
                                label: "Max Concurrent Syncs",
                                value:
                                  syncConfig.effective_config
                                    .max_concurrent_syncs,
                              },
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                              >
                                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                                  {item.label}
                                </span>
                                <span
                                  className={cn(
                                    "text-[13px] text-slate-700 font-medium",
                                    item.isMono &&
                                      "font-mono text-[12px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-fit",
                                  )}
                                >
                                  {item.value !== null &&
                                  item.value !== undefined
                                    ? String(item.value)
                                    : "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                        <Settings size={32} className="text-slate-300 mb-4" />
                        <span className="text-[14px] font-semibold text-slate-600">
                          No sync configuration available
                        </span>
                        <span className="text-[12px] text-slate-400 mt-1">
                          We couldn't retrieve the configuration for this
                          catalog view.
                        </span>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      <style jsx global>{`
        /* Modern Table "Ghost" Styles for Config Table */
        .custom-explore-table .ant-table {
          background: transparent !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        .custom-explore-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}
