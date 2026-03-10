import { api } from "./axios";
import type { SchemaNode } from "@/shared/types";

export const metadataApi = {
  async getSchemas() {
    const response = await api.get<SchemaNode[]>("/metadata/schemas");
    return response.data;
  },

  async getTables(schema: string) {
    const response = await api.get<SchemaNode[]>(
      `/metadata/schemas/${schema}/tables`,
    );
    return response.data;
  },

  async getViews(schema: string) {
    const response = await api.get<SchemaNode[]>(
      `/metadata/schemas/${schema}/views`,
    );
    return response.data;
  },

  async getFunctions(schema: string) {
    const response = await api.get<SchemaNode[]>(
      `/metadata/schemas/${schema}/functions`,
    );
    return response.data;
  },

  async getIndexes(schema: string) {
    const response = await api.get<SchemaNode[]>(
      `/metadata/schemas/${schema}/indexes`,
    );
    return response.data;
  },

  async getSequences(schema: string) {
    const response = await api.get<SchemaNode[]>(
      `/metadata/schemas/${schema}/sequences`,
    );
    return response.data;
  },

  async getDataTypes(schema: string) {
    const response = await api.get<SchemaNode[]>(
      `/metadata/schemas/${schema}/data-types`,
    );
    return response.data;
  },

  async getAggregateFunctions(schema: string) {
    const response = await api.get<SchemaNode[]>(
      `/metadata/schemas/${schema}/aggregate-functions`,
    );
    return response.data;
  },

  async getColumns(schema: string, table: string) {
    const response = await api.get<SchemaNode[]>(
      `/metadata/schemas/${schema}/tables/${table}/columns`,
    );
    return response.data;
  },
};
