"use client";

import { useEffect, useState } from "react";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

import { API_BASE_URL, handleLogout } from "@/shared/api/axios";
import { NOTIFICATION_FEED_QUERY_KEY } from "../constants";
import type {
  NotificationBotItem,
  NotificationFeedResponse,
  NotificationStreamState,
  NotificationSyncItem,
} from "@/features/notifications/types";
import {
  mergeNotificationFeed,
  normalizeNotificationPayload,
} from "@/features/notifications/utils/stream";

const STREAM_RETRY_BASE_MS = 1000;
const STREAM_RETRY_MAX_MS = 30000;
const STREAM_STALE_AFTER_MS = 15000;
const STREAM_HEALTH_CHECK_MS = 5000;
const TOAST_DEDUPE_WINDOW_MS = 5000;
const TOAST_FLUSH_MS = 1000;

let subscriberCount = 0;
let activeAbortController: AbortController | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let streamHealthInterval: ReturnType<typeof setInterval> | null = null;
let toastFlushTimeout: ReturnType<typeof setTimeout> | null = null;
let activeQueryClient: QueryClient | null = null;
let reconnectEnabled = true;
let reconnectAttempt = 0;
let streamState: NotificationStreamState = {
  status: "idle",
  isConnected: false,
  isDegraded: true,
  reconnectAttempt: 0,
  lastConnectedAt: null,
  lastEventAt: null,
};

const recentToastEvents = new Map<string, number>();
const queuedToastPayloads = new Map<string, NotificationToastPayload>();
const streamStateListeners = new Set<(state: NotificationStreamState) => void>();

type NotificationToastPayload = {
  key: string;
  type: "success" | "error" | "info";
  content: string;
};

function emitStreamState() {
  streamStateListeners.forEach((listener) => listener(streamState));
}

function updateStreamState(
  nextState:
    | Partial<NotificationStreamState>
    | ((currentState: NotificationStreamState) => NotificationStreamState),
) {
  streamState =
    typeof nextState === "function"
      ? nextState(streamState)
      : {
          ...streamState,
          ...nextState,
        };

  emitStreamState();
}

function getStreamActivityTimestamp(state: NotificationStreamState) {
  return state.lastEventAt ?? state.lastConnectedAt ?? 0;
}

function isStreamSilent(state: NotificationStreamState, now: number = Date.now()) {
  if (!state.isConnected) {
    return false;
  }

  const lastActivityAt = getStreamActivityTimestamp(state);
  if (!lastActivityAt) {
    return false;
  }

  return now - lastActivityAt >= STREAM_STALE_AFTER_MS;
}

function evaluateStreamHealth() {
  if (typeof window === "undefined" || subscriberCount === 0) {
    return;
  }

  if (isStreamSilent(streamState)) {
    updateStreamState((currentState) => {
      if (!currentState.isConnected || currentState.isDegraded) {
        return currentState;
      }

      return {
        ...currentState,
        status: "degraded",
        isConnected: true,
        isDegraded: true,
      };
    });
  }
}

function ensureStreamHealthMonitor() {
  if (streamHealthInterval || typeof window === "undefined") {
    return;
  }

  streamHealthInterval = setInterval(() => {
    evaluateStreamHealth();
  }, STREAM_HEALTH_CHECK_MS);
}

function clearStreamHealthMonitor() {
  if (streamHealthInterval) {
    clearInterval(streamHealthInterval);
    streamHealthInterval = null;
  }
}

function getStatusToastType(status?: string): NotificationToastPayload["type"] {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "success" || normalizedStatus === "completed") {
    return "success";
  }

  if (
    normalizedStatus === "failed" ||
    normalizedStatus === "error" ||
    normalizedStatus === "cancelled"
  ) {
    return "error";
  }

  return "info";
}

function getToastMessageFromItem(
  item: NotificationSyncItem | NotificationBotItem | Record<string, unknown>,
) {
  const itemRecord = item as Record<string, unknown>;
  const status = typeof itemRecord.status === "string" ? itemRecord.status : undefined;
  const messageValue =
    typeof itemRecord.message === "string" && itemRecord.message.trim()
      ? itemRecord.message.trim()
      : typeof itemRecord.error_message === "string" &&
          itemRecord.error_message.trim()
        ? itemRecord.error_message.trim()
        : undefined;
  const outputValue =
    typeof itemRecord.output === "string" && itemRecord.output.trim()
      ? itemRecord.output.trim()
      : undefined;

  if (messageValue) {
    return {
      type: getStatusToastType(status),
      content: messageValue,
    };
  }

  if (status) {
    return {
      type: getStatusToastType(status),
      content: `Status updated to ${status}`,
    };
  }

  if (outputValue) {
    return {
      type: "info" as const,
      content: "New output received",
    };
  }

  return null;
}

function buildToastPayloads(
  eventName: string,
  payload: unknown,
): NotificationToastPayload[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const value = payload as Record<string, unknown>;
  const data = value.data ?? payload;
  const normalizedData =
    data && typeof data === "object" ? (data as Record<string, unknown>) : value;
  const items: Array<NotificationSyncItem | NotificationBotItem | Record<string, unknown>> = [];

  if (Array.isArray(normalizedData.sync)) {
    items.push(
      ...(normalizedData.sync.filter(
        (item) => item && typeof item === "object",
      ) as Record<string, unknown>[]),
    );
  }

  if (Array.isArray(normalizedData.bots)) {
    items.push(
      ...(normalizedData.bots.filter(
        (item) => item && typeof item === "object",
      ) as Record<string, unknown>[]),
    );
  }

  if (normalizedData.notebooks && typeof normalizedData.notebooks === "object") {
    const notebookPayload = normalizedData.notebooks as Record<string, unknown>;

    if (Array.isArray(notebookPayload.notebook_runs)) {
      items.push(
        ...(notebookPayload.notebook_runs.filter(
          (item) => item && typeof item === "object",
        ) as Record<string, unknown>[]),
      );
    }

    if (Array.isArray(notebookPayload.spark_job_runs)) {
      items.push(
        ...(notebookPayload.spark_job_runs.filter(
          (item) => item && typeof item === "object",
        ) as Record<string, unknown>[]),
      );
    }

    if (Array.isArray(notebookPayload.schedule_runs)) {
      items.push(
        ...(notebookPayload.schedule_runs.filter(
          (item) => item && typeof item === "object",
        ) as Record<string, unknown>[]),
      );
    }
  }

  if (items.length === 0 && normalizedData && typeof normalizedData === "object") {
    items.push(normalizedData);
  }

  return items
    .map((item) => {
      const toastMessage = getToastMessageFromItem(item);
      if (!toastMessage) {
        return null;
      }

      const id =
        typeof item.id === "string"
          ? item.id
          : typeof normalizedData.id === "string"
            ? normalizedData.id
            : eventName;
      const status = typeof item.status === "string" ? item.status : "";
      const updatedAt =
        typeof item.updated_at === "string"
          ? item.updated_at
          : typeof item.created_at === "string"
            ? item.created_at
            : "";

      return {
        key: `${eventName}:${id}:${status}:${toastMessage.content}:${updatedAt}`,
        ...toastMessage,
      } satisfies NotificationToastPayload;
    })
    .filter((item): item is NotificationToastPayload => Boolean(item));
}

function pruneRecentToastEvents(now: number) {
  recentToastEvents.forEach((timestamp, key) => {
    if (now - timestamp > TOAST_DEDUPE_WINDOW_MS) {
      recentToastEvents.delete(key);
    }
  });
}

function flushQueuedToasts() {
  toastFlushTimeout = null;
  const payloads = Array.from(queuedToastPayloads.values());
  queuedToastPayloads.clear();

  payloads.forEach((toast) => {
    message.open({
      type: toast.type,
      content: toast.content,
      duration: 3,
    });
  });
}

function scheduleToastFlush() {
  if (toastFlushTimeout) {
    return;
  }

  toastFlushTimeout = setTimeout(() => {
    flushQueuedToasts();
  }, TOAST_FLUSH_MS);
}

function showNotificationToasts(eventName: string, payload: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();
  pruneRecentToastEvents(now);

  buildToastPayloads(eventName, payload).forEach((toast) => {
    const lastSeenAt = recentToastEvents.get(toast.key);
    if (lastSeenAt && now - lastSeenAt < TOAST_DEDUPE_WINDOW_MS) {
      return;
    }

    recentToastEvents.set(toast.key, now);
    queuedToastPayloads.set(toast.key, toast);
  });

  scheduleToastFlush();
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

  queryEntries.forEach(([queryKey]) => {
    queryClient.setQueryData<NotificationFeedResponse>(queryKey, (existing) =>
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
  if (
    !reconnectEnabled ||
    subscriberCount === 0 ||
    reconnectTimeout ||
    activeAbortController
  ) {
    return;
  }

  const nextAttempt = reconnectAttempt + 1;
  const retryDelay = Math.min(
    STREAM_RETRY_BASE_MS * 2 ** Math.max(0, nextAttempt - 1),
    STREAM_RETRY_MAX_MS,
  );

  reconnectAttempt = nextAttempt;
  updateStreamState({
    status: "degraded",
    isConnected: false,
    isDegraded: true,
    reconnectAttempt,
  });

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    void openNotificationStream();
  }, retryDelay);
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
    updateStreamState({
      status: "disconnected",
      isConnected: false,
      isDegraded: true,
    });
    return;
  }

  const controller = new AbortController();
  const decoder = new TextDecoder();
  activeAbortController = controller;
  updateStreamState({
    status: streamState.lastConnectedAt ? "degraded" : "connecting",
    isConnected: false,
    isDegraded: Boolean(streamState.lastConnectedAt),
    reconnectAttempt,
  });

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
      const now = Date.now();
      updateStreamState({
        status: "connected",
        isConnected: true,
        isDegraded: false,
        lastEventAt: now,
      });
      showNotificationToasts(eventName, parsed);
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

    reconnectAttempt = 0;
    clearReconnectTimeout();
    updateStreamState({
      status: "connected",
      isConnected: true,
      isDegraded: false,
      reconnectAttempt: 0,
      lastConnectedAt: Date.now(),
    });

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
      return;
    }

    updateStreamState({
      status: "disconnected",
      isConnected: false,
      isDegraded: true,
    });
  }
}

function closeNotificationStream(disableReconnect: boolean = false) {
  if (disableReconnect) {
    reconnectEnabled = false;
  }

  clearReconnectTimeout();
  clearStreamHealthMonitor();

  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }

  if (disableReconnect) {
    updateStreamState({
      status: "disconnected",
      isConnected: false,
      isDegraded: true,
      reconnectAttempt: 0,
    });
  }
}

export function useNotificationStream() {
  const queryClient = useQueryClient();
  const [currentStreamState, setCurrentStreamState] =
    useState<NotificationStreamState>(streamState);

  useEffect(() => {
    streamStateListeners.add(setCurrentStreamState);

    return () => {
      streamStateListeners.delete(setCurrentStreamState);
    };
  }, []);

  useEffect(() => {
    activeQueryClient = queryClient;
    subscriberCount += 1;
    reconnectEnabled = true;
    clearReconnectTimeout();
    ensureStreamHealthMonitor();
    void openNotificationStream();

    const restartStream = () => {
      reconnectAttempt = 0;
      closeNotificationStream();
      void openNotificationStream();
    };

    const stopStream = () => {
      reconnectAttempt = 0;
      closeNotificationStream(true);
    };

    window.addEventListener("auth-token-updated", restartStream);
    window.addEventListener("auth-logout", stopStream);

    return () => {
      subscriberCount = Math.max(0, subscriberCount - 1);

      window.removeEventListener("auth-token-updated", restartStream);
      window.removeEventListener("auth-logout", stopStream);

      if (subscriberCount === 0) {
        reconnectAttempt = 0;
        closeNotificationStream(true);
        clearStreamHealthMonitor();
      }
    };
  }, [queryClient]);

  return currentStreamState;
}
