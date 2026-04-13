"use client";

import React from "react";
import { Drawer, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { LayoutPanelLeft } from "lucide-react";
import {
  Group as ResizablePanelGroup,
  Panel as ResizablePanel,
  Separator as ResizableHandle,
} from "react-resizable-panels";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ChatDebugDrawer } from "@/features/chatbot/components/ChatDebugDrawer";
import { ChatConversation } from "@/features/chatbot/components/ChatConversation";
import { ChatSessionList } from "@/features/chatbot/components/ChatSessionList";
import { useChatSessions } from "@/features/chatbot/hooks/useChatSessions";
import { useChatSessionDetail } from "@/features/chatbot/hooks/useChatSessionDetail";
import { useAskChat } from "@/features/chatbot/hooks/useAskChat";
import { useVisualizeChatMessage } from "@/features/chatbot/hooks/useVisualizeChatMessage";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";
import { Button } from "@/shared/components/ui/button";
import type {
  AskChatResponse,
  ChatResultPreview,
  ChatVisualizationConfig,
} from "@/features/chatbot/types";
import type { ChatConversationMessage } from "@/features/chatbot/components/ChatConversation";

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const messageValue = (error as { message?: string }).message;
    if (typeof messageValue === "string" && messageValue.trim()) {
      return messageValue;
    }
  }

  return fallback;
}

function createOptimisticChatMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatbotSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;
  const [composerValue, setComposerValue] = React.useState("");
  const [latestAskResponse, setLatestAskResponse] =
    React.useState<AskChatResponse | null>(null);
  const [useStreamingReplies, setUseStreamingReplies] = React.useState(false);
  const [streamingAssistantText, setStreamingAssistantText] = React.useState("");
  const [isStreamingReply, setIsStreamingReply] = React.useState(false);
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = React.useState(false);
  const [visualizingMessageId, setVisualizingMessageId] = React.useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = React.useState<
    ChatConversationMessage[]
  >([]);
  const [isDebugDrawerOpen, setIsDebugDrawerOpen] = React.useState(false);

  const {
    data: sessions = [],
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
    isFetching: isSessionsFetching,
  } = useChatSessions({
    skip: 0,
    limit: 20,
    sort_by: "last_message_at",
  });

  const {
    data: session,
    isLoading: isSessionLoading,
    isError: isSessionError,
    refetch: refetchSession,
  } = useChatSessionDetail(sessionId, {
    include_debug_trace: false,
  });

  const askChatMutation = useAskChat(sessionId);
  const visualizeChatMutation = useVisualizeChatMessage(sessionId);

  const latestDebugMessageId = React.useMemo(
    () =>
      [...(session?.messages || [])]
        .reverse()
        .find((message) => message.role === "assistant" && message.has_debug_trace)?.id ||
      null,
    [session?.messages],
  );

  const displayedMessages = React.useMemo<ChatConversationMessage[]>(() => {
    const latestAssistantId =
      latestAskResponse?.assistant_message_id ||
      [...(session?.messages || [])]
        .reverse()
        .find((message) => message.role === "assistant")?.id ||
      null;

    const hydratedSessionMessages = (session?.messages || []).map((message) => {
      const metadataPreview = message.message_metadata?.result_preview;
      const metadataVisualization = message.message_metadata?.visualization;
      const metadataChartOptions = message.message_metadata?.chart_options;
      const metadataChartPrompt = message.message_metadata?.chart_prompt;
      const resultPreview =
        message.id === latestAssistantId && latestAskResponse?.result_preview
          ? latestAskResponse.result_preview
          : metadataPreview && typeof metadataPreview === "object"
            ? (metadataPreview as ChatResultPreview)
            : null;
      const visualization =
        message.id === latestAssistantId && latestAskResponse?.visualization
          ? latestAskResponse.visualization
          : message.visualization ||
            (metadataVisualization && typeof metadataVisualization === "object"
              ? (metadataVisualization as ChatVisualizationConfig)
              : null);
      const chartOptions =
        message.id === latestAssistantId && Array.isArray(latestAskResponse?.chart_options)
          ? latestAskResponse.chart_options
          : Array.isArray(metadataChartOptions)
            ? metadataChartOptions.filter(
                (item): item is ChatVisualizationConfig =>
                  Boolean(item) && typeof item === "object",
              )
            : [];
      const chartPrompt =
        message.id === latestAssistantId && typeof latestAskResponse?.chart_prompt === "string"
          ? latestAskResponse.chart_prompt
          : typeof metadataChartPrompt === "string"
            ? metadataChartPrompt
            : null;

      return {
        ...message,
        resultPreview,
        visualization,
        chartOptions,
        chartPrompt,
      };
    });

    return [...hydratedSessionMessages, ...optimisticMessages];
  }, [latestAskResponse, optimisticMessages, session?.messages]);

  const createSessionMutation = useMutation({
    mutationFn: () => chatbotService.createSession({ title: "New AI Chat" }),
    onSuccess: (nextSession) => {
      message.success("Chat session created.");
      router.push(`/chatbot/${nextSession.id}`);
    },
    onError: (error: unknown) => {
      message.error(getMutationErrorMessage(error, "Failed to create chat session."));
    },
  });

  const handleSend = React.useCallback(
    async (value: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        return;
      }

      const userTempId = createOptimisticChatMessageId("user");
      const assistantTempId = createOptimisticChatMessageId("assistant");
      const createdAt = new Date().toISOString();

      const optimisticUserMessage: ChatConversationMessage = {
        id: userTempId,
        role: "user",
        content: trimmedValue,
        created_at: createdAt,
        updated_at: createdAt,
        isOptimistic: true,
      };

      const optimisticAssistantMessage: ChatConversationMessage = {
        id: assistantTempId,
        role: "assistant",
        content: "...",
        created_at: createdAt,
        updated_at: createdAt,
        isLoading: true,
        isOptimistic: true,
      };

      setOptimisticMessages([optimisticUserMessage, optimisticAssistantMessage]);
      setComposerValue("");

      try {
        if (useStreamingReplies) {
          setIsStreamingReply(true);
          setStreamingAssistantText("");
          setOptimisticMessages((previous) =>
            previous.map((message) =>
              message.id === assistantTempId
                ? {
                    ...message,
                    isLoading: false,
                    isStreaming: true,
                    content: "Thinking...",
                  }
                : message,
            ),
          );

          const response = await chatbotService.streamSession(
            sessionId,
            {
              content: trimmedValue,
              top_k: 5,
              max_rows: 25,
              max_recent_messages: 8,
              use_graph: true,
              execute_sql: true,
            },
            {
              onText: (text) => {
                setStreamingAssistantText(text);
                setOptimisticMessages((previous) =>
                  previous.map((message) =>
                    message.id === assistantTempId
                      ? {
                          ...message,
                          content: text || "Thinking...",
                          isLoading: false,
                          isStreaming: true,
                        }
                      : message,
                  ),
                );
              },
            },
          );

          setLatestAskResponse(response);
          await Promise.all([refetchSession(), refetchSessions()]);
          setOptimisticMessages([]);
          return;
        }

        const response = await askChatMutation.mutateAsync({
          content: trimmedValue,
          top_k: 5,
          max_rows: 25,
          max_recent_messages: 8,
          use_graph: true,
          execute_sql: true,
        });
        setLatestAskResponse(response);
        await Promise.all([refetchSession(), refetchSessions()]);
        setOptimisticMessages([]);
      } catch (error) {
        setOptimisticMessages([]);
        message.error(getMutationErrorMessage(error, "Failed to ask chatbot."));
      } finally {
        setIsStreamingReply(false);
      }
    },
    [askChatMutation, refetchSession, refetchSessions, sessionId, useStreamingReplies],
  );

  React.useEffect(() => {
    setLatestAskResponse(null);
    setStreamingAssistantText("");
    setIsStreamingReply(false);
    setVisualizingMessageId(null);
    setOptimisticMessages([]);
    setIsDebugDrawerOpen(false);
  }, [sessionId]);

  const handleSelectVisualization = React.useCallback(
    (
      messageId: string,
      payload: {
        type: string;
        x?: string;
        y?: string;
        series?: string[];
        columns?: string[];
      },
    ) => {
      setVisualizingMessageId(messageId);
      visualizeChatMutation.mutate(
        {
          messageId,
          ...payload,
        },
        {
          onSuccess: (response) => {
            setLatestAskResponse(response);
            message.success("Visualization updated.");
          },
          onError: (error: unknown) => {
            message.error(
              getMutationErrorMessage(error, "Failed to update visualization."),
            );
          },
          onSettled: async () => {
            setVisualizingMessageId(null);
            await Promise.all([refetchSession(), refetchSessions()]);
          },
        },
      );
    },
    [refetchSession, refetchSessions, visualizeChatMutation],
  );

  const renderSessionList = (isDrawer = false) => (
    <ChatSessionList
      sessions={sessions}
      selectedSessionId={sessionId}
      isLoading={isSessionsLoading}
      isCreating={createSessionMutation.isPending}
      onSelectSession={(nextSessionId) => {
        if (isDrawer) {
          setIsSessionDrawerOpen(false);
        }
        router.push(`/chatbot/${nextSessionId}`);
      }}
      onCreateSession={() => createSessionMutation.mutate()}
      onRefresh={() => {
        void refetchSessions();
        void refetchSession();
      }}
      isRefreshing={isSessionsFetching}
    />
  );

  const renderConversation = () => (
    <div className="h-full min-h-0">
      <ChatConversation
        session={session || null}
        messages={displayedMessages}
        isLoading={isSessionLoading}
        isError={isSessionError}
        composerValue={composerValue}
        onComposerChange={setComposerValue}
        onSend={(value) => {
          void handleSend(value);
        }}
        isSending={askChatMutation.isPending || isStreamingReply}
        latestAskResponse={latestAskResponse}
        streamingAssistantText={streamingAssistantText}
        isStreamingReply={isStreamingReply}
        useStreamingReplies={useStreamingReplies}
        onToggleStreamingReplies={() =>
          setUseStreamingReplies((previous) => !previous)
        }
        showDebugAction={Boolean(latestDebugMessageId)}
        onOpenDebug={() => setIsDebugDrawerOpen(true)}
        onSelectVisualization={handleSelectVisualization}
        visualizingMessageId={visualizingMessageId}
      />
    </div>
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="px-4 pb-4 pt-4 sm:px-6">
        <PageHeader
          title={session?.title || "Chatbot"}
          description="Ask questions, handle clarification, and inspect AI-generated results from the same conversation."
          breadcrumbItems={[
            { label: "Chatbot", href: "/chatbot" },
            { label: session?.title || "Conversation" },
          ]}
        />
      </div>

      <div className="flex items-center gap-2 px-4 pb-4 sm:px-6 lg:pb-3 xl:hidden">
        <Button
          variant="outline"
          size="sm"
          className="border-slate-200 text-slate-700 hover:bg-slate-100"
          onClick={() => setIsSessionDrawerOpen(true)}
        >
          <LayoutPanelLeft size={14} className="mr-2" />
          Sessions
        </Button>
      </div>

      <div className="min-h-0 flex-1 lg:hidden">
        {renderConversation()}
      </div>

      <div className="hidden min-h-0 flex-1 lg:block">
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={20} minSize={15} className="min-w-0">
            <div className="h-full min-h-0 pr-1.5">
              {renderSessionList()}
            </div>
          </ResizablePanel>
          <ResizableHandle className="relative w-[2px] bg-slate-200 transition-colors hover:bg-blue-400 active:bg-blue-600 after:absolute after:-inset-x-1 after:inset-y-0 after:z-50 after:cursor-col-resize" />
          <ResizablePanel defaultSize={80} minSize={55} className="min-w-0">
            <div className="h-full min-h-0 pl-1.5">
              {renderConversation()}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Drawer
        title="Chat Sessions"
        placement="left"
        size={420}
        open={isSessionDrawerOpen}
        onClose={() => setIsSessionDrawerOpen(false)}
      >
        <div className="h-full min-h-0">
          {renderSessionList(true)}
        </div>
      </Drawer>

      <ChatDebugDrawer
        open={isDebugDrawerOpen}
        onClose={() => setIsDebugDrawerOpen(false)}
        sessionId={sessionId}
        messageId={latestDebugMessageId}
      />
    </div>
  );
}
