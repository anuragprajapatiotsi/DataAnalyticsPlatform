"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";
import { CHAT_SESSION_QUERY_KEY } from "@/features/chatbot/hooks/useChatSessionDetail";
import { CHAT_SESSIONS_QUERY_KEY } from "@/features/chatbot/hooks/useChatSessions";

export function useVisualizeChatMessage(
  sessionId?: string,
  messageId?: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { type: string }) =>
      chatbotService.visualizeMessage(sessionId as string, messageId as string, payload),
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
