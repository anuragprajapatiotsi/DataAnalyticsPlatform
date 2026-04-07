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
    <ResizablePanelGroup orientation="vertical" id="sql-editor-results" className="h-full w-full">
      {/* Top Workspace: Query Editor */}
      <ResizablePanel defaultSize={60} minSize={20} className="bg-white">
        <QueryEditor />
      </ResizablePanel>

      <ResizableHandle className="h-[2px] bg-slate-200 hover:bg-blue-400 transition-colors cursor-row-resize active:bg-blue-600 after:absolute after:inset-x-0 after:-inset-y-1 after:z-50" />

      {/* Bottom Workspace: Result Panel */}
      <ResizablePanel defaultSize={40} minSize={10} className="bg-[#FAFAFA]">
        <ResultPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
