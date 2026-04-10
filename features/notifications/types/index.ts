export interface NotificationSyncItem {
  id: string;
  category: "sync" | string;
  catalog_view_id: string;
  catalog_view_name: string;
  status: string;
  trigger: string;
  rows_synced: number;
  columns_synced: number;
  error_message: string | null;
  external_job_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationBotItem {
  id: string;
  category: "bots" | string;
  bot_id: string;
  bot_name: string;
  status: string;
  trigger_source: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationFeedResponse {
  org_id: string;
  user_id: string;
  sync: NotificationSyncItem[];
  bots: NotificationBotItem[];
}

