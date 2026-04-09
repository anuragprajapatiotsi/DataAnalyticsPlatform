"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import { NOTIFICATION_FEED_QUERY_KEY } from "../constants";
import { useNotificationStream } from "./useNotificationStream";

export function useNotificationFeed(limit: number = 10) {
  useNotificationStream();

  return useQuery({
    queryKey: [...NOTIFICATION_FEED_QUERY_KEY, limit],
    queryFn: () => notificationService.getFeed(limit),
    staleTime: 30 * 1000,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
}
