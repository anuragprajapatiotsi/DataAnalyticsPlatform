"use client";

import { api } from "@/shared/api/axios";
import { API_BASE_URL } from "@/shared/api/axios";

export interface PublishedApi {
  id?: string;
  api_id: string;
  saved_query_id?: string;
  dataset_id?: string;
  resource_type?: string;
  visibility?: "public" | "private";
  is_active?: boolean;
  route_path?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  [key: string]: unknown;
}

export interface GetPublishedApisParams {
  dataset_id?: string;
  resource_type?: string;
}

export interface PublishedApiExecutionResponse {
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

function normalizePublishedApiList(payload: unknown): PublishedApi[] {
  if (Array.isArray(payload)) {
    return payload as PublishedApi[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as PublishedApi[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as PublishedApi[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as PublishedApi[];
    }
  }

  return [];
}

function getPublishedApiBaseUrl() {
  try {
    const url = new URL(API_BASE_URL);
    url.port = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return API_BASE_URL.replace(/:\d+(?=\/|$)/, "").replace(/\/$/, "");
  }
}

function getAuthHeaders() {
  if (typeof window === "undefined") {
    return {
      Accept: "application/json",
    };
  }

  const token = localStorage.getItem("token");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const publishedApiService = {
  async getPublishedApis(params?: GetPublishedApisParams) {
    const response = await api.get<
      PublishedApi[] | { data?: PublishedApi[]; items?: PublishedApi[]; results?: PublishedApi[] }
    >("/published-apis", {
      params: {
        dataset_id: params?.dataset_id,
        resource_type: params?.resource_type,
      },
    });

    return normalizePublishedApiList(response.data);
  },

  async getPublishedApiById(id: string) {
    const response = await api.get<PublishedApi>(`/published-apis/${id}`);
    return response.data;
  },

  async executePublishedApi(apiId: string, params?: { limit?: number }) {
    const limit = params?.limit ?? 100;
    const response = await fetch(
      `${getPublishedApiBaseUrl()}/published/${apiId}?limit=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to execute published API.");
    }

    return (await response.json()) as PublishedApiExecutionResponse;
  },

  async deactivatePublishedApi(id: string) {
    const response = await api.post(`/published-apis/${id}/deactivate`, {});
    return response.data;
  },
};
