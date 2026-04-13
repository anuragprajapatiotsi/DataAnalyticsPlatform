"use client";

import { useQuery } from "@tanstack/react-query";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";

export const CHAT_SESSION_QUERY_KEY = ["chat-session"] as const;

export function useChatSessionDetail(
  sessionId?: string,
  params?: { include_debug_trace?: boolean },
) {
  return useQuery({
    queryKey: [...CHAT_SESSION_QUERY_KEY, sessionId, params || {}],
    queryFn: () => chatbotService.getSessionDetail(sessionId as string, params),
    enabled: Boolean(sessionId),
    staleTime: 10 * 1000,
  });
}
