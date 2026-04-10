import { api } from "@/shared/api/axios";
import type { NotificationFeedResponse } from "../types";

export const notificationService = {
  async getFeed(limit: number = 10) {
    const response = await api.get<NotificationFeedResponse>(
      "/notifications/feed",
      {
        params: { limit },
      },
    );
    return response.data;
  },
};

