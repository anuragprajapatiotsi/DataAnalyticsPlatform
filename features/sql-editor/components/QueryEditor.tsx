"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
  Plus,
  X,
  Play,
  Square,
  RefreshCw,
  PlusCircle,
  Loader2,
  ChevronDown,
  FileCode,
  Save,
} from "lucide-react";
import { Dropdown, Space, message } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSqlEditorContext } from "../contexts/SqlEditorContext";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { loader } from "@monaco-editor/react";
import { registerSqlAutocomplete, setAutocompleteContext } from "../services/autocomplete";
import { SaveQueryModal, type SaveQueryFormValues } from "./SaveQueryModal";
import { datasetService } from "@/features/explore/services/dataset.service";
import { domainService } from "@/features/domains/services/domain.service";
import { userService } from "@/features/users/services/user.service";
import { savedQueryService } from "../services/saved-query.service";
import type { editor as MonacoEditorType } from "monaco-editor";

const SQL_EDITOR_DRAG_DATA_TYPE = "application/x-sql-editor-table-reference";

type DragTableReferencePayload = {
  schema?: string;
  table?: string;
  reference?: string;
};

// Ensure Monaco is available window-wide for the plugin if needed,
// but @monaco-editor/react handles loader.
loader.init().then((monaco) => {
  registerSqlAutocomplete(monaco);
});

export function QueryEditor() {
  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    closeTab,
    updateTabQuery,
    executeQuery,
    cancelQuery,
  } = useSqlEditorContext();

  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingQueryUpdateRef = useRef<{ tabId: string; value: string } | null>(null);
  const previousTabIdRef = useRef<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [lastSavedQueryId, setLastSavedQueryId] = useState<string | null>(null);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const [currentEditorText, setCurrentEditorText] = useState(activeTab?.query || "");
  const activeCatalog = activeTab?.catalog;
  const activeSchema = activeTab?.schema;
  const activeQuery = activeTab?.query;

  const flushPendingQueryUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const pendingUpdate = pendingQueryUpdateRef.current;
    if (pendingUpdate) {
      updateTabQuery(pendingUpdate.tabId, pendingUpdate.value);
      pendingQueryUpdateRef.current = null;
    }
  }, [updateTabQuery]);

  const scheduleQueryUpdate = useCallback(
    (tabId: string, value: string) => {
      pendingQueryUpdateRef.current = { tabId, value };

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const pendingUpdate = pendingQueryUpdateRef.current;
        if (pendingUpdate) {
          updateTabQuery(pendingUpdate.tabId, pendingUpdate.value);
          pendingQueryUpdateRef.current = null;
        }
        debounceTimerRef.current = null;
      }, 300);
    },
    [updateTabQuery],
  );

  useEffect(() => {
    if (previousTabIdRef.current && previousTabIdRef.current !== activeTabId) {
      flushPendingQueryUpdate();
    }

    previousTabIdRef.current = activeTabId;

    if (activeSchema || activeCatalog) {
      setAutocompleteContext({
        catalog: activeCatalog,
        schema: activeSchema,
      });
    }

    const frameId = window.requestAnimationFrame(() => {
      setCurrentEditorText(editorRef.current?.getValue() ?? activeQuery ?? "");
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeTabId, activeCatalog, activeQuery, activeSchema, flushPendingQueryUpdate]);

  useEffect(
    () => () => {
      flushPendingQueryUpdate();
    },
    [flushPendingQueryUpdate],
  );

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setCurrentEditorText(editor.getValue());
    
    // Step 4: Core Keyboard Shortcut Integration
    editor.addAction({
      id: "run-query",
      label: "Run Query",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1,
      run: () => {
        handleExecute(false);
      },
    });
  };

  const insertTableReference = useCallback(
    (reference: string, clientX?: number, clientY?: number) => {
      if (!activeTab || !editorRef.current || !reference.trim()) {
        return;
      }

      const editor = editorRef.current;
      const targetPosition =
        typeof clientX === "number" && typeof clientY === "number"
          ? editor.getTargetAtClientPoint(clientX, clientY)?.position
          : undefined;
      const position = targetPosition || editor.getPosition();

      if (!position) {
        return;
      }

      const selection = editor.getSelection();
      const range =
        selection && !selection.isEmpty()
          ? selection
          : {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            };

      editor.focus();
      editor.pushUndoStop();
      editor.executeEdits("schema-explorer-drag-drop", [
        {
          range,
          text: reference,
          forceMoveMarkers: true,
        },
      ]);
      editor.pushUndoStop();

      const nextValue = editor.getValue();
      setCurrentEditorText(nextValue);
      scheduleQueryUpdate(activeTab.id, nextValue);
    },
    [activeTab, scheduleQueryUpdate],
  );

  const handleEditorDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDropZoneActive(false);

      const rawPayload =
        event.dataTransfer.getData(SQL_EDITOR_DRAG_DATA_TYPE) ||
        event.dataTransfer.getData("text/plain");

      if (!rawPayload) {
        return;
      }

      let reference = rawPayload;

      try {
        const parsed = JSON.parse(rawPayload) as DragTableReferencePayload;
        reference =
          parsed.reference ||
          (parsed.schema && parsed.table
            ? `${parsed.schema}.${parsed.table}`
            : rawPayload);
      } catch {
        reference = rawPayload;
      }

      insertTableReference(reference, event.clientX, event.clientY);
    },
    [insertTableReference],
  );

  const handleEditorChange = useCallback(
    (value?: string) => {
      const nextValue = value || "";
      setCurrentEditorText(nextValue);

      if (activeTab) {
        scheduleQueryUpdate(activeTab.id, nextValue);
      }
    },
    [activeTab, scheduleQueryUpdate],
  );

  const handleExecute = (openNewTab: boolean = false) => {
    if (!activeTabId || !editorRef.current) return;
    
    // Step 4: Selection-Aware Querying
    const selection = editorRef.current.getSelection();
    const model = editorRef.current.getModel();
    let selectedText = "";
    
    if (selection && model) {
      selectedText = model.getValueInRange(selection);
    }
    
    const editorValue = editorRef.current.getValue();
    const queryToRun = selectedText || editorValue || activeTab?.query || "";
    if (queryToRun.trim().length === 0) {
      message.warning("Please type or select a valid SQL query to execute.");
      return;
    }

    flushPendingQueryUpdate();
    executeQuery(activeTabId, selectedText || undefined, {
      openNewTab,
      queryText: editorValue,
    });
  };

  const handleCancel = () => {
    if (!activeTab || !activeTab.activeResultTabId) return;
    cancelQuery(activeTabId, activeTab.activeResultTabId);
  };

  const isRunning = activeTab?.results.some(
    (r) => r.id === activeTab.activeResultTabId && r.loading,
  );

  const { data: datasets = [], isLoading: isDatasetsLoading } = useQuery({
    queryKey: ["datasets", "saved-query-modal"],
    queryFn: () => datasetService.getDatasets({ skip: 0, limit: 100 }),
    enabled: isSaveModalOpen,
    staleTime: 5 * 60 * 1000,
  });

  const { data: domains = [], isLoading: isDomainsLoading } = useQuery({
    queryKey: ["catalog-domains", "saved-query-modal"],
    queryFn: domainService.getDomains,
    enabled: isSaveModalOpen,
    staleTime: 5 * 60 * 1000,
  });

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin-users", "saved-query-modal"],
    queryFn: () => userService.getAdminUsers({ skip: 0, limit: 100 }),
    enabled: isSaveModalOpen,
    staleTime: 5 * 60 * 1000,
  });

  const saveQueryMutation = useMutation({
    mutationFn: (values: SaveQueryFormValues) =>
      savedQueryService.createSavedQuery({
        dataset_id: values.dataset_id,
        name: values.name,
        description: values.description,
        sql: values.sql,
        catalog: values.catalog,
        schema: values.schema,
        domain_id: values.domain_id,
        trino_endpoint_id: values.trino_endpoint_id,
        tags: values.tags ?? [],
        owner_ids: values.owner_ids ?? [],
        classification_tag_ids: values.classification_tag_ids ?? [],
        glossary_term_ids: values.glossary_term_ids ?? [],
        extra_metadata: {},
      }),
    onSuccess: (response) => {
      const savedId =
        (typeof response.saved_query_id === "string" && response.saved_query_id) ||
        (typeof response.id === "string" && response.id) ||
        null;
      setLastSavedQueryId(savedId);
      setIsSaveModalOpen(false);
      message.success("Query saved successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        typeof error === "object" && error !== null
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            (error as { message?: string }).message)
          : undefined;
      message.error(errorMessage || "Failed to save query.");
    },
  });

  const saveInitialValues = useMemo(
    () => ({
      name: activeTab?.name || "Saved Query",
      sql: currentEditorText || activeTab?.query || "",
      catalog: activeTab?.catalog || "",
      schema: activeTab?.schema || "",
      trino_endpoint_id: lastSavedQueryId ? undefined : "",
    }),
    [
      activeTab?.catalog,
      activeTab?.name,
      activeTab?.query,
      activeTab?.schema,
      currentEditorText,
      lastSavedQueryId,
    ],
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs Header */}
      <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1 flex-1">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "group flex items-center h-10 px-4 min-w-[120px] max-w-[200px] cursor-pointer rounded-t-xl text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-white text-blue-600 border-x border-t border-slate-200 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50",
                )}
              >
                <RefreshCw
                  size={14}
                  className={cn(
                    "mr-2",
                    isActive ? "text-blue-500" : "text-slate-400",
                    tab.results.some((r) => r.loading) && "animate-spin",
                  )}
                />
                <span className="truncate flex-1">{tab.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={cn(
                    "p-0.5 rounded-full hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100 ml-2",
                    isActive && "opacity-100",
                  )}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
          <button
            onClick={addTab}
            className="p-2 ml-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-full transition-all"
            title="New Query Tab"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 pb-2 pl-4">
          <Space.Compact className="shadow-sm">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleExecute(false)}
              disabled={isRunning || !currentEditorText.trim()}
              className="h-8 bg-blue-600 hover:bg-blue-700 font-bold gap-2 rounded-r-none border-r border-blue-700"
            >
              {isRunning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              Run
            </Button>
            <Dropdown
              disabled={isRunning || !currentEditorText.trim()}
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "run-current",
                    label: "Run in Current Tab",
                    icon: <Play size={14} />,
                    onClick: () => handleExecute(false),
                  },
                  {
                    key: "run-new",
                    label: "Run in New Tab",
                    icon: <FileCode size={14} />,
                    onClick: () => handleExecute(true),
                  },
                ],
              }}
            >
              <Button
                size="sm"
                variant="default"
                className="h-8 bg-blue-600 hover:bg-blue-700 rounded-l-none px-2"
                disabled={isRunning || !currentEditorText.trim()}
              >
                <ChevronDown size={14} />
              </Button>
            </Dropdown>
          </Space.Compact>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSaveModalOpen(true)}
            disabled={!currentEditorText.trim()}
            className="h-8 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 shadow-sm"
          >
            <Save size={13} className="mr-2" />
            Save Query
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={!isRunning}
            className="h-8 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 shadow-sm"
          >
            <Square size={12} fill="currentColor" className="mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        className={cn(
          "flex-1 min-h-0 relative transition-colors",
          isDropZoneActive && "bg-blue-50/40",
        )}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes(SQL_EDITOR_DRAG_DATA_TYPE)) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setIsDropZoneActive(true);
          }
        }}
        onDragLeave={() => setIsDropZoneActive(false)}
        onDrop={handleEditorDrop}
      >
        {activeTab ? (
          <>
            <Editor
              height="100%"
              defaultLanguage="sql"
              path={activeTab.id}
              defaultValue={activeTab.query}
              onMount={handleEditorDidMount}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                padding: { top: 16, bottom: 16 },
                theme: "vs-light",
              }}
            />
            {isDropZoneActive && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-blue-300 bg-blue-50/30">
                <div className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm">
                  Drop to insert table reference
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
            <PlusCircle size={48} className="text-slate-100" />
            <p className="text-sm font-medium">
              Create a new query tab to get started
            </p>
            <Button variant="outline" size="sm" onClick={addTab}>
              New Tab
            </Button>
          </div>
        )}
      </div>

      <SaveQueryModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmit={async (values) => {
          await saveQueryMutation.mutateAsync(values);
        }}
        isSubmitting={saveQueryMutation.isPending}
        datasets={datasets}
        domains={domains}
        users={users}
        isDatasetsLoading={isDatasetsLoading}
        isOptionsLoading={isDomainsLoading || isUsersLoading}
        initialValues={saveInitialValues}
      />
    </div>
  );
}
