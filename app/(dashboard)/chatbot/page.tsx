"use client";

import React from "react";
import { message } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { chatbotService } from "@/features/chatbot/services/chatbot.service";
import { ChatSessionList } from "@/features/chatbot/components/ChatSessionList";
import { useChatSessions } from "@/features/chatbot/hooks/useChatSessions";

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const messageValue = (error as { message?: string }).message;
    if (typeof messageValue === "string" && messageValue.trim()) {
      return messageValue;
    }
  }

  return fallback;
}

export default function ChatbotPage() {
  const router = useRouter();
  const {
    data: sessions = [],
    isLoading,
    refetch,
    isFetching,
  } = useChatSessions({
    skip: 0,
    limit: 20,
    sort_by: "last_message_at",
  });

  const createSessionMutation = useMutation({
    mutationFn: () => chatbotService.createSession({ title: "New AI Chat" }),
    onSuccess: (session) => {
      message.success("Chat session created.");
      router.push(`/chatbot/${session.id}`);
    },
    onError: (error: unknown) => {
      message.error(getMutationErrorMessage(error, "Failed to create chat session."));
    },
  });

  return (
    <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col gap-6 px-6 py-5">
      <PageHeader
        title="Chatbot"
        description="Start a new AI chat session or jump back into an existing analytics conversation."
        breadcrumbItems={[{ label: "Chatbot" }]}
      />

      <div className="min-h-0 flex-1">
        <ChatSessionList
          sessions={sessions}
          isLoading={isLoading}
          isCreating={createSessionMutation.isPending}
          onSelectSession={(sessionId) => router.push(`/chatbot/${sessionId}`)}
          onCreateSession={() => createSessionMutation.mutate()}
          onRefresh={() => void refetch()}
          isRefreshing={isFetching}
        />
      </div>
    </div>
  );
}
