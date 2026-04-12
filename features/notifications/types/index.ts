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

export interface NotificationNotebookRunItem {
  id: string;
  category: "notebooks" | "notebook_runs" | string;
  notebook_id?: string;
  notebook_name?: string;
  spark_job_id?: string | null;
  spark_job_name?: string | null;
  schedule_id?: string | null;
  schedule_name?: string | null;
  status: string;
  trigger_source?: string;
  message?: string;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface NotificationNotebookFeed {
  notebook_runs: NotificationNotebookRunItem[];
  spark_job_runs: NotificationNotebookRunItem[];
  schedule_runs: NotificationNotebookRunItem[];
}

export interface NotificationFeedResponse {
  org_id: string;
  user_id: string;
  sync: NotificationSyncItem[];
  bots: NotificationBotItem[];
  notebooks?: NotificationNotebookFeed;
}

export type NotificationStreamStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "degraded"
  | "disconnected";

export interface NotificationStreamState {
  status: NotificationStreamStatus;
  isConnected: boolean;
  isDegraded: boolean;
  reconnectAttempt: number;
  lastConnectedAt: number | null;
  lastEventAt: number | null;
}
