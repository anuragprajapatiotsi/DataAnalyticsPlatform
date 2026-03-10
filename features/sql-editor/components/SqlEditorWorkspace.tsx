"use client";

import React, { useState } from "react";
import {
  Group as ResizablePanelGroup,
  Panel as ResizablePanel,
  Separator as ResizableHandle,
} from "react-resizable-panels";
import { SchemaExplorer } from "./SchemaExplorer";
import { QueryEditor } from "./QueryEditor";
import { ResultPanel } from "./ResultPanel";
import { SqlEditorProvider } from "../contexts/SqlEditorContext";

export function SqlEditorWorkspace() {
  return (
    <SqlEditorProvider>
      <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden">
        <ResizablePanelGroup
          orientation="horizontal"
          id="sql-main-layout"
          className="flex-1"
        >
          {/* Left Panel: Schema Explorer */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            className="bg-white border-r border-slate-200"
          >
            <SchemaExplorer />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-slate-200 hover:bg-blue-400 transition-colors" />

          {/* Right Panel: SQL Editor and Results */}
          <ResizablePanel defaultSize={80}>
            <ResizablePanelGroup orientation="vertical" id="sql-editor-results">
              {/* Top Workspace: Query Editor */}
              <ResizablePanel defaultSize={60} minSize={20}>
                <QueryEditor />
              </ResizablePanel>

              <ResizableHandle className="h-1 bg-slate-200 hover:bg-blue-400 transition-colors" />

              {/* Bottom Workspace: Result Panel */}
              <ResizablePanel defaultSize={40} minSize={10}>
                <ResultPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SqlEditorProvider>
  );
}
