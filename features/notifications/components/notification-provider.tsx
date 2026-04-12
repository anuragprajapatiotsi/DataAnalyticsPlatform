"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useNotificationStream } from "@/features/notifications/hooks/useNotificationStream";
import type { NotificationStreamState } from "@/features/notifications/types";

const DEFAULT_NOTIFICATION_STREAM_STATE: NotificationStreamState = {
  status: "idle",
  isConnected: false,
  isDegraded: true,
  reconnectAttempt: 0,
  lastConnectedAt: null,
  lastEventAt: null,
};

const NotificationStreamContext = createContext<NotificationStreamState>(
  DEFAULT_NOTIFICATION_STREAM_STATE,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const streamState = useNotificationStream();

  return (
    <NotificationStreamContext.Provider value={streamState}>
      {children}
    </NotificationStreamContext.Provider>
  );
}

export function useNotificationStreamStatus() {
  return useContext(NotificationStreamContext);
}
