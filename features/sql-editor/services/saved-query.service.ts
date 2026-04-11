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

export interface SavedQuery {
  id: string;
  dataset_id?: string;
  name: string;
  description?: string;
  sql?: string;
  query?: string;
  catalog?: string;
  schema?: string;
  domain_id?: string;
  trino_endpoint_id?: string;
  tags?: string[];
  owner_ids?: string[];
  classification_tag_ids?: string[];
  glossary_term_ids?: string[];
  extra_metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  published_at?: string | null;
  [key: string]: unknown;
}

export interface GetSavedQueriesParams {
  dataset_id?: string;
  search?: string;
}

export type UpdateSavedQueryRequest = Partial<CreateSavedQueryRequest>;

export interface SavedQueryResponse extends Partial<SavedQuery> {
  saved_query_id?: string;
}

export interface PublishSavedQueryRequest {
  visibility: "public" | "private";
}

export interface SavedQueryRunResponse {
  columns?: string[];
  rows?: unknown[][] | Record<string, unknown>[];
  data?: unknown[][];
  stats?: {
    executionTimeMs?: number;
    processedRows?: number;
    [key: string]: unknown;
  };
  total_count?: number;
  returned?: number;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

function normalizeSavedQueryList(payload: unknown): SavedQuery[] {
  if (Array.isArray(payload)) {
    return payload as SavedQuery[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as SavedQuery[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as SavedQuery[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as SavedQuery[];
    }
  }

  return [];
}

export const savedQueryService = {
  async getSavedQueries(params?: GetSavedQueriesParams) {
    const response = await api.get<
      SavedQuery[] | { data?: SavedQuery[]; items?: SavedQuery[]; results?: SavedQuery[] }
    >("/saved-queries", {
      params: {
        dataset_id: params?.dataset_id,
        search: params?.search,
      },
    });
    return normalizeSavedQueryList(response.data);
  },

  async createSavedQuery(payload: CreateSavedQueryRequest) {
    const response = await api.post<SavedQueryResponse>("/saved-queries", payload);
    return response.data;
  },

  async updateSavedQuery(id: string, payload: UpdateSavedQueryRequest) {
    const response = await api.put<SavedQueryResponse>(`/saved-queries/${id}`, payload);
    return response.data;
  },

  async deleteSavedQuery(id: string) {
    await api.delete(`/saved-queries/${id}`);
  },

  async publishSavedQuery(id: string, payload: PublishSavedQueryRequest) {
    const response = await api.post<SavedQueryResponse>(
      `/saved-queries/${id}/publish`,
      payload,
    );
    return response.data;
  },

  async runSavedQuery(id: string, payload?: Record<string, unknown>) {
    const response = await api.post<SavedQueryRunResponse>(
      `/saved-queries/${id}/run`,
      payload ?? {},
    );
    return response.data;
  },
};
