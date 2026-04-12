export type NotebookExecutionMode = "single_profile" | "mixed_profile";
export type NotebookExecutionProfile = "python" | "pyspark" | "sql_trino";

export interface Notebook {
  id: string;
  org_id?: string;
  name: string;
  path?: string;
  description?: string;
  execution_mode?: NotebookExecutionMode;
  default_execution_profile?: NotebookExecutionProfile;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface NotebookContent {
  cells?: unknown[];
  metadata?: Record<string, unknown>;
  nbformat?: number;
  nbformat_minor?: number;
  [key: string]: unknown;
}

export interface CreateNotebookRequest {
  name: string;
  description?: string;
  execution_mode: NotebookExecutionMode;
  default_execution_profile: NotebookExecutionProfile;
  content: NotebookContent;
}

export interface UpdateNotebookRequest {
  name?: string;
  description?: string;
  execution_mode?: NotebookExecutionMode;
  default_execution_profile?: NotebookExecutionProfile;
  is_active?: boolean;
}

export interface NotebookRun {
  id: string;
  notebook_id?: string;
  status?: string;
  spark_submission_id?: string | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface NotebookSession {
  id: string;
  notebook_id?: string;
  org_id?: string;
  triggered_by?: string;
  execution_profile?: NotebookExecutionProfile;
  status?: string;
  kernel_state?: string;
  session_metadata?: Record<string, unknown>;
  started_at?: string | null;
  last_activity_at?: string | null;
  closed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface NotebookCellExecution {
  id: string;
  session_id?: string;
  notebook_id?: string;
  org_id?: string;
  triggered_by?: string;
  execution_profile?: NotebookExecutionProfile;
  cell_type?: string;
  status?: string;
  execution_count?: number | null;
  code?: string;
  stdout?: string | null;
  stderr?: string | null;
  result_json?: unknown;
  error_name?: string | null;
  error_message?: string | null;
  traceback?: string[] | string | null;
  extra?: Record<string, unknown>;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface NotebookSparkJob {
  id: string;
  notebook_id?: string;
  org_id?: string;
  name: string;
  description?: string;
  app_resource?: string;
  main_class?: string | null;
  default_app_args?: string[] | null;
  default_spark_properties?: Record<string, string> | null;
  status?: string;
  is_active?: boolean;
  paused_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface CreateNotebookSparkJobRequest {
  name: string;
  description?: string;
  app_resource: string;
  main_class?: string;
  default_app_args?: string[];
  default_spark_properties?: Record<string, string>;
}

export interface UpdateNotebookSparkJobRequest {
  name?: string;
  description?: string;
  app_resource?: string;
  main_class?: string | null;
  default_app_args?: string[];
  default_spark_properties?: Record<string, string>;
  is_active?: boolean;
}

export interface NotebookSparkJobRun {
  id: string;
  spark_job_id?: string;
  notebook_id?: string;
  status?: string;
  spark_submission_id?: string | null;
  error_message?: string | null;
  app_args?: string[] | null;
  spark_properties?: Record<string, string> | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface TriggerNotebookSparkJobRunRequest {
  app_args?: string[];
  spark_properties?: Record<string, string>;
}

export interface NotebookSchedule {
  id: string;
  spark_job_id?: string;
  notebook_id?: string;
  name: string;
  description?: string;
  schedule_type?: string;
  cron_expr?: string | null;
  airflow_dag_id?: string | null;
  default_conf?: Record<string, unknown> | null;
  status?: string;
  is_active?: boolean;
  paused_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface CreateNotebookScheduleRequest {
  name: string;
  description?: string;
  schedule_type: string;
  cron_expr?: string;
  airflow_dag_id?: string;
  default_conf?: Record<string, unknown>;
}

export interface UpdateNotebookScheduleRequest {
  name?: string;
  description?: string;
  schedule_type?: string;
  cron_expr?: string | null;
  airflow_dag_id?: string | null;
  default_conf?: Record<string, unknown>;
  is_active?: boolean;
}

export interface NotebookScheduleRun {
  id: string;
  schedule_id?: string;
  spark_job_id?: string;
  notebook_id?: string;
  status?: string;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
