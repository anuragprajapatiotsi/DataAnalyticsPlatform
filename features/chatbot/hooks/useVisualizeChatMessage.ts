"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";
import { CHAT_SESSION_QUERY_KEY } from "@/features/chatbot/hooks/useChatSessionDetail";
import { CHAT_SESSIONS_QUERY_KEY } from "@/features/chatbot/hooks/useChatSessions";

export function useVisualizeChatMessage(
  sessionId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      messageId: string;
      type: string;
      x?: string;
      y?: string;
      series?: string[];
      columns?: string[];
    }) => {
      const { messageId, ...visualizationPayload } = payload;

      return chatbotService.visualizeMessage(
        sessionId as string,
        messageId,
        {
          chart_type: visualizationPayload.type,
          x: visualizationPayload.x,
          y: visualizationPayload.y,
          series: visualizationPayload.series,
          columns: visualizationPayload.columns,
        },
      );
    },
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
