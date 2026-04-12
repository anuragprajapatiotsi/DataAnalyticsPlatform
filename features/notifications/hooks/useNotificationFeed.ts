"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import {
  NOTIFICATION_FEED_MAX_LIMIT,
  NOTIFICATION_FEED_QUERY_KEY,
} from "../constants";
import { useNotificationStreamStatus } from "../components/notification-provider";
import type { NotificationFeedResponse } from "../types";

function sliceNotificationFeed(
  data: NotificationFeedResponse,
  limit: number,
): NotificationFeedResponse {
  if (limit >= NOTIFICATION_FEED_MAX_LIMIT) {
    return data;
  }

  return {
    ...data,
    sync: data.sync.slice(0, limit),
    bots: data.bots.slice(0, limit),
    notebooks: data.notebooks
      ? {
          notebook_runs: (data.notebooks.notebook_runs ?? []).slice(0, limit),
          spark_job_runs: (data.notebooks.spark_job_runs ?? []).slice(0, limit),
          schedule_runs: (data.notebooks.schedule_runs ?? []).slice(0, limit),
        }
      : undefined,
  };
}

export function useNotificationFeed(limit: number = 10) {
  const notificationStream = useNotificationStreamStatus();
  const queryClient = useQueryClient();
  const requestedLimit = Math.min(limit, NOTIFICATION_FEED_MAX_LIMIT);
  const maxFeedQueryKey = [
    ...NOTIFICATION_FEED_QUERY_KEY,
    NOTIFICATION_FEED_MAX_LIMIT,
  ] as const;
  const queryKey = [...NOTIFICATION_FEED_QUERY_KEY, requestedLimit] as const;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (requestedLimit === NOTIFICATION_FEED_MAX_LIMIT) {
        return notificationService.getFeed(NOTIFICATION_FEED_MAX_LIMIT);
      }

      const sharedFeed = await queryClient.fetchQuery({
        queryKey: maxFeedQueryKey,
        queryFn: () => notificationService.getFeed(NOTIFICATION_FEED_MAX_LIMIT),
        staleTime: 30 * 1000,
      });

      return sliceNotificationFeed(sharedFeed, requestedLimit);
    },
    initialData: () => {
      if (requestedLimit === NOTIFICATION_FEED_MAX_LIMIT) {
        return queryClient.getQueryData(maxFeedQueryKey);
      }

      const sharedFeed = queryClient.getQueryData<NotificationFeedResponse>(
        maxFeedQueryKey,
      );

      return sharedFeed
        ? sliceNotificationFeed(sharedFeed, requestedLimit)
        : undefined;
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(maxFeedQueryKey)?.dataUpdatedAt,
    staleTime: 30 * 1000,
    refetchInterval: notificationStream.isDegraded ? 5000 : false,
    refetchIntervalInBackground: notificationStream.isDegraded,
  });
}
