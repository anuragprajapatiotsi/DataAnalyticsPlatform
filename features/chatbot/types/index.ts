"use client";

export interface ChatSessionSummary {
  id: string;
  title: string;
  summary?: string | null;
  is_active: boolean;
  last_message_at?: string | null;
  has_debug_traces?: boolean;
  debug_trace_count?: number;
  latest_debug_mode?: string | null;
  latest_trace_updated_at?: string | null;
}

export interface ChatResultPreviewColumnMetadata {
  display_label?: string;
  type?: string;
  description?: string;
}

export interface ChatResultPreview {
  columns: string[];
  rows?: unknown[][];
  row_objects?: Record<string, unknown>[];
  display_fields?: Record<string, string>;
  column_metadata?: Record<string, ChatResultPreviewColumnMetadata>;
  row_count?: number;
}

export interface ChatVisualizationConfig {
  type?: string;
  title?: string;
  x?: string;
  x_label?: string;
  y?: string;
  y_label?: string;
  series?: string[];
  series_label?: string;
  columns?: string[];
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
  sql_generated?: string | null;
  source_assets?: string[];
  visualization?: ChatVisualizationConfig | null;
  retrieved_chunks?: unknown[];
  message_metadata?: Record<string, unknown> | null;
  has_debug_trace?: boolean;
  trace_version?: number | null;
  trace_updated_at?: string | null;
}

export interface ChatSessionDetail extends ChatSessionSummary {
  messages: ChatMessage[];
}

export interface AskChatRequest {
  content: string;
  top_k?: number;
  max_rows?: number;
  max_recent_messages?: number;
  use_graph?: boolean;
  execute_sql?: boolean;
  debug_mode?: "summary" | "full";
}

export interface AskChatResponse {
  session_id: string;
  user_message_id: string;
  assistant_message_id: string;
  answer: string;
  sql_generated?: string | null;
  sql_executed?: boolean;
  execution_target?: string | null;
  source_assets?: string[];
  retrieved_chunks?: unknown[];
  graph_facts?: unknown[];
  result_preview?: ChatResultPreview | null;
  visualization?: ChatVisualizationConfig | null;
  chart_options?: ChatVisualizationConfig[];
  chart_prompt?: string | null;
  needs_clarification?: boolean;
  clarification_options?: string[];
}

export interface ChatDebugTraceResponse {
  [key: string]: unknown;
}
