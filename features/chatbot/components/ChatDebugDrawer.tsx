"use client";

import React from "react";
import { Drawer, Empty, Radio, Spin, Tag, message } from "antd";
import { Bug, Copy, Download, RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useChatMessageDebug } from "@/features/chatbot/hooks/useChatMessageDebug";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getSectionEntries(debugData: Record<string, unknown>) {
  const preferredOrder = [
    "planner",
    "answer",
    "sql",
    "retrieval",
    "graph",
    "execution",
    "metadata",
  ];

  const seen = new Set<string>();
  const orderedEntries: Array<[string, unknown]> = [];

  preferredOrder.forEach((key) => {
    if (key in debugData) {
      orderedEntries.push([key, debugData[key]]);
      seen.add(key);
    }
  });

  Object.entries(debugData).forEach(([key, value]) => {
    if (!seen.has(key)) {
      orderedEntries.push([key, value]);
    }
  });

  return orderedEntries;
}

export function ChatDebugDrawer({
  open,
  onClose,
  sessionId,
  messageId,
}: {
  open: boolean;
  onClose: () => void;
  sessionId?: string;
  messageId?: string | null;
}) {
  const [debugMode, setDebugMode] = React.useState<"summary" | "full">("summary");

  const {
    data: debugData,
    isLoading,
    isFetching,
    refetch,
  } = useChatMessageDebug(
    sessionId,
    messageId,
    { debug_mode: debugMode },
    open,
  );

  const debugRecord =
    debugData && typeof debugData === "object"
      ? (debugData as Record<string, unknown>)
      : null;

  const handleCopy = React.useCallback(async () => {
    if (!debugRecord) {
      return;
    }

    await navigator.clipboard.writeText(safeStringify(debugRecord));
    message.success("Debug payload copied.");
  }, [debugRecord]);

  const handleExport = React.useCallback(async () => {
    if (!sessionId) {
      return;
    }

    try {
      const blob = await chatbotService.exportSessionDebug(sessionId);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `chat-debug-${sessionId}.json`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
      message.success("Debug export downloaded.");
    } catch (error) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
          ? (error as { message?: string }).message
          : "Failed to export debug trace.";
      message.error(errorMessage);
    }
  }, [sessionId]);

  React.useEffect(() => {
    if (!open) {
      setDebugMode("summary");
    }
  }, [open]);

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Bug size={16} className="text-amber-600" />
          <span>Chat Debug</span>
        </div>
      }
      placement="right"
      size="large"
      open={open}
      onClose={onClose}
      destroyOnHidden={false}
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Trace Controls</div>
              <div className="mt-1 text-xs text-slate-500">
                Inspect persisted planner and retrieval details for this assistant message.
              </div>
            </div>
            <Tag className="m-0 rounded-full border-amber-200 bg-amber-50 text-[11px] text-amber-700">
              {debugMode}
            </Tag>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Radio.Group
              value={debugMode}
              onChange={(event) => setDebugMode(event.target.value)}
              optionType="button"
              buttonStyle="solid"
              options={[
                { label: "Summary", value: "summary" },
                { label: "Full", value: "full" },
              ]}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => void refetch()}
            >
              <RefreshCw size={13} className={`mr-1 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-slate-200 text-slate-700 hover:bg-slate-100"
              onClick={() => void handleCopy()}
              disabled={!debugRecord}
            >
              <Copy size={13} className="mr-1" />
              Copy JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => void handleExport()}
              disabled={!sessionId}
            >
              <Download size={13} className="mr-1" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spin />
          </div>
        ) : !debugRecord ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No debug payload available for this message yet"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {getSectionEntries(debugRecord).map(([key, value]) => (
              <section
                key={key}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="text-sm font-semibold capitalize text-slate-900">
                    {key.replace(/_/g, " ")}
                  </div>
                </div>
                <div className="p-4">
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                    {safeStringify(value)}
                  </pre>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
