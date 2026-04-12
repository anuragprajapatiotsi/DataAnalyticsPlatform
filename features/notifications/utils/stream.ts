import type {
  NotificationBotItem,
  NotificationFeedResponse,
  NotificationNotebookRunItem,
  NotificationSyncItem,
} from "@/features/notifications/types";

type NotificationFeedItem = {
  id: string;
  created_at: string;
  updated_at: string;
};

function getItemTimestamp(item: Pick<NotificationFeedItem, "updated_at" | "created_at">) {
  const timestamp = item.updated_at || item.created_at;
  const value = new Date(timestamp).getTime();
  return Number.isNaN(value) ? 0 : value;
}

export function isSyncItem(value: unknown): value is NotificationSyncItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    (item.category === "sync" || typeof item.catalog_view_id === "string")
  );
}

export function isBotItem(value: unknown): value is NotificationBotItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    ((item.category === "bots" || item.category === "bot_runs") ||
      typeof item.bot_id === "string")
  );
}

export function isNotebookItem(value: unknown): value is NotificationNotebookRunItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    (item.category === "notebooks" ||
      item.category === "notebook_runs" ||
      typeof item.notebook_id === "string" ||
      typeof item.spark_job_id === "string" ||
      typeof item.schedule_id === "string")
  );
}

export function normalizeNotificationPayload(
  payload: unknown,
): Partial<NotificationFeedResponse> | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const value = payload as Record<string, unknown>;

  if (value.data) {
    return normalizeNotificationPayload(value.data);
  }

  if (
    Array.isArray(value.sync) ||
    Array.isArray(value.bots) ||
    (value.notebooks && typeof value.notebooks === "object")
  ) {
    return {
      org_id: typeof value.org_id === "string" ? value.org_id : "",
      user_id: typeof value.user_id === "string" ? value.user_id : "",
      sync: Array.isArray(value.sync) ? value.sync.filter(isSyncItem) : [],
      bots: Array.isArray(value.bots) ? value.bots.filter(isBotItem) : [],
      notebooks:
        value.notebooks && typeof value.notebooks === "object"
          ? {
              notebook_runs: Array.isArray(
                (value.notebooks as Record<string, unknown>).notebook_runs,
              )
                ? ((value.notebooks as Record<string, unknown>).notebook_runs as unknown[]).filter(
                    isNotebookItem,
                  )
                : [],
              spark_job_runs: Array.isArray(
                (value.notebooks as Record<string, unknown>).spark_job_runs,
              )
                ? ((value.notebooks as Record<string, unknown>).spark_job_runs as unknown[]).filter(
                    isNotebookItem,
                  )
                : [],
              schedule_runs: Array.isArray(
                (value.notebooks as Record<string, unknown>).schedule_runs,
              )
                ? ((value.notebooks as Record<string, unknown>).schedule_runs as unknown[]).filter(
                    isNotebookItem,
                  )
                : [],
            }
          : undefined,
    };
  }

  if (isSyncItem(value)) {
    return {
      sync: [value],
      bots: [],
    };
  }

  if (isBotItem(value)) {
    return {
      sync: [],
      bots: [
        {
          ...value,
          category: value.category === "bot_runs" ? "bots" : value.category,
        },
      ],
    };
  }

  if (isNotebookItem(value)) {
    const category = String(value.category || "").toLowerCase();

    return {
      sync: [],
      bots: [],
      notebooks: {
        notebook_runs:
          category === "schedule_runs" || category === "spark_job_runs" ? [] : [value],
        spark_job_runs: category === "spark_job_runs" ? [value] : [],
        schedule_runs: category === "schedule_runs" ? [value] : [],
      },
    };
  }

  if (isSyncItem(value.sync)) {
    return {
      sync: [value.sync],
      bots: [],
    };
  }

  if (isBotItem(value.bots)) {
    return {
      sync: [],
      bots: [value.bots],
    };
  }

  return null;
}

export function isIncomingNewerEvent<T extends NotificationFeedItem>(existing: T, incoming: T) {
  return getItemTimestamp(incoming) >= getItemTimestamp(existing);
}

export function sortNotificationItemsByNewest<T extends NotificationFeedItem>(items: T[]) {
  return [...items].sort((first, second) => getItemTimestamp(second) - getItemTimestamp(first));
}

export function mergeNotificationItemsById<T extends NotificationFeedItem>(
  existing: T[],
  incoming: T[],
  limit?: number,
) {
  const mergedMap = new Map<string, T>();

  existing.forEach((item) => {
    mergedMap.set(item.id, item);
  });

  incoming.forEach((item) => {
    const previous = mergedMap.get(item.id);
    if (!previous || isIncomingNewerEvent(previous, item)) {
      mergedMap.set(item.id, item);
    }
  });

  const mergedItems = sortNotificationItemsByNewest(Array.from(mergedMap.values()));

  return typeof limit === "number" ? mergedItems.slice(0, limit) : mergedItems;
}

export function mergeNotificationFeed(
  existing: NotificationFeedResponse | undefined,
  incoming: Partial<NotificationFeedResponse>,
  limit?: number,
): NotificationFeedResponse {
  const currentSync = existing?.sync ?? [];
  const currentBots = existing?.bots ?? [];
  const currentNotebookRuns = existing?.notebooks?.notebook_runs ?? [];
  const currentSparkJobRuns = existing?.notebooks?.spark_job_runs ?? [];
  const currentScheduleRuns = existing?.notebooks?.schedule_runs ?? [];
  const incomingSync = incoming.sync ?? [];
  const incomingBots = incoming.bots ?? [];
  const incomingNotebookRuns = incoming.notebooks?.notebook_runs ?? [];
  const incomingSparkJobRuns = incoming.notebooks?.spark_job_runs ?? [];
  const incomingScheduleRuns = incoming.notebooks?.schedule_runs ?? [];

  return {
    org_id: incoming.org_id || existing?.org_id || "",
    user_id: incoming.user_id || existing?.user_id || "",
    sync: mergeNotificationItemsById(currentSync, incomingSync, limit),
    bots: mergeNotificationItemsById(currentBots, incomingBots, limit),
    notebooks: {
      notebook_runs: mergeNotificationItemsById(
        currentNotebookRuns,
        incomingNotebookRuns,
        limit,
      ),
      spark_job_runs: mergeNotificationItemsById(
        currentSparkJobRuns,
        incomingSparkJobRuns,
        limit,
      ),
      schedule_runs: mergeNotificationItemsById(
        currentScheduleRuns,
        incomingScheduleRuns,
        limit,
      ),
    },
  };
}
