import type {
  NotificationBotItem,
  NotificationSyncItem,
} from "@/features/notifications/types";

export type NotificationCategory = "sync" | "bot_runs";

export interface NotificationListItem {
  id: string;
  category: NotificationCategory;
  title: string;
  subtitle: string;
  status: string;
  trigger: string;
  message: string;
  timestamp: string;
  raw: NotificationSyncItem | NotificationBotItem;
}

export function formatNotificationTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getNotificationStatusTone(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes("success") ||
    normalizedStatus.includes("completed") ||
    normalizedStatus.includes("active")
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    normalizedStatus.includes("fail") ||
    normalizedStatus.includes("error") ||
    normalizedStatus.includes("cancel")
  ) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (
    normalizedStatus.includes("running") ||
    normalizedStatus.includes("pending") ||
    normalizedStatus.includes("queued")
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
}

export function mapSyncNotification(
  item: NotificationSyncItem,
): NotificationListItem {
  const rows = item.rows_synced ?? 0;
  const columns = item.columns_synced ?? 0;
  const fallbackMessage = `${rows} rows synced, ${columns} columns synced`;

  return {
    id: item.id,
    category: "sync",
    title: item.catalog_view_name || "Catalog sync",
    subtitle: item.trigger ? `Triggered by ${item.trigger}` : "Sync activity",
    status: item.status || "unknown",
    trigger: item.trigger || "unknown",
    message: item.error_message || fallbackMessage,
    timestamp: item.updated_at || item.created_at,
    raw: item,
  };
}

export function mapBotNotification(
  item: NotificationBotItem,
): NotificationListItem {
  return {
    id: item.id,
    category: "bot_runs",
    title: item.bot_name || "Bot activity",
    subtitle: item.trigger_source
      ? `Triggered by ${item.trigger_source}`
      : "Bot run activity",
    status: item.status || "unknown",
    trigger: item.trigger_source || "unknown",
    message: item.message || "Bot event recorded",
    timestamp: item.updated_at || item.created_at,
    raw: item,
  };
}

export function sortNotificationsByNewest(items: NotificationListItem[]) {
  return [...items].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export function notificationSearchText(item: NotificationListItem) {
  return [
    item.title,
    item.subtitle,
    item.status,
    item.trigger,
    item.message,
    item.timestamp,
    ...Object.values(item.raw).map((value) => String(value ?? "")),
  ]
    .join(" ")
    .toLowerCase();
}

