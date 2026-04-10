import { api } from "@/shared/api/axios";

export interface CreateSavedQueryRequest {
  dataset_id: string;
  name: string;
  description?: string;
  sql: string;
  catalog?: string;
  schema?: string;
  domain_id?: string;
  trino_endpoint_id?: string;
  tags?: string[];
  owner_ids?: string[];
  classification_tag_ids?: string[];
  glossary_term_ids?: string[];
  extra_metadata: Record<string, unknown>;
}

export interface SavedQueryResponse {
  id?: string;
  saved_query_id?: string;
  name?: string;
  [key: string]: unknown;
}

export const savedQueryService = {
  async createSavedQuery(payload: CreateSavedQueryRequest) {
    const response = await api.post<SavedQueryResponse>("/saved-queries", payload);
    return response.data;
  },
};
