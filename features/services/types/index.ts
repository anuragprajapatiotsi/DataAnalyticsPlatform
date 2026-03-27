export interface Service {
  id: string;
  name: string;
  display_label: string;
  description: string;
  type: string;
  integration_slug: string;
  integration_label: string;
  config: Record<string, any>;
  is_active: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceEndpoint {
  id: string;
  org_id: string;
  service_name: string;
  driver?: string;
  description: string;
  base_url: string;
  extra: Record<string, any>;
  internal_connection: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetServicesParams {
  search?: string;
  type?: string;
  skip?: number;
  limit?: number;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  type: string;
  integration_slug: string;
  config: Record<string, any>;
}

export interface ServiceEndpointRequest {
  service_name: string;
  base_url: string;
  extra: Record<string, any>;
  internal_connection: boolean;
  auto_trigger_bots: boolean;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  config?: Record<string, any>;
}

export interface DatabaseInfo {
  name: string;
  description?: string;
  type?: string;
  owners?: string[];
}

export interface GroupedServiceCategory {
  category?: string;
  category_name?: string;
  category_slug?: string;
  connections: ServiceEndpoint[];
}

export interface SchemaInfo {
  name: string;
  description?: string;
  owners?: string[];
  domains?: string[];
}

export interface DBObjectInfo {
  name: string;
  object_type: string;
  description?: string;
  owners?: string[];
  tags?: string[];
}

export interface ColumnInfo {
  name: string;
  data_type: string;
  is_nullable: boolean;
  ordinal_position: number;
  description?: string;
  tags?: string[];
  glossary_terms?: string[];
}

export interface DBTableDetail {
  schema: string;
  table: string;
  object_type: string;
  columns: ColumnInfo[];
  description?: string;
  owners?: string[];
  domains?: string[];
  tier?: string;
  retention_period?: string;
  certification?: string;
}

export interface Bot {
  id: string;
  name: string;
  bot_type: string;
  mode: string;
  is_enabled: boolean;
  trigger_mode: string;
  last_run_status?: string;
  last_run_at?: string;
  description?: string;
  config?: any;
}

export interface GetBotsParams {
  search?: string;
  bot_type?: string;
  mode?: string;
  is_enabled?: boolean;
  trigger_mode?: string;
  skip?: number;
  limit?: number;
}

export interface BotRun {
  id: string;
  bot_id: string;
  status: "success" | "failed" | "running" | "pending";
  trigger_source: "manual" | "scheduled" | "event";
  triggered_by?: string;
  started_at: string;
  completed_at?: string;
  output?: any;
  message?: string;
}

export interface GetBotRunsParams {
  skip?: number;
  limit?: number;
  status?: string;
}

export interface ConnectorMetadata {
  id: string;
  slug: string;
  display_label: string;
  icon?: string;
}

export interface AggregatedDatabase {
  name: string;
  endpoint_id: string;
  connection_name: string;
  connector_slug: string;
  connector_label: string;
}
