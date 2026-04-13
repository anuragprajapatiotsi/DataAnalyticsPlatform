"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { message, Drawer, Empty, Input, Skeleton, Tag, Tooltip } from "antd";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Bot, MessageSquareMore, Pin, Plus, RefreshCw, Search } from "lucide-react";

import { usePinnedChatSessions } from "@/features/chatbot/hooks/usePinnedChatSessions";
import { useChatSessions } from "@/features/chatbot/hooks/useChatSessions";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

dayjs.extend(relativeTime);

interface ChatQuickDrawerProps {
  open: boolean;
  onClose: () => void;
}

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const messageValue = (error as { message?: string }).message;
    if (typeof messageValue === "string" && messageValue.trim()) {
      return messageValue;
    }
  }

  return fallback;
}

export function ChatQuickDrawer({ open, onClose }: ChatQuickDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = React.useState("");
  const { isPinned, togglePinnedSession } = usePinnedChatSessions();

  const {
    data: sessions = [],
    isLoading,
    refetch,
    isFetching,
  } = useChatSessions({
    skip: 0,
    limit: 8,
    sort_by: "last_message_at",
  });

  const createSessionMutation = useMutation({
    mutationFn: () => chatbotService.createSession({ title: "New AI Chat" }),
    onSuccess: (session) => {
      message.success("Chat session created.");
      onClose();
      router.push(`/chatbot/${session.id}`);
    },
    onError: (error: unknown) => {
      message.error(getMutationErrorMessage(error, "Failed to create chat session."));
    },
  });

  const filteredSessions = React.useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return [...sessions]
      .filter((session) => {
        if (!normalizedSearch) {
          return true;
        }

        return [session.title, session.summary, session.id, session.latest_debug_mode]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((left, right) => {
        const leftPinned = isPinned(left.id);
        const rightPinned = isPinned(right.id);

        if (leftPinned === rightPinned) {
          return 0;
        }

        return leftPinned ? -1 : 1;
      });
  }, [isPinned, searchValue, sessions]);

  const activeSessionId = React.useMemo(() => {
    const match = pathname.match(/^\/chatbot\/([^/]+)$/);
    return match?.[1] ?? null;
  }, [pathname]);

  return (
    <Drawer
      title={
        <div>
          <div className="text-base font-semibold text-slate-900">Chatbot</div>
          <div className="mt-1 text-sm font-normal text-slate-500">
            Jump into recent AI conversations from anywhere in the app.
          </div>
        </div>
      }
      placement="right"
      size={420}
      open={open}
      onClose={onClose}
      destroyOnClose={false}
      extra={
        <Button
          variant="outline"
          size="sm"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => {
            onClose();
            router.push("/chatbot");
          }}
        >
          Open Full Chat
        </Button>
      }
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search recent sessions"
                className="pl-9"
              />
            </div>
            <Tooltip title="Refresh sessions">
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => void refetch()}
              >
                <RefreshCw
                  size={14}
                  className={cn(isFetching && "animate-spin")}
                />
              </Button>
            </Tooltip>
            <Button
              className="h-9 border border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700"
              onClick={() => createSessionMutation.mutate()}
              disabled={createSessionMutation.isPending}
            >
              <Plus size={14} className="mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <Skeleton active paragraph={{ rows: 2 }} title={{ width: "50%" }} />
                </div>
              ))}
            </div>
          ) : filteredSessions.length ? (
            <div className="space-y-2">
              {filteredSessions.map((session) => {
                const isSelected = session.id === activeSessionId;

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      onClose();
                      router.push(`/chatbot/${session.id}`);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onClose();
                        router.push(`/chatbot/${session.id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition-all",
                      isSelected
                        ? "border-blue-200 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-blue-100 hover:bg-slate-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isPinned(session.id) ? (
                            <Pin size={12} className="shrink-0 fill-current text-blue-600" />
                          ) : null}
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {session.title || "Untitled Chat"}
                          </div>
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {session.summary ||
                            "No summary yet. Ask your first question to build this thread."}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.has_debug_traces ? (
                          <Tag className="m-0 rounded-full border-amber-200 bg-amber-50 text-[10px] text-amber-700">
                            Debug
                          </Tag>
                        ) : null}
                        <button
                          type="button"
                          className={cn(
                            "rounded-full border p-1 transition-colors",
                            isPinned(session.id)
                              ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600",
                          )}
                          onClick={(event) => {
                            event.stopPropagation();
                            togglePinnedSession(session.id);
                          }}
                          aria-label={isPinned(session.id) ? "Unpin chat session" : "Pin chat session"}
                        >
                          <Pin size={12} className={cn(isPinned(session.id) && "fill-current")} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                      <span className="truncate">{session.id}</span>
                      <span className="shrink-0">
                        {session.last_message_at
                          ? dayjs(session.last_message_at).fromNow()
                          : "No activity"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Empty
                image={
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                    <MessageSquareMore className="text-slate-300" size={28} />
                  </div>
                }
                description={
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-slate-700">
                      {sessions.length
                        ? "No sessions match the current search"
                        : "No chat sessions yet"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {sessions.length
                        ? "Try a different search term or open the full chat workspace."
                        : "Start a new AI chat to explore your catalog and analytics questions."}
                    </div>
                  </div>
                }
              />
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            <Bot size={16} className="mt-0.5 shrink-0 text-blue-600" />
            <span>
              Use this drawer for quick access, then switch into the full chatbot workspace
              when you need clarification, previews, charts, or debug tools.
            </span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
