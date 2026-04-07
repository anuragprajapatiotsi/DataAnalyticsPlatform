"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function ExploreObjectResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const viewId = params.id as string;

  const [viewDetail, setViewDetail] = useState<CatalogView | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryTabs, setQueryTabs] = useState<QueryTab[]>([]);
  const [activeQueryTabId, setActiveQueryTabId] = useState<string | null>(null);
  const [activePageTab, setActivePageTab] = useState("overview");
  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(null);
  const [isSyncConfigLoading, setIsSyncConfigLoading] = useState(false);
  const editorRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeQueryTab = queryTabs.find((t) => t.id === activeQueryTabId);

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

  const handleSync = async () => {
    if (!viewDetail?.id) return;
    try {
      setIsSyncing(true);
      const res = await serviceService.syncCatalogView(viewDetail.id, {
        sync_data: true,
        force: false,
      });
      message.success(res.message || "Manual sync triggered successfully.");
      setTimeout(fetchDetail, 1000);
    } catch (err: any) {
      console.error(err);
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
          <div className="flex justify-between items-start gap-4">
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

            <div className="flex items-center gap-3">
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
                    className="flex items-center h-9 px-4 rounded-md border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 font-medium transition-all shadow-sm"
                  >
                    Sync Now
                  </Button>
                </Tooltip>
              )}

              <div className="flex flex-col items-end border-l border-slate-200 pl-4 ml-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-widest mb-1">
                  Status
                </span>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border capitalize",
                    statusConfig.bg,
                    statusConfig.text,
                    statusConfig.border,
                  )}
                >
                  <span
                    className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)}
                  />
                  {viewDetail.sync_status || "Never"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col">
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
                key: "sql-editor",
                label: (
                  <div className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span>SQL Editor</span>
                  </div>
                ),
                disabled: viewDetail?.sync_status !== "success",
                children: (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                    <Tabs
                      type="editable-card"
                      activeKey={activeQueryTabId || undefined}
                      onChange={(key) => setActiveQueryTabId(key)}
                      onEdit={(targetKey, action) => {
                        if (action === "add") addQueryTab();
                        else if (action === "remove")
                          removeQueryTab(targetKey as string);
                      }}
                      className="sql-query-tabs"
                      items={queryTabs.map((qTab) => ({
                        key: qTab.id,
                        label: (
                          <span className="flex items-center gap-2">
                            <FileCode size={14} />
                            {qTab.name}
                          </span>
                        ),
                        children: (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-end">
                              {isExecuting && (
                                <Button
                                  variant="outlined"
                                  icon={
                                    <Square size={14} fill="currentColor" />
                                  }
                                  onClick={handleCancelQuery}
                                  className="h-9 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                                >
                                  Cancel
                                </Button>
                              )}
                              <Space.Compact className="sql-execute-dropdown">
                                <Button
                                  type="primary"
                                  icon={
                                    isExecuting ? (
                                      <RefreshCw
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Play size={14} fill="currentColor" />
                                    )
                                  }
                                  onClick={() => handleExecuteQuery(false)}
                                  disabled={isExecuting || !qTab.query}
                                  className="bg-slate-900 hover:bg-slate-800 text-white border-none h-9 px-4 rounded-l-md rounded-r-none flex items-center gap-2"
                                >
                                  {isExecuting ? "Executing..." : "Run"}
                                </Button>
                                <Dropdown
                                  menu={{
                                    items: [
                                      {
                                        key: "run_new_result_tab",
                                        label: "Run in New Tab",
                                        icon: <FileCode size={14} />,
                                        onClick: () => handleExecuteQuery(true),
                                      },
                                      { type: "divider" },
                                      {
                                        key: "run_new_tab",
                                        label: "Run in New Browser Tab",
                                        icon: <ExternalLink size={14} />,
                                        onClick: () => {
                                          const url = new URL(
                                            window.location.href,
                                          );
                                          url.searchParams.set(
                                            "sql",
                                            encodeURIComponent(qTab.query),
                                          );
                                          window.open(url.toString(), "_blank");
                                        },
                                      },
                                    ],
                                  }}
                                  disabled={isExecuting || !qTab.query}
                                  placement="bottomRight"
                                >
                                  <Button
                                    type="primary"
                                    icon={<ChevronDown size={14} />}
                                    className="bg-slate-900/90 hover:bg-slate-800 text-white border-none h-9 px-2 rounded-r-md rounded-l-none border-l border-white/10"
                                  />
                                </Dropdown>
                              </Space.Compact>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
                              <Editor
                                height="100%"
                                defaultLanguage="sql"
                                value={qTab.query}
                                onMount={handleEditorDidMount}
                                onChange={(value) =>
                                  updateQueryTab(qTab.id, {
                                    query: value || "",
                                  })
                                }
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 14,
                                  fontFamily:
                                    "'JetBrains Mono', 'Fira Code', monospace",
                                  wordWrap: "on",
                                  automaticLayout: true,
                                  scrollBeyondLastLine: false,
                                  theme: "vs-light",
                                  padding: { top: 16, bottom: 16 },
                                }}
                              />
                            </div>

                            {/* Query Results Section */}
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <div className="flex items-center gap-2">
                                  <TableIcon
                                    size={16}
                                    className="text-slate-400"
                                  />
                                  <h4 className="text-[14px] font-semibold text-slate-800 m-0">
                                    Query Results
                                  </h4>
                                  {qTab.resultTabs.length > 0 && (
                                    <span className="text-[11px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                      {qTab.resultTabs.length} sets
                                    </span>
                                  )}
                                </div>
                                {qTab.resultTabs.length > 0 && (
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    className="text-[11px] h-7 font-bold uppercase tracking-wider hover:bg-red-50"
                                    onClick={() => {
                                      updateQueryTab(qTab.id, {
                                        resultTabs: [],
                                        activeResultTabId: null,
                                      });
                                    }}
                                  >
                                    Clear All
                                  </Button>
                                )}
                              </div>

                              {qTab.resultTabs.length > 0 ? (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                  <Tabs
                                    activeKey={
                                      qTab.activeResultTabId || undefined
                                    }
                                    onChange={(key) =>
                                      updateQueryTab(qTab.id, {
                                        activeResultTabId: key,
                                      })
                                    }
                                    type="editable-card"
                                    hideAdd
                                    onEdit={(targetKey, action) => {
                                      if (action === "remove") {
                                        const newResTabs =
                                          qTab.resultTabs.filter(
                                            (t) => t.id !== targetKey,
                                          );
                                        updateQueryTab(qTab.id, {
                                          resultTabs: newResTabs,
                                          activeResultTabId:
                                            qTab.activeResultTabId === targetKey
                                              ? newResTabs[
                                                  newResTabs.length - 1
                                                ]?.id || null
                                              : qTab.activeResultTabId,
                                        });
                                      }
                                    }}
                                    className="custom-result-tabs"
                                    items={qTab.resultTabs.map((tab) => ({
                                      key: tab.id,
                                      label: (
                                        <div className="flex items-center gap-2">
                                          <Tooltip
                                            title={`SQL: ${tab.query}`}
                                            placement="topLeft"
                                          >
                                            <span className="flex items-center gap-1.5">
                                              {tab.status === "loading" && (
                                                <RefreshCw
                                                  size={10}
                                                  className="animate-spin text-blue-500"
                                                />
                                              )}
                                              {tab.status === "error" && (
                                                <AlertTriangle
                                                  size={10}
                                                  className="text-red-500"
                                                />
                                              )}
                                              {tab.name}
                                            </span>
                                          </Tooltip>
                                          <span className="text-[10px] opacity-40 font-mono">
                                            {tab.timestamp}
                                          </span>
                                        </div>
                                      ),
                                      children: (
                                        <div className="p-0">
                                          {tab.status === "loading" ? (
                                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                              <Skeleton
                                                active
                                                paragraph={{ rows: 4 }}
                                                className="max-w-[80%] mx-auto"
                                              />
                                              <span className="text-[13px] text-slate-400 animate-pulse">
                                                Fetching query results...
                                              </span>
                                            </div>
                                          ) : tab.status === "error" ? (
                                            <div className="p-6 bg-red-50/50 flex flex-col gap-4">
                                              <div className="flex items-start gap-3 p-4 bg-white border border-red-100 rounded-lg shadow-sm">
                                                <ShieldAlert
                                                  size={18}
                                                  className="text-red-500 mt-0.5 shrink-0"
                                                />
                                                <div className="flex flex-col gap-1.5">
                                                  <span className="text-[14px] font-bold text-red-800">
                                                    Query Execution Failed
                                                  </span>
                                                  <span className="text-[12px] font-mono text-red-600/80 leading-relaxed whitespace-pre-wrap">
                                                    {tab.error}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="flex flex-col gap-2">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                                  Original Query
                                                </span>
                                                <div className="p-3 bg-slate-900 rounded-lg">
                                                  <code className="text-[12px] text-slate-300 font-mono opacity-80">
                                                    {tab.query}
                                                  </code>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col">
                                              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                <Tooltip title={tab.query}>
                                                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-[500px] opacity-70">
                                                    SQL: {tab.query}
                                                  </span>
                                                </Tooltip>
                                              </div>
                                              <div className="overflow-auto max-h-[400px]">
                                                <Table
                                                  dataSource={tab.data}
                                                  columns={tab.columns}
                                                  pagination={false}
                                                  size="small"
                                                  rowKey="__uid"
                                                  className="custom-result-table"
                                                  scroll={{ x: "max-content" }}
                                                  locale={{
                                                    emptyText: (
                                                      <div className="py-8 text-slate-400 italic text-[13px]">
                                                        Query returned no
                                                        results.
                                                      </div>
                                                    ),
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ),
                                    }))}
                                  />
                                </div>
                              ) : (
                                <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 mb-4 shadow-sm">
                                    <Play
                                      size={20}
                                      className="text-slate-300"
                                    />
                                  </div>
                                  <span className="text-[14px] font-semibold text-slate-600">
                                    No active results
                                  </span>
                                  <span className="text-[12px] text-slate-400 mt-1 max-w-[240px]">
                                    Run a query to view data output here. You
                                    can manage multiple result sets in tabs.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      }))}
                    />
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
