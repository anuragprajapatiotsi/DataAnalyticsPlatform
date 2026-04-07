"use client";

import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
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
} from "lucide-react";
import { Dropdown, Space, MenuProps, message } from "antd";
import { useSqlEditorContext } from "../contexts/SqlEditorContext";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { loader } from "@monaco-editor/react";
import { registerSqlAutocomplete, setAutocompleteContext } from "../services/autocomplete";
import { useEffect } from "react";

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

  const editorRef = useRef<any>(null);
  
  // Step 4: Reactive Autocomplete Context Sync
  useEffect(() => {
    if (activeTab) {
      setAutocompleteContext({
        catalog: activeTab.catalog,
        schema: activeTab.schema,
      });
    }
  }, [activeTab?.catalog, activeTab?.schema]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
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

  const handleExecute = (openNewTab: boolean = false) => {
    if (!activeTabId || !editorRef.current) return;
    
    // Step 4: Selection-Aware Querying
    const selection = editorRef.current.getSelection();
    const model = editorRef.current.getModel();
    let selectedText = "";
    
    if (selection && model) {
      selectedText = model.getValueInRange(selection);
    }
    
    const queryToRun = selectedText || activeTab?.query || "";
    if (queryToRun.trim().length === 0) {
      message.warning("Please type or select a valid SQL query to execute.");
      return;
    }
    
    executeQuery(activeTabId, selectedText || undefined, { openNewTab });
  };

  const handleCancel = () => {
    if (!activeTab || !activeTab.activeResultTabId) return;
    cancelQuery(activeTabId, activeTab.activeResultTabId);
  };

  const isRunning = activeTab?.results.some(
    (r) => r.id === activeTab.activeResultTabId && r.loading,
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
              disabled={isRunning || !activeTab?.query}
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
              disabled={isRunning || !activeTab?.query}
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
                disabled={isRunning || !activeTab?.query}
              >
                <ChevronDown size={14} />
              </Button>
            </Dropdown>
          </Space.Compact>
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
      <div className="flex-1 min-h-0 relative">
        {activeTab ? (
          <Editor
            height="100%"
            defaultLanguage="sql"
            value={activeTab.query}
            onMount={handleEditorDidMount}
            onChange={(value) => updateTabQuery(activeTab.id, value || "")}
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
    </div>
  );
}
