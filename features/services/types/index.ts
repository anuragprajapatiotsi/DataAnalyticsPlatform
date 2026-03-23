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
  service_name: string;
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
