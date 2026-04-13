"use client";

import React from "react";

const PINNED_CHAT_STORAGE_KEY = "chatbot-pinned-sessions";

function readPinnedSessions() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(PINNED_CHAT_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function usePinnedChatSessions() {
  const [pinnedSessionIds, setPinnedSessionIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    setPinnedSessionIds(readPinnedSessions());
  }, []);

  const togglePinnedSession = React.useCallback((sessionId: string) => {
    setPinnedSessionIds((previous) => {
      const nextValue = previous.includes(sessionId)
        ? previous.filter((id) => id !== sessionId)
        : [sessionId, ...previous];

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          PINNED_CHAT_STORAGE_KEY,
          JSON.stringify(nextValue),
        );
      }

      return nextValue;
    });
  }, []);

  const isPinned = React.useCallback(
    (sessionId: string) => pinnedSessionIds.includes(sessionId),
    [pinnedSessionIds],
  );

  return {
    pinnedSessionIds,
    isPinned,
    togglePinnedSession,
  };
}
