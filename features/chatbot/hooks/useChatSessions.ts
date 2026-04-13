"use client";

import { useQuery } from "@tanstack/react-query";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";

export const CHAT_SESSIONS_QUERY_KEY = ["chat-sessions"] as const;

export function useChatSessions(params?: {
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
  return useQuery({
    queryKey: [...CHAT_SESSIONS_QUERY_KEY, params || {}],
    queryFn: () => chatbotService.getSessions(params),
    staleTime: 30 * 1000,
  });
}
