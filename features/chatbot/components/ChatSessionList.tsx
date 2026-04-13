"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  MessageSquareMore,
  Pin,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Empty, Input, Skeleton, Tooltip } from "antd";

import { usePinnedChatSessions } from "@/features/chatbot/hooks/usePinnedChatSessions";
import type { ChatSessionSummary } from "@/features/chatbot/types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

dayjs.extend(relativeTime);

interface ChatSessionListProps {
  sessions: ChatSessionSummary[];
  selectedSessionId?: string | null;
  isLoading?: boolean;
  isCreating?: boolean;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function ChatSessionList({
  sessions,
  selectedSessionId,
  isLoading,
  isCreating,
  onSelectSession,
  onCreateSession,
  onRefresh,
  isRefreshing,
}: ChatSessionListProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const { isPinned, togglePinnedSession } = usePinnedChatSessions();

  const filteredSessions = React.useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return [...sessions]
      .filter((session) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = [
          session.title,
          session.summary,
          session.id,
          session.latest_debug_mode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
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

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f7f8] xl:border-r xl:border-slate-200">
      <div className="border-b border-slate-200/80 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageSquareMore size={16} className="text-slate-500" />
              <span className="truncate">AI Chat Sessions</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip title="Refresh sessions">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 border-slate-200 bg-white px-0 text-slate-600 hover:bg-slate-100"
                onClick={onRefresh}
              >
                <RefreshCw
                  size={14}
                  className={cn(isRefreshing && "animate-spin")}
                />
              </Button>
            </Tooltip>
            <Button
              className="h-9 bg-slate-900 text-white hover:bg-slate-800"
              onClick={onCreateSession}
              disabled={isCreating}
            >
              <Plus size={14} className="mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200/80 px-4 py-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search chats"
            className="rounded-xl border-slate-200 bg-white pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {isLoading ? (
          <div className="space-y-1.5 px-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-2xl px-3 py-3">
                <Skeleton active paragraph={false} title={{ width: "72%" }} />
              </div>
            ))}
          </div>
        ) : filteredSessions.length ? (
          <div className="space-y-1">
            {filteredSessions.map((session) => {
              const isSelected = session.id === selectedSessionId;
              const pinned = isPinned(session.id);
              const sessionTitle = session.title || "Untitled Chat";
              const relativeTimeLabel = session.last_message_at
                ? dayjs(session.last_message_at).fromNow()
                : "No activity";

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectSession(session.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "group w-full rounded-2xl px-3 py-3 text-left transition-all",
                    isSelected
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-700 hover:bg-white hover:text-slate-900",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-700",
                      )}
                    >
                      <MessageSquareMore size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {sessionTitle}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        {pinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            <Pin size={10} className="fill-current" />
                            Pinned
                          </span>
                        ) : null}
                        <span className="truncate">{relativeTimeLabel}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className={cn(
                          "rounded-full border p-1.5 transition-colors",
                          pinned
                            ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                            : "border-transparent text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-600",
                        )}
                        onClick={(event) => {
                          event.stopPropagation();
                          togglePinnedSession(session.id);
                        }}
                        aria-label={
                          pinned ? "Unpin chat session" : "Pin chat session"
                        }
                      >
                        <Pin size={12} className={cn(pinned && "fill-current")} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 truncate pl-12 text-[11px] text-slate-400">
                    {session.id}
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
                      ? "No sessions match the current filters"
                      : "No chat sessions yet"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {sessions.length
                      ? "Try adjusting the search text or switching back to all sessions."
                      : "Start a new AI chat to explore your catalog and analytics questions."}
                  </div>
                </div>
              }
            />
          </div>
        )}
      </div>

    </section>
  );
}
