"use client";

import { useQuery } from "@tanstack/react-query";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";

export const CHAT_MESSAGE_DEBUG_QUERY_KEY = ["chat-message-debug"] as const;

export function useChatMessageDebug(
  sessionId?: string,
  messageId?: string | null,
  params?: { debug_mode?: "summary" | "full" },
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: [...CHAT_MESSAGE_DEBUG_QUERY_KEY, sessionId, messageId, params || {}],
    queryFn: () =>
      chatbotService.getMessageDebug(sessionId as string, messageId as string, params),
    enabled: Boolean(sessionId && messageId && enabled),
    staleTime: 10 * 1000,
  });
}
