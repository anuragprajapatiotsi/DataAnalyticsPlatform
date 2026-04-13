"use client";

import { API_BASE_URL } from "@/shared/api/axios";
import { api } from "@/shared/api/axios";
import type {
  AskChatRequest,
  AskChatResponse,
  ChatDebugTraceResponse,
  ChatSessionDetail,
  ChatSessionSummary,
} from "@/features/chatbot/types";

function normalizeStreamPayload(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return normalizeStreamPayload((payload as Record<string, unknown>).data);
  }

  return payload;
}

function extractStreamText(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidateKeys = [
    "answer_delta",
    "delta",
    "content_delta",
    "token",
    "chunk",
    "message",
  ];

  for (const key of candidateKeys) {
    if (typeof record[key] === "string" && record[key]) {
      return record[key] as string;
    }
  }

  return null;
}

function isTerminalStreamEvent(eventName: string, payload: unknown) {
  if (["done", "complete", "completed", "end"].includes(eventName.toLowerCase())) {
    return true;
  }

  if (!payload || typeof payload !== "object") {
    return false;
  }

  const record = payload as Record<string, unknown>;
  const status = String(record.status || "").toLowerCase();

  return Boolean(record.done) || ["done", "completed", "complete", "success"].includes(status);
}

export const chatbotService = {
  async getSessions(params?: {
    skip?: number;
    limit?: number;
    has_debug_traces?: boolean;
    debug_mode?: "summary" | "full";
    sort_by?:
      | "updated_at"
      | "created_at"
      | "last_message_at"
      | "latest_trace_updated_at";
  }) {
    const response = await api.get<ChatSessionSummary[]>("/chat/sessions", {
      params,
    });

    return Array.isArray(response.data) ? response.data : [];
  },

  async createSession(payload?: { title?: string }) {
    const response = await api.post<ChatSessionSummary>("/chat/sessions", {
      title: payload?.title?.trim() || "New AI Chat",
    });

    return response.data;
  },

  async getSessionDetail(
    sessionId: string,
    params?: { include_debug_trace?: boolean },
  ) {
    const response = await api.get<ChatSessionDetail>(`/chat/sessions/${sessionId}`, {
      params,
    });

    return response.data;
  },

  async askSession(sessionId: string, payload: AskChatRequest) {
    const response = await api.post<AskChatResponse>(
      `/chat/sessions/${sessionId}/ask`,
      payload,
    );

    return response.data;
  },

  async streamSession(
    sessionId: string,
    payload: AskChatRequest,
    callbacks?: {
      onText?: (text: string) => void;
      onEvent?: (eventName: string, payload: unknown) => void;
    },
  ): Promise<AskChatResponse | null> {
    const token =
      typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/${sessionId}/messages/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok || !response.body) {
      let errorMessage = "Failed to stream chatbot response.";

      try {
        const errorPayload = (await response.json()) as { message?: string };
        if (typeof errorPayload?.message === "string" && errorPayload.message.trim()) {
          errorMessage = errorPayload.message;
        }
      } catch {
        // ignore parsing fallback
      }

      throw new Error(errorMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let eventName = "message";
    let eventData = "";
    let accumulatedText = "";
    let finalResponse: AskChatResponse | null = null;

    const flushEvent = () => {
      if (!eventData.trim()) {
        eventName = "message";
        eventData = "";
        return false;
      }

      let parsedPayload: unknown = eventData;
      try {
        parsedPayload = JSON.parse(eventData);
      } catch {
        parsedPayload = eventData;
      }

      const normalizedPayload = normalizeStreamPayload(parsedPayload);
      callbacks?.onEvent?.(eventName, normalizedPayload);

      if (
        normalizedPayload &&
        typeof normalizedPayload === "object" &&
        typeof (normalizedPayload as Record<string, unknown>).answer === "string"
      ) {
        accumulatedText = (normalizedPayload as { answer: string }).answer;
        callbacks?.onText?.(accumulatedText);
      } else {
        const textChunk = extractStreamText(normalizedPayload);
        if (textChunk) {
          accumulatedText += textChunk;
          callbacks?.onText?.(accumulatedText);
        }
      }

      if (
        normalizedPayload &&
        typeof normalizedPayload === "object" &&
        typeof (normalizedPayload as Record<string, unknown>).session_id === "string"
      ) {
        finalResponse = normalizedPayload as AskChatResponse;
      }

      const shouldStop = isTerminalStreamEvent(eventName, normalizedPayload);
      eventName = "message";
      eventData = "";
      return shouldStop;
    };

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
          const shouldStop = flushEvent();
          if (shouldStop) {
            await reader.cancel();
            return finalResponse;
          }
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

    return finalResponse;
  },

  async visualizeMessage(
    sessionId: string,
    messageId: string,
    payload: { type: string },
  ) {
    const response = await api.post<AskChatResponse>(
      `/chat/sessions/${sessionId}/messages/${messageId}/visualize`,
      payload,
    );

    return response.data;
  },

  async getMessageDebug(
    sessionId: string,
    messageId: string,
    params?: { debug_mode?: "summary" | "full" },
  ) {
    const response = await api.get<ChatDebugTraceResponse>(
      `/chat/sessions/${sessionId}/messages/${messageId}/debug`,
      {
        params,
      },
    );

    return response.data;
  },

  async exportSessionDebug(sessionId: string) {
    const response = await api.get(
      `/chat/sessions/${sessionId}/debug/export`,
      {
        responseType: "blob",
      },
    );

    return response.data;
  },
};
