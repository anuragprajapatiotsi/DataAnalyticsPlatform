"use client";

import React from "react";
import dayjs from "dayjs";
import { Alert, Dropdown, Empty, Input, Spin, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Bot,
  Bug,
  Copy,
  Database,
  Filter,
  MoreHorizontal,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
import { ClarificationChips } from "@/features/chatbot/components/ClarificationChips";
import { ChatVisualizationPanel } from "@/features/chatbot/components/ChatVisualizationPanel";
import type {
  AskChatResponse,
  ChatMessage,
  ChatResultPreview,
  ChatVisualizationConfig,
  ChatSessionDetail,
} from "@/features/chatbot/types";

function getLatestAssistantMessage(messages: ChatMessage[]) {
  return [...messages]
    .reverse()
    .find((message) => message.role === "assistant") || null;
}

type ConversationFilterMode = "all" | "assistant" | "user" | "sql";
type ConversationActionPanel = "search" | "filter" | null;
export type ChatConversationMessage = ChatMessage & {
  isLoading?: boolean;
  isOptimistic?: boolean;
  isStreaming?: boolean;
  resultPreview?: ChatResultPreview | null;
  chartOptions?: ChatVisualizationConfig[];
  chartPrompt?: string | null;
};

function buildPreviewRows(preview: ChatResultPreview) {
  if (Array.isArray(preview.row_objects) && preview.row_objects.length) {
    return preview.row_objects.map((row, index) => ({
      __rowKey: `row-${index}`,
      ...row,
    }));
  }

  if (Array.isArray(preview.rows) && preview.rows.length) {
    return preview.rows.map((row, index) => {
      const record: Record<string, unknown> = { __rowKey: `row-${index}` };
      preview.columns.forEach((column, columnIndex) => {
        record[column] = Array.isArray(row) ? row[columnIndex] : null;
      });
      return record;
    });
  }

  return [];
}

export function ChatConversation({
  session,
  messages,
  isLoading,
  isError,
  composerValue,
  onComposerChange,
  onSend,
  isSending,
  latestAskResponse,
  streamingAssistantText,
  isStreamingReply,
  useStreamingReplies,
  onToggleStreamingReplies,
  showDebugAction,
  onOpenDebug,
  onSelectVisualization,
  visualizingMessageId,
}: {
  session: ChatSessionDetail | null;
  messages?: ChatConversationMessage[];
  isLoading?: boolean;
  isError?: boolean;
  composerValue: string;
  onComposerChange: (value: string) => void;
  onSend: (value: string) => void;
  isSending?: boolean;
  latestAskResponse: AskChatResponse | null;
  streamingAssistantText?: string;
  isStreamingReply?: boolean;
  useStreamingReplies?: boolean;
  onToggleStreamingReplies?: () => void;
  showDebugAction?: boolean;
  onOpenDebug?: () => void;
  onSelectVisualization?: (
    messageId: string,
    config: {
      type: string;
      x?: string;
      y?: string;
      series?: string[];
      columns?: string[];
    },
  ) => void;
  visualizingMessageId?: string | null;
}) {
  const latestAssistantMessage = React.useMemo(
    () => getLatestAssistantMessage(session?.messages || []),
    [session?.messages],
  );
  const [searchValue, setSearchValue] = React.useState("");
  const deferredSearchValue = React.useDeferredValue(searchValue);
  const [filterMode, setFilterMode] = React.useState<ConversationFilterMode>("all");
  const [activeActionPanel, setActiveActionPanel] =
    React.useState<ConversationActionPanel>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = React.useRef(0);
  const messageMetadata = latestAssistantMessage?.message_metadata || null;

  React.useEffect(() => {
    setIsSummaryExpanded(false);
    setActiveActionPanel(null);
  }, [session?.id]);
  const shouldShowSummaryToggle = Boolean(session?.summary && session.summary.length > 120);
  const actionMenuItems = React.useMemo(
    () => [
      {
        key: "search",
        label: "Search",
      },
      {
        key: "filter",
        label: "Filter",
      },
    ],
    [],
  );

  const clarificationOptions = React.useMemo(() => {
    if (latestAskResponse?.needs_clarification && latestAskResponse.clarification_options) {
      return latestAskResponse.clarification_options;
    }

    const metadataOptions = messageMetadata?.clarification_options;
    return Array.isArray(metadataOptions)
      ? metadataOptions.filter((item): item is string => typeof item === "string")
      : [];
  }, [latestAskResponse, messageMetadata]);

  const filteredMessages = React.useMemo<ChatConversationMessage[]>(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    return (messages || session?.messages || []).filter((message) => {
      const roleMatches =
        filterMode === "all"
          ? true
          : filterMode === "sql"
            ? Boolean(message.sql_generated)
            : message.role === filterMode;

      if (!roleMatches) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        message.content,
        message.sql_generated,
        ...(Array.isArray(message.source_assets) ? message.source_assets : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [deferredSearchValue, filterMode, messages, session?.messages]);

  React.useEffect(() => {
    const messageCount = filteredMessages.length;
    const shouldScroll =
      messageCount > previousMessageCountRef.current ||
      isSending ||
      isStreamingReply ||
      Boolean(streamingAssistantText);

    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }

    previousMessageCountRef.current = messageCount;
  }, [filteredMessages.length, isSending, isStreamingReply, streamingAssistantText]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-none border-y border-slate-200 bg-white shadow-sm lg:rounded-2xl lg:border">
        <Spin />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        title="Failed to load chat session"
        description="We couldn't load this conversation right now."
      />
    );
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center rounded-none border-y border-slate-200 bg-white shadow-sm lg:rounded-2xl lg:border">
        <Empty description="Select or create a chat session to begin." />
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl bg-white">
      <div className="px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-base font-semibold text-slate-900">
                {session.title || "AI Chat"}
              </div>
              {session.summary ? (
                <div className="mt-0.5 max-w-3xl">
                  <p
                    className={cn(
                      "break-words text-xs text-slate-500",
                      !isSummaryExpanded && "line-clamp-1",
                    )}
                  >
                    {session.summary}
                  </p>
                  {shouldShowSummaryToggle ? (
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-700"
                      onClick={() => setIsSummaryExpanded((previous) => !previous)}
                      aria-expanded={isSummaryExpanded}
                    >
                      {isSummaryExpanded ? "Show less" : "Show more"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-8 whitespace-nowrap rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
                onClick={onOpenDebug}
                disabled={!showDebugAction}
              >
                <Bug size={14} className="mr-2" />
                Debug
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 whitespace-nowrap rounded-full border-slate-200 text-slate-600 hover:bg-slate-100",
                  useStreamingReplies &&
                    "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                )}
                onClick={onToggleStreamingReplies}
              >
                {useStreamingReplies ? "Streaming On" : "Streaming Off"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                {filteredMessages.length} of {(messages || session.messages).length} messages
              </span>
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: actionMenuItems,
                  onClick: ({ key }) =>
                    setActiveActionPanel((previous) =>
                      previous === key ? null : (key as ConversationActionPanel),
                    ),
                }}
              >
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Conversation actions"
                >
                  <MoreHorizontal size={16} />
                </button>
              </Dropdown>
            </div>

            {activeActionPanel === "search" ? (
              <div className="flex min-w-0 items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search messages, SQL, or assets"
                    className="rounded-2xl pl-9"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setActiveActionPanel(null)}
                  aria-label="Close search"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}

            {activeActionPanel === "filter" ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Filter size={14} className="text-slate-500" />
                    Filters
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setActiveActionPanel(null)}
                    aria-label="Close filters"
                  >
                    <X size={13} />
                  </button>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 whitespace-nowrap rounded-full border-slate-200 text-slate-600 hover:bg-slate-100",
                      filterMode === "all" &&
                        "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                    )}
                    onClick={() => setFilterMode("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 whitespace-nowrap rounded-full border-slate-200 text-slate-600 hover:bg-slate-100",
                      filterMode === "assistant" &&
                        "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                    )}
                    onClick={() => setFilterMode("assistant")}
                  >
                    Assistant
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 whitespace-nowrap rounded-full border-slate-200 text-slate-600 hover:bg-slate-100",
                      filterMode === "user" &&
                        "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                    )}
                    onClick={() => setFilterMode("user")}
                  >
                    You
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 whitespace-nowrap rounded-full border-slate-200 text-slate-600 hover:bg-slate-100",
                      filterMode === "sql" &&
                        "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                    )}
                    onClick={() => setFilterMode("sql")}
                  >
                    SQL
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {filteredMessages.length ? (
          <div className="flex flex-col gap-4">
            {filteredMessages.map((message) => {
              const isAssistant = message.role === "assistant";
              const previewRows = message.resultPreview
                ? buildPreviewRows(message.resultPreview)
                : [];
              const hasVisualizationTab = Boolean(
                isAssistant &&
                  (message.visualization ||
                    (Array.isArray(message.chartOptions) && message.chartOptions.length)),
              );
              const previewColumns: ColumnsType<Record<string, unknown>> =
                message.resultPreview
                  ? message.resultPreview.columns.map((column) => ({
                      title:
                        message.resultPreview?.column_metadata?.[column]?.display_label ||
                        column,
                      dataIndex: message.resultPreview?.display_fields?.[column] || column,
                      key: column,
                      width: 180,
                      ellipsis: true,
                      render: (value: unknown, record: Record<string, unknown>) => {
                        const displayKey = message.resultPreview?.display_fields?.[column];
                        const displayValue =
                          displayKey && record[displayKey] !== undefined
                            ? record[displayKey]
                            : value;

                        return (
                          <span className="text-xs text-slate-700">
                            {displayValue === null ||
                            displayValue === undefined ||
                            displayValue === ""
                              ? "-"
                              : String(displayValue)}
                          </span>
                        );
                      },
                    }))
                  : [];
              return (
                <div
                  key={message.id}
                  className={cn("flex", isAssistant ? "justify-start" : "justify-end")}
                >
                  <div
                    className={[
                      "min-w-0 max-w-[90%] rounded-[24px] px-4 py-3.5 sm:max-w-[75%] xl:max-w-[68%]",
                      isAssistant
                        ? "bg-slate-100 text-slate-800"
                        : "bg-blue-600 text-white",
                    ].join(" ")}
                  >
                    <div
                      className={cn(
                        "mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        isAssistant ? "text-slate-500" : "text-blue-100",
                      )}
                    >
                      {isAssistant ? <Bot size={13} /> : <Sparkles size={13} />}
                      {isAssistant ? "Assistant" : "You"}
                    </div>
                    {isAssistant && hasVisualizationTab ? (
                      <Tabs
                        size="small"
                        defaultActiveKey="result"
                        className="assistant-message-tabs"
                        items={[
                          {
                            key: "result",
                            label: "Result",
                            children: (
                              <div className="space-y-3">
                                <div className="whitespace-pre-wrap text-sm leading-6">
                                  {message.content}
                                </div>
                                {message.isLoading ? (
                                  <div className="flex items-center gap-1 text-slate-500">
                                    <span className="inline-block animate-bounce">.</span>
                                    <span className="inline-block animate-bounce [animation-delay:150ms]">
                                      .
                                    </span>
                                    <span className="inline-block animate-bounce [animation-delay:300ms]">
                                      .
                                    </span>
                                  </div>
                                ) : null}
                                {!message.isLoading && message.sql_generated ? (
                                  <div className="min-w-0 rounded-2xl bg-white p-3 text-xs text-slate-700">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                      <div className="font-semibold text-slate-500">SQL</div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 rounded-full border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 hover:bg-slate-100"
                                        onClick={() => {
                                          void globalThis.navigator?.clipboard?.writeText(
                                            message.sql_generated || "",
                                          );
                                        }}
                                      >
                                        <Copy size={12} className="mr-1.5" />
                                        Copy SQL
                                      </Button>
                                    </div>
                                    <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono">
                                      {message.sql_generated}
                                    </pre>
                                  </div>
                                ) : null}
                                {!message.isLoading &&
                                Array.isArray(message.source_assets) &&
                                message.source_assets.length ? (
                                  <div className="flex flex-wrap gap-2">
                                    {message.source_assets.map((asset) => (
                                      <span
                                        key={asset}
                                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
                                      >
                                        <Database size={11} className="mr-1" />
                                        {asset}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                                {!message.isLoading && message.resultPreview ? (
                                  <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2">
                                      <div className="text-xs font-semibold text-slate-600">
                                        Result Preview
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        {typeof message.resultPreview.row_count === "number"
                                          ? `${message.resultPreview.row_count} row${
                                              message.resultPreview.row_count === 1 ? "" : "s"
                                            }`
                                          : `${previewRows.length} row${
                                              previewRows.length === 1 ? "" : "s"
                                            }`}
                                      </div>
                                    </div>
                                    <div className="w-full overflow-x-auto">
                                      <Table<Record<string, unknown>>
                                        rowKey="__rowKey"
                                        dataSource={previewRows}
                                        columns={previewColumns}
                                        tableLayout="fixed"
                                        scroll={{
                                          x: Math.max(
                                            720,
                                            (message.resultPreview.columns.length || 1) * 180,
                                          ),
                                        }}
                                        pagination={
                                          previewRows.length > 10
                                            ? {
                                                pageSize: 10,
                                                size: "small",
                                                hideOnSinglePage: true,
                                              }
                                            : false
                                        }
                                        size="small"
                                        locale={{
                                          emptyText: (
                                            <Empty
                                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                                              description="No preview rows returned"
                                            />
                                          ),
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ),
                          },
                          {
                            key: "visualization",
                            label: "Visualization",
                            children: (
                              <ChatVisualizationPanel
                                visualization={message.visualization}
                                chartOptions={message.chartOptions}
                                chartPrompt={message.chartPrompt}
                                resultPreview={message.resultPreview}
                                selectedChartType={message.visualization?.type || null}
                                onSelectChartType={(type) =>
                                  onSelectVisualization?.(message.id, type)
                                }
                                isSaving={visualizingMessageId === message.id}
                                embedded
                              />
                            ),
                          },
                        ]}
                      />
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap text-sm leading-6">
                          {message.content}
                        </div>
                        {message.isLoading ? (
                          <div className="flex items-center gap-1 text-slate-500">
                            <span className="inline-block animate-bounce">.</span>
                            <span className="inline-block animate-bounce [animation-delay:150ms]">
                              .
                            </span>
                            <span className="inline-block animate-bounce [animation-delay:300ms]">
                              .
                            </span>
                          </div>
                        ) : null}
                        {!message.isLoading && message.sql_generated ? (
                          <div
                            className={cn(
                              "mt-4 min-w-0 rounded-2xl p-3 text-xs",
                              isAssistant
                                ? "bg-white text-slate-700"
                                : "bg-blue-500/80 text-blue-50",
                            )}
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div
                                className={cn(
                                  "font-semibold",
                                  isAssistant ? "text-slate-500" : "text-blue-100",
                                )}
                              >
                                SQL
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "h-7 rounded-full px-2.5 text-[11px]",
                                  isAssistant
                                    ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                    : "border-blue-300 bg-blue-500 text-blue-50 hover:bg-blue-400",
                                )}
                                onClick={() => {
                                  void globalThis.navigator?.clipboard?.writeText(
                                    message.sql_generated || "",
                                  );
                                }}
                              >
                                <Copy size={12} className="mr-1.5" />
                                Copy SQL
                              </Button>
                            </div>
                            <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono">
                              {message.sql_generated}
                            </pre>
                          </div>
                        ) : null}
                        {!message.isLoading &&
                        Array.isArray(message.source_assets) &&
                        message.source_assets.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.source_assets.map((asset) => (
                              <span
                                key={asset}
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px]",
                                  isAssistant
                                    ? "border border-slate-200 bg-white text-slate-600"
                                    : "bg-blue-500/80 text-blue-50",
                                )}
                              >
                                <Database size={11} className="mr-1" />
                                {asset}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {!message.isLoading && message.resultPreview ? (
                          <div
                            className={cn(
                              "mt-4 min-w-0 overflow-hidden rounded-2xl",
                              isAssistant
                                ? "border border-slate-200 bg-white"
                                : "bg-blue-500/80",
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-between gap-3 px-3 py-2",
                                isAssistant
                                  ? "border-b border-slate-100 bg-slate-50"
                                  : "border-b border-blue-400/60 bg-blue-500/90",
                              )}
                            >
                              <div
                                className={cn(
                                  "text-xs font-semibold",
                                  isAssistant ? "text-slate-600" : "text-blue-50",
                                )}
                              >
                                Result Preview
                              </div>
                              <div
                                className={cn(
                                  "text-[11px]",
                                  isAssistant ? "text-slate-400" : "text-blue-100",
                                )}
                              >
                                {typeof message.resultPreview.row_count === "number"
                                  ? `${message.resultPreview.row_count} row${
                                      message.resultPreview.row_count === 1 ? "" : "s"
                                    }`
                                  : `${previewRows.length} row${
                                      previewRows.length === 1 ? "" : "s"
                                    }`}
                              </div>
                            </div>
                            <div className="w-full overflow-x-auto">
                              <Table<Record<string, unknown>>
                                rowKey="__rowKey"
                                dataSource={previewRows}
                                columns={previewColumns}
                                tableLayout="fixed"
                                scroll={{
                                  x: Math.max(
                                    720,
                                    (message.resultPreview.columns.length || 1) * 180,
                                  ),
                                }}
                                pagination={
                                  previewRows.length > 10
                                    ? { pageSize: 10, size: "small", hideOnSinglePage: true }
                                    : false
                                }
                                size="small"
                                locale={{
                                  emptyText: (
                                    <Empty
                                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                                      description="No preview rows returned"
                                    />
                                  ),
                                }}
                              />
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                    <div className={cn("mt-3 text-[11px]", isAssistant ? "text-slate-400" : "text-blue-100/80")}>
                      {dayjs(
                        message.updated_at ||
                          message.created_at ||
                          message.trace_updated_at ||
                          new Date().toISOString(),
                      ).format("MMM D, YYYY h:mm A")}
                    </div>
                  </div>
                </div>
              );
            })}
            {isStreamingReply && !filteredMessages.some((message) => message.isStreaming) ? (
              <div className="flex justify-start">
                <div className="min-w-0 max-w-[90%] rounded-[24px] bg-slate-100 px-4 py-3.5 sm:max-w-[75%] xl:max-w-[68%]">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Bot size={13} />
                    Assistant
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">
                      Streaming
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {streamingAssistantText || "Thinking..."}
                  </div>
                </div>
              </div>
            ) : null}
            {isSending && !isStreamingReply && !filteredMessages.some((message) => message.isLoading) ? (
              <div className="flex justify-start">
                <div className="min-w-0 max-w-[90%] rounded-[24px] bg-slate-100 px-4 py-3.5 sm:max-w-[75%] xl:max-w-[68%]">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Bot size={13} />
                    Assistant
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="inline-block animate-bounce">.</span>
                    <span className="inline-block animate-bounce [animation-delay:150ms]">
                      .
                    </span>
                    <span className="inline-block animate-bounce [animation-delay:300ms]">
                      .
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        ) : session.messages.length ? (
          <div className="flex h-full items-center justify-center">
            <Empty description="No messages match the current search or filter." />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Empty description="No messages yet. Ask your first question to begin this conversation." />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-white/95 px-4 pb-4 pt-2 backdrop-blur sm:px-6">
        <ClarificationChips
          options={clarificationOptions}
          isLoading={isSending}
          onSelect={onSend}
        />

        <div className="flex w-full min-w-0 items-end gap-2">
          <Input.TextArea
            value={composerValue}
            onChange={(event) => onComposerChange(event.target.value)}
            autoSize={{ minRows: 1, maxRows: 6 }}
            placeholder="Ask anything..."
            className="min-w-0 flex-1 rounded-[28px] border border-slate-200 bg-white px-4 py-2 shadow-none focus-within:shadow-none"
          />
          <Button
            className="h-10 w-10 shrink-0 rounded-full border border-blue-600 bg-blue-600 px-0 text-white hover:border-blue-700 hover:bg-blue-700"
            onClick={() => onSend(composerValue)}
            disabled={isSending || !composerValue.trim()}
          >
            <Send size={15} />
          </Button>
        </div>
      </div>
    </section>
  );
}
