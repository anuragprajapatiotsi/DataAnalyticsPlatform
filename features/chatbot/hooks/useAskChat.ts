"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";
import {
  CHAT_SESSIONS_QUERY_KEY,
} from "@/features/chatbot/hooks/useChatSessions";
import {
  CHAT_SESSION_QUERY_KEY,
} from "@/features/chatbot/hooks/useChatSessionDetail";
import type { AskChatRequest } from "@/features/chatbot/types";

export function useAskChat(sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AskChatRequest) =>
      chatbotService.askSession(sessionId as string, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: [...CHAT_SESSION_QUERY_KEY, sessionId],
        }),
      ]);
    },
  });
}
