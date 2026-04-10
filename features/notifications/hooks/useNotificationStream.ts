"use client";

import { useEffect } from "react";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { API_BASE_URL, handleLogout } from "@/shared/api/axios";
import { NOTIFICATION_FEED_QUERY_KEY } from "../constants";
import type {
  NotificationBotItem,
  NotificationFeedResponse,
  NotificationSyncItem,
} from "@/features/notifications/types";

const STREAM_RETRY_MS = 5000;

let subscriberCount = 0;
let activeAbortController: AbortController | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let activeQueryClient: QueryClient | null = null;
let reconnectEnabled = true;

function isSyncItem(value: unknown): value is NotificationSyncItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    (item.category === "sync" || typeof item.catalog_view_id === "string")
  );
}

function isBotItem(value: unknown): value is NotificationBotItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    ((item.category === "bots" || item.category === "bot_runs") ||
      typeof item.bot_id === "string")
  );
}

function normalizeNotificationPayload(
  payload: unknown,
): Partial<NotificationFeedResponse> | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const value = payload as Record<string, unknown>;

  if (value.data) {
    return normalizeNotificationPayload(value.data);
  }

  if (Array.isArray(value.sync) || Array.isArray(value.bots)) {
    return {
      org_id: typeof value.org_id === "string" ? value.org_id : "",
      user_id: typeof value.user_id === "string" ? value.user_id : "",
      sync: Array.isArray(value.sync)
        ? value.sync.filter(isSyncItem)
        : [],
      bots: Array.isArray(value.bots)
        ? value.bots.filter(isBotItem)
        : [],
    };
  }

  if (isSyncItem(value)) {
    return {
      sync: [value],
      bots: [],
    };
  }

  if (isBotItem(value)) {
    return {
      sync: [],
      bots: [
        {
          ...value,
          category: value.category === "bot_runs" ? "bots" : value.category,
        },
      ],
    };
  }

  if (isSyncItem(value.sync)) {
    return {
      sync: [value.sync],
      bots: [],
    };
  }

  if (isBotItem(value.bots)) {
    return {
      sync: [],
      bots: [value.bots],
    };
  }

  return null;
}

function sortByNewest<T extends { updated_at: string; created_at: string }>(
  items: T[],
) {
  return [...items].sort((first, second) => {
    const firstTimestamp = new Date(
      first.updated_at || first.created_at,
    ).getTime();
    const secondTimestamp = new Date(
      second.updated_at || second.created_at,
    ).getTime();

    return secondTimestamp - firstTimestamp;
  });
}

function mergeItemsById<T extends { id: string; updated_at: string; created_at: string }>(
  existing: T[],
  incoming: T[],
  limit?: number,
) {
  const mergedMap = new Map<string, T>();

  existing.forEach((item) => {
    mergedMap.set(item.id, item);
  });

  incoming.forEach((item) => {
    mergedMap.set(item.id, item);
  });

  const mergedItems = sortByNewest(Array.from(mergedMap.values()));

  return typeof limit === "number" ? mergedItems.slice(0, limit) : mergedItems;
}

function mergeNotificationFeed(
  existing: NotificationFeedResponse | undefined,
  incoming: Partial<NotificationFeedResponse>,
  limit?: number,
): NotificationFeedResponse {
  const currentSync = existing?.sync ?? [];
  const currentBots = existing?.bots ?? [];
  const incomingSync = incoming.sync ?? [];
  const incomingBots = incoming.bots ?? [];

  return {
    org_id: incoming.org_id || existing?.org_id || "",
    user_id: incoming.user_id || existing?.user_id || "",
    sync: mergeItemsById(currentSync, incomingSync, limit),
    bots: mergeItemsById(currentBots, incomingBots, limit),
  };
}

function getQueryLimit(queryKey: QueryKey) {
  const maybeLimit = queryKey[2];
  return typeof maybeLimit === "number" ? maybeLimit : undefined;
}

function applyIncomingNotification(
  queryClient: QueryClient,
  incoming: Partial<NotificationFeedResponse>,
) {
  const queryEntries = queryClient.getQueriesData<NotificationFeedResponse>({
    queryKey: NOTIFICATION_FEED_QUERY_KEY,
  });

  queryEntries.forEach(([queryKey, existing]) => {
    queryClient.setQueryData<NotificationFeedResponse>(
      queryKey,
      mergeNotificationFeed(existing, incoming, getQueryLimit(queryKey)),
    );
  });
}

function clearReconnectTimeout() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}

function scheduleReconnect() {
  if (!reconnectEnabled || subscriberCount === 0 || reconnectTimeout) {
    return;
  }

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    void openNotificationStream();
  }, STREAM_RETRY_MS);
}

async function openNotificationStream() {
  if (
    typeof window === "undefined" ||
    subscriberCount === 0 ||
    activeAbortController ||
    !activeQueryClient
  ) {
    return;
  }

  reconnectEnabled = true;

  const token = window.localStorage.getItem("token");
  if (!token) {
    return;
  }

  const controller = new AbortController();
  const decoder = new TextDecoder();
  activeAbortController = controller;

  let buffer = "";
  let eventName = "message";
  let eventData = "";

  const flushEvent = () => {
    if (!eventData.trim() || !activeQueryClient) {
      eventName = "message";
      eventData = "";
      return;
    }

    try {
      const parsed = JSON.parse(eventData);
      const normalized = normalizeNotificationPayload(parsed);
      if (normalized) {
        applyIncomingNotification(activeQueryClient, normalized);
      }
    } catch {
      if (eventName === "auth_error") {
        handleLogout();
      }
    }

    eventName = "message";
    eventData = "";
  };

  try {
    const response = await fetch(`${API_BASE_URL}/notifications/stream`, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
        Cache: "no-cache",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleLogout();
        return;
      }
      throw new Error(`Failed to open notifications stream: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Notifications stream body is not available.");
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        flushEvent();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line) {
          flushEvent();
          continue;
        }

        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
          continue;
        }

        if (line.startsWith("data:")) {
          const nextChunk = line.slice(5).trimStart();
          eventData = eventData ? `${eventData}\n${nextChunk}` : nextChunk;
        }
      }
    }
  } catch {
    if (controller.signal.aborted) {
      return;
    }
    scheduleReconnect();
  } finally {
    if (activeAbortController === controller) {
      activeAbortController = null;
    }
    if (reconnectEnabled && subscriberCount > 0) {
      scheduleReconnect();
    }
  }
}

function closeNotificationStream(disableReconnect: boolean = false) {
  if (disableReconnect) {
    reconnectEnabled = false;
  }

  clearReconnectTimeout();

  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
}

export function useNotificationStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    activeQueryClient = queryClient;
    subscriberCount += 1;
    reconnectEnabled = true;
    clearReconnectTimeout();
    void openNotificationStream();

    const restartStream = () => {
      closeNotificationStream();
      void openNotificationStream();
    };

    const stopStream = () => {
      closeNotificationStream(true);
    };

    window.addEventListener("auth-token-updated", restartStream);
    window.addEventListener("auth-logout", stopStream);

    return () => {
      subscriberCount = Math.max(0, subscriberCount - 1);

      window.removeEventListener("auth-token-updated", restartStream);
      window.removeEventListener("auth-logout", stopStream);

      if (subscriberCount === 0) {
        closeNotificationStream(true);
      }
    };
  }, [queryClient]);
}
