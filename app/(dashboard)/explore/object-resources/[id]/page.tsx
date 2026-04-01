"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { message, Alert, Skeleton, Table, Button, Tooltip, Tabs, Dropdown, Space } from "antd";
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
  Table as TableIcon
} from "lucide-react";
import type { MenuProps } from "antd";
import Editor from "@monaco-editor/react";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogView } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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

export default function ExploreObjectResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const viewId = params.id as string;

  const [viewDetail, setViewDetail] = useState<CatalogView | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sqlQuery, setSqlQuery] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [resultTabs, setResultTabs] = useState<ResultTab[]>([]);
  const [activeResultTabId, setActiveResultTabId] = useState<string | null>(null);
  const [activePageTab, setActivePageTab] = useState("overview");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (activePageTab === "sql-editor" && resultTabs.length === 0 && !isExecuting && sqlQuery) {
      handleExecuteQuery(false);
    }
  }, [activePageTab, resultTabs.length, isExecuting, sqlQuery]);

  useEffect(() => {
    if (viewDetail && !sqlQuery) {
      const target = viewDetail.sync_config?.iceberg_table || 
                     `${viewDetail.source_schema || 'schema'}.${viewDetail.source_table || 'table'}`;
      setSqlQuery(`SELECT * FROM ${target}`);
    }
  }, [viewDetail, sqlQuery]);

  const handleExecuteQuery = async (openNewTab: boolean = false, queryOverride?: string) => {
    const currentQuery = queryOverride || sqlQuery;
    if (!currentQuery) return;
    
    const tabId = (openNewTab || resultTabs.length === 0) ? Date.now().toString() : activeResultTabId!;
    const existingTab = resultTabs.find(t => t.id === tabId);
    const tabName = existingTab?.name || `Result ${resultTabs.length + 1}`;

    const loadingTab: ResultTab = {
      id: tabId,
      name: tabName,
      query: currentQuery,
      data: [],
      columns: [],
      status: "loading",
      timestamp: dayjs().format("HH:mm:ss")
    };

    if (openNewTab || resultTabs.length === 0) {
      setResultTabs(prev => [...prev, loadingTab]);
      setActiveResultTabId(tabId);
    } else {
      setResultTabs(prev => prev.map(t => t.id === tabId ? loadingTab : t));
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsExecuting(true);
      const res = await serviceService.executeTrinoQuery({
        sql: currentQuery,
        catalog: "iceberg",
        schema: "catalog_views",
        limit: 10
      }, controller.signal);
      
      const { columns = [], rows = [] } = (res as { columns?: string[], rows?: any[][] }) || {};
      
      const newCols = columns.map(col => ({
        title: col.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        dataIndex: col,
        key: col,
        ellipsis: true,
        render: (val: any) => {
          if (val === null || val === undefined) return <span className="text-slate-400 italic">null</span>;
          if (typeof val === 'object') {
            const strVal = JSON.stringify(val);
            return <Tooltip title={strVal}><span className="text-slate-500 truncate block max-w-[200px] cursor-help">{strVal}</span></Tooltip>;
          }
          return <span className="text-slate-700">{String(val)}</span>;
        }
      }));

      const mappedData = rows.map((rowArray, idx) => {
        const rowObj: any = { __uid: `${tabId}-${idx}` };
        columns.forEach((col, colIdx) => {
          rowObj[col] = rowArray[colIdx];
        });
        return rowObj;
      });

      const successTab: ResultTab = {
        ...loadingTab,
        data: mappedData,
        columns: newCols,
        status: "success"
      };

      setResultTabs(prev => prev.map(t => t.id === tabId ? successTab : t));
      message.success("Query executed successfully.");
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        const cancelTab: ResultTab = {
          ...loadingTab,
          status: "error",
          error: "Query execution was cancelled by the user."
        };
        setResultTabs(prev => prev.map(t => t.id === tabId ? cancelTab : t));
        return;
      }
      console.error("Query Execution Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to execute query.";
      const errorTab: ResultTab = {
        ...loadingTab,
        status: "error",
        error: errorMsg
      };
      setResultTabs(prev => prev.map(t => t.id === tabId ? errorTab : t));
      message.error("Failed to execute query.");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsExecuting(false);
      }
    }
  };

  const handleCancelQuery = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsExecuting(false);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const selection = editor.getSelection();
      const selectedText = selection ? editor.getModel().getValueInRange(selection) : "";
      
      if (selectedText && selectedText.trim().length > 0) {
        handleExecuteQuery(true, selectedText);
      } else {
        handleExecuteQuery(false);
      }
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sqlParam = searchParams.get("sql");
    if (sqlParam) {
      setSqlQuery(decodeURIComponent(sqlParam));
    }
  }, []);

  useEffect(() => {
    if (viewDetail && !sqlQuery) {
      const target = viewDetail.sync_config?.iceberg_table || 
                     `${viewDetail.source_schema || 'schema'}.${viewDetail.source_table || 'table'}`;
      setSqlQuery(`SELECT * FROM ${target}`);
    }
  }, [viewDetail, sqlQuery]);

  const handleSync = async () => {
    if (!viewDetail?.id) return;
    try {
      setIsSyncing(true);
      const res = await serviceService.syncCatalogView(viewDetail.id, { sync_data: true, force: false });
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
    { label: "Data", href: "/explore/object-resources" },
    { label: "Object Resources", href: "/explore/object-resources" },
    { label: viewDetail?.display_name || "Loading..." },
  ];

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
    fetchDetail();
  }, [fetchDetail]);

  const getStatusConfig = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === "success") return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" };
    if (s === "failed") return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
    if (s === "never" || !s) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
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
          description={<span className="text-[13px]">The requested catalog view could not be located or you lack permissions to view it.</span>}
          showIcon
          icon={<AlertTriangle className="mt-1" />}
          className="max-w-md border-red-200 bg-red-50 rounded-xl"
        />
      </div>
    );
  }

  const configData = viewDetail.sync_config ? Object.entries(viewDetail.sync_config).map(([key, value]) => ({ key, value })) : [];

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
                  description={viewDetail.description || "No description provided for this resource."}
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
                    icon={<RefreshCw size={14} className={cn(isSyncing && "animate-spin")} />}
                    onClick={handleSync}
                    loading={isSyncing}
                    className="flex items-center h-9 px-4 rounded-md border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 font-medium transition-all shadow-sm"
                  >
                    Sync Now
                  </Button>
                </Tooltip>
              )}
              
              <div className="flex flex-col items-end border-l border-slate-200 pl-4 ml-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-widest mb-1">Status</span>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border capitalize",
                  statusConfig.bg, statusConfig.text, statusConfig.border
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
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
                label: <div className="flex items-center gap-2"><LayoutDashboard size={14} /><span>Overview</span></div>,
                children: (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4">
                    {viewDetail.sync_error && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <ShieldAlert size={18} className="text-red-500 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <h4 className="text-[13px] font-semibold text-red-800">Synchronization Error Detected</h4>
                          <span className="text-[12px] font-mono text-red-600/80 mt-1 whitespace-pre-wrap">{viewDetail.sync_error}</span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      
                      {/* Column 1: Overview & Source Information */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
                          <Database size={14} className="text-slate-400" /> General Overview
                        </h3>
                        
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Source Schema</span>
                            {viewDetail.source_schema ? (
                              <span className="text-[12px] font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded w-fit">
                                {viewDetail.source_schema}
                              </span>
                            ) : <span className="text-[13px] text-slate-400">—</span>}
                          </div>

                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Source Table</span>
                            {viewDetail.source_table ? (
                              <span className="text-[12px] font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded w-fit">
                                {viewDetail.source_table}
                              </span>
                            ) : <span className="text-[13px] text-slate-400">—</span>}
                          </div>

                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Object Type</span>
                            {viewDetail.source_object_type ? (
                              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded uppercase tracking-widest w-fit">
                                {viewDetail.source_object_type}
                              </span>
                            ) : <span className="text-[13px] text-slate-400">—</span>}
                          </div>

                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Connection ID</span>
                            {viewDetail.source_connection_id ? (
                              <span className="text-[12px] font-mono text-slate-500">
                                {viewDetail.source_connection_id}
                              </span>
                            ) : <span className="text-[13px] text-slate-400 italic">Not Configured</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created At</span>
                            <span className="text-[12px] font-medium text-slate-700">
                              {viewDetail.created_at ? dayjs(viewDetail.created_at).format("MMM D, YYYY h:mm A") : "—"}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Updated At</span>
                            <span className="text-[12px] font-medium text-slate-700">
                              {viewDetail.updated_at ? dayjs(viewDetail.updated_at).format("MMM D, YYYY h:mm A") : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Sync & Configuration Details */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
                          <Activity size={14} className="text-slate-400" /> Sync & Configuration
                        </h3>
                        
                        <div className="flex flex-col gap-6">
                          {/* Sync Metadata Highlights */}
                          <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex-1 flex flex-col gap-1.5 min-w-[100px]">
                              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5"><Settings size={12}/> Mode</span>
                              <span className="text-[13px] font-medium text-slate-900 capitalize">{viewDetail.sync_mode || "Manual"}</span>
                            </div>
                            <div className="w-px bg-slate-200 hidden sm:block" />
                            <div className="flex-1 flex flex-col gap-1.5 min-w-[120px]">
                              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5"><Clock size={12}/> Last Synced</span>
                              <span className="text-[13px] font-medium text-slate-900">
                                {viewDetail.last_synced_at ? dayjs(viewDetail.last_synced_at).fromNow() : <span className="italic text-slate-400 text-[12px]">Not synced yet</span>}
                              </span>
                            </div>
                            {viewDetail.cron_expr && (
                              <>
                                <div className="w-px bg-slate-200 hidden sm:block" />
                                <div className="flex-1 flex flex-col gap-1.5 min-w-[100px]">
                                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5"><Calendar size={12} /> Schedule</span>
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
                              <Hash size={14} className="text-slate-400" /> Technical Configuration
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
                                      render: (text) => <span className="text-[12px] font-medium text-slate-500">{text}</span> 
                                    },
                                    { 
                                      dataIndex: "value", 
                                      render: (val: any) => {
                                        const stringVal = val === null || val === undefined ? "null" : String(val);
                                        const isNull = val === null || val === undefined;
                                        
                                        return (
                                          <Tooltip title={stringVal} mouseEnterDelay={0.5}>
                                            <span className={cn(
                                              "text-[12px] font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 inline-block truncate max-w-[280px]",
                                              isNull ? "text-slate-400 italic" : "text-slate-900"
                                            )}>
                                              {stringVal}
                                            </span>
                                          </Tooltip>
                                        );
                                      } 
                                    }
                                  ]}
                                  className="custom-explore-table"
                                />
                              </div>
                            ) : (
                              <div className="p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                                <Settings size={20} className="text-slate-300 mb-2" />
                                <span className="text-[13px] font-medium text-slate-600">No configuration mapped</span>
                                <span className="text-[12px] text-slate-400 mt-0.5">This view has no technical parameters.</span>
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
                label: <div className="flex items-center gap-2"><Terminal size={14} /><span>SQL Editor</span></div>,
                disabled: viewDetail?.sync_status !== "success",
                children: (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-500 mt-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-slate-800">Query Workspace</span>
                        <span className="text-[13px] text-slate-500">Run SQL queries against the synced catalog view data.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExecuting && (
                          <Button 
                            variant="outlined"
                            icon={<Square size={14} fill="currentColor" />} 
                            onClick={handleCancelQuery}
                            className="h-9 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                          >
                            Cancel
                          </Button>
                        )}
                        <Space.Compact className="sql-execute-dropdown">
                          <Button 
                            type="primary" 
                            icon={isExecuting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />} 
                            onClick={() => handleExecuteQuery(false)}
                            disabled={isExecuting || !sqlQuery}
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
                                    const url = new URL(window.location.href);
                                    url.searchParams.set("sql", encodeURIComponent(sqlQuery));
                                    window.open(url.toString(), "_blank");
                                  },
                                }
                              ] 
                            }}
                            disabled={isExecuting || !sqlQuery}
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
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
                      <Editor
                        height="100%"
                        defaultLanguage="sql"
                        value={sqlQuery}
                        onMount={handleEditorDidMount}
                        onChange={(value) => setSqlQuery(value || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
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
                          <TableIcon size={16} className="text-slate-400" />
                          <h4 className="text-[14px] font-semibold text-slate-800 m-0">Query Results</h4>
                          {resultTabs.length > 0 && (
                            <span className="text-[11px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                              {resultTabs.length} sets
                            </span>
                          )}
                        </div>
                        {resultTabs.length > 0 && (
                          <Button 
                            type="text" 
                            danger 
                            size="small" 
                            className="text-[11px] h-7 font-bold uppercase tracking-wider hover:bg-red-50"
                            onClick={() => {
                              setResultTabs([]);
                              setActiveResultTabId(null);
                            }}
                          >
                            Clear All
                          </Button>
                        )}
                      </div>

                      {resultTabs.length > 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                          <Tabs
                            activeKey={activeResultTabId || undefined}
                            onChange={(key) => setActiveResultTabId(key)}
                            type="editable-card"
                            hideAdd
                            onEdit={(targetKey, action) => {
                              if (action === "remove") {
                                const newTabs = resultTabs.filter(t => t.id !== targetKey);
                                setResultTabs(newTabs);
                                if (activeResultTabId === targetKey) {
                                  setActiveResultTabId(newTabs[newTabs.length - 1]?.id || null);
                                }
                              }
                            }}
                            className="custom-result-tabs"
                            items={resultTabs.map(tab => ({
                              key: tab.id,
                              label: (
                                <div className="flex items-center gap-2">
                                  <Tooltip title={`SQL: ${tab.query}`} placement="topLeft">
                                    <span className="flex items-center gap-1.5">
                                      {tab.status === 'loading' && <RefreshCw size={10} className="animate-spin text-blue-500" />}
                                      {tab.status === 'error' && <AlertTriangle size={10} className="text-red-500" />}
                                      {tab.name}
                                    </span>
                                  </Tooltip>
                                  <span className="text-[10px] opacity-40 font-mono">{tab.timestamp}</span>
                                </div>
                              ),
                              children: (
                                <div className="p-0">
                                  {tab.status === 'loading' ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                                      <Skeleton active paragraph={{ rows: 4 }} className="max-w-[80%] mx-auto" />
                                      <span className="text-[13px] text-slate-400 animate-pulse">Fetching query results...</span>
                                    </div>
                                  ) : tab.status === 'error' ? (
                                    <div className="p-6 bg-red-50/50 flex flex-col gap-4">
                                      <div className="flex items-start gap-3 p-4 bg-white border border-red-100 rounded-lg shadow-sm">
                                        <ShieldAlert size={18} className="text-red-500 mt-0.5 shrink-0" />
                                        <div className="flex flex-col gap-1.5">
                                          <span className="text-[14px] font-bold text-red-800">Query Execution Failed</span>
                                          <span className="text-[12px] font-mono text-red-600/80 leading-relaxed whitespace-pre-wrap">
                                            {tab.error}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Original Query</span>
                                        <div className="p-3 bg-slate-900 rounded-lg">
                                          <code className="text-[12px] text-slate-300 font-mono opacity-80">{tab.query}</code>
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
                                          scroll={{ x: 'max-content' }}
                                          locale={{
                                            emptyText: (
                                              <div className="py-8 text-slate-400 italic text-[13px]">
                                                Query returned no results.
                                              </div>
                                            )
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            }))}
                          />
                        </div>
                      ) : (
                        <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 mb-4 shadow-sm">
                            <Play size={20} className="text-slate-300" />
                          </div>
                          <span className="text-[14px] font-semibold text-slate-600">No active results</span>
                          <span className="text-[12px] text-slate-400 mt-1 max-w-[240px]">
                            Run a query to view data output here. You can manage multiple result sets in tabs.
                          </span>
                        </div>
                      )}
                    </div>
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
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
        .custom-explore-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}