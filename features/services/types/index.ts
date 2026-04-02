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

export interface CatalogSchema {
  id: string;
  name: string;
  children_count: number;
}

export interface CatalogDatabase {
  id: string;
  name: string;
  schemas: CatalogSchema[];
  children_count: number;
}

export interface CatalogResponse {
  databases: CatalogDatabase[];
}

export interface CatalogAsset {
  id: string;
  name: string;
  display_name?: string;
  asset_type: "table" | "view" | "function";
  row_count?: number;
  size_bytes?: number;
  observability_score?: number;
  classification_tags?: Array<{
    id: string;
    name: string;
    display_name: string;
    color?: string;
  }>;
  description?: string;
}

export interface DataAssetColumn {
  id: string;
  name: string;
  data_type: string;
  display_name?: string;
  description?: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key?: boolean;
  is_pii?: boolean;
  sensitivity?: string;
  tags?: Array<{
    id: string;
    name: string;
    display_name: string;
    color?: string;
  }>;
}

export interface DataColumnDetail {
  name: string;
  display_name?: string;
  description?: string;
  data_type: string;
  ordinal_position: number;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  is_pii: boolean;
  sensitivity?: string;
  default_value?: any;
  extra_metadata?: {
    numeric_precision?: number;
    scale?: number;
    char_max_length?: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface DataAssetDetail extends CatalogAsset {
  fully_qualified_name: string;
  sensitivity?: "PII" | "Internal" | "Restricted" | "Public";
  tier?: "Bronze" | "Silver" | "Gold" | "Platinum";
  owners?: Array<{ id: string; name: string; email?: string }>;
  experts?: Array<{ id: string; name: string; email?: string }>;
  columns: DataAssetColumn[];
  created_at?: string;
  updated_at?: string;
}

export interface ColumnProfile {
  null_count: number;
  null_percentage: number;
  distinct_count: number;
  distinct_percentage: number;
  min?: any;
  max?: any;
  avg?: number;
  median?: number;
  std_dev?: number;
  histogram?: Array<{ value: any; count: number }>;
}

export interface DataAssetProfile {
  id: string;
  asset_id: string;
  row_count: number;
  profile_data: Record<string, any>;
  column_profiles: Record<string, ColumnProfile>;
  started_at: string;
  completed_at: string;
}

export interface ColumnProfilingResponse {
  column_name: string;
  data_type: string;
  stats: {
    null_count: number;
    null_pct: number;
    distinct_count: number;
    min_val: any;
    max_val: any;
    mean_val?: number;
    stddev_val?: number;
    top_values: Array<{ value: any; count: number }>;
    histogram: Array<{ bucket: any; count: number }>;
    profiled_at: string;
  };
  rows: any[];
  total_matching: number;
  skip: number;
  limit: number;
}

export interface UpdateColumnRequest {
  display_name?: string;
  description?: string;
  data_type?: string;
  ordinal_position?: number;
  is_nullable?: boolean;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  is_pii?: boolean;
  sensitivity?: string;
  classification_locked?: boolean;
  default_value?: string;
}

export interface BulkUpdateColumnItem extends UpdateColumnRequest {
  name: string;
}

export interface CatalogView {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  source_connection_id?: string | null;
  source_schema?: string | null;
  source_table?: string | null;
  source_object_type?: string;
  tags?: any[];
  glossary_term_ids?: string[];
  synonyms?: string[];
  sync_mode?: "auto" | "scheduled" | "on_demand" | string;
  cron_expr?: string | null;
  sync_config?: Record<string, any>;
  org_id?: string;
  asset_id?: string | null;
  sync_status?: "success" | "never" | "failed" | string;
  sync_error?: string | null;
  last_synced_at?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SyncConfig {
  sync_config: {
    iceberg_table?: string;
    last_export_rows?: number;
    last_iceberg_table?: string;
    last_airflow_run_id?: string;
    last_export_columns?: string[];
    current_airflow_run_id?: string;
    last_export_finished_at?: string;
    [key: string]: any;
  };
  effective_config: {
    batch_size?: number;
    max_rows_per_table?: number;
    parquet_compression?: string;
    parquet_partition_col?: string;
    max_concurrent_syncs?: number;
    [key: string]: any;
  };
}
