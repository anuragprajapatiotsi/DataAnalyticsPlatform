import { api } from "./axios";
import type {
  QueryRequest,
  QueryResponse,
  QueryCancelRequest,
} from "@/shared/types";

export const queryApi = {
  async execute(payload: QueryRequest) {
    const response = await api.post<QueryResponse>("/query", payload);
    return response.data;
  },

  async cancel(payload: QueryCancelRequest) {
    const response = await api.post<{ message: string }>(
      "/query/cancel",
      payload,
    );
    return response.data;
  },
};
