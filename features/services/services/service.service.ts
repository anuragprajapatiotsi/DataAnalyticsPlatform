import { api } from "@/shared/api/axios";
import { Service, GetServicesParams, CreateServiceRequest, UpdateServiceRequest, ServiceEndpoint, ServiceEndpointRequest, DatabaseInfo, GroupedServiceCategory, SchemaInfo, DBObjectInfo, DBTableDetail, DBTablePreviewResponse, Bot, GetBotsParams, BotRun, GetBotRunsParams, ConnectorMetadata, AggregatedDatabase, CatalogResponse, CatalogAsset, DataAssetDetail, DataAssetProfile, DataColumnDetail, ColumnProfilingResponse, UpdateColumnRequest, BulkUpdateColumnItem, CatalogView, SyncConfig, TrinoCatalog, TrinoSchema, TrinoTable, TrinoColumn, TrinoTableDetail, TrinoQueryRequest, TrinoQueryResponse, ExplorerServiceEndpoint, ExplorerDatabaseAsset, ExplorerSchemaAsset, ExplorerObjectAsset, ExplorerAssetDetail, ExplorerAssetDetailResponse, CatalogKpi, ExplorerFileAsset } from "../types";

function normalizeExplorerList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const maybeWrapped = payload as { data?: unknown; items?: unknown; results?: unknown };
    if (Array.isArray(maybeWrapped.data)) {
      return maybeWrapped.data as T[];
    }
    if (Array.isArray(maybeWrapped.items)) {
      return maybeWrapped.items as T[];
    }
    if (Array.isArray(maybeWrapped.results)) {
      return maybeWrapped.results as T[];
    }
  }

  return [];
}

function normalizeExplorerObjectList(payload: unknown): ExplorerObjectAsset[] {
  if (Array.isArray(payload)) {
    return payload as ExplorerObjectAsset[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const groupedKeys = [
    "tables",
    "views",
    "functions_procedures",
    "foreign_tables",
    "sequences",
    "user_defined_types",
    "other_objects",
  ] as const;

  const flattened = groupedKeys.flatMap((key) => {
    const value = record[key];
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const objectItem = item as ExplorerObjectAsset;
      return {
        ...objectItem,
        object_type:
          objectItem.object_type ||
          objectItem.asset_type ||
          key.replace("_", " ").replace("functions procedures", "function"),
        asset_type: objectItem.asset_type || objectItem.object_type || key,
      } satisfies ExplorerObjectAsset;
    }).filter(Boolean) as ExplorerObjectAsset[];
  });

  if (flattened.length > 0) {
    return flattened;
  }

  return normalizeExplorerList<ExplorerObjectAsset>(payload);
}

export const serviceService = {
  async getLatestAssetProfile(assetId: string) {
    const response = await api.get<DataAssetProfile>(`/data-assets/${assetId}/profiles/latest`);
    return response.data;
  },
  async getAssetDetail(assetId: string) {
    const response = await api.get<DataAssetDetail>(`/data-assets/${assetId}`);
    return response.data;
  },
  async getAssetChildren(assetId: string) {
    const response = await api.get<CatalogAsset[]>(`/data-assets/${assetId}/children`);
    return response.data;
  },
  async getCatalog(id: string) {
    const response = await api.get<CatalogResponse>(`/service-endpoints/${id}/catalog`);
    return response.data;
  },
  async getServices(params: GetServicesParams = { skip: 0, limit: 50 }) {
    const response = await api.get<ServiceEndpoint[]>("/service-endpoints", {
      params: {
        skip: params.skip,
        limit: params.limit,
        search: params.search,
        type: params.type,
      },
    });

    return {
      data: response.data,
      total:
        response.data.length === (params.limit || 50)
          ? (Math.floor((params.skip || 0) / (params.limit || 50)) + 2) *
            (params.limit || 50)
          : (params.skip || 0) + response.data.length,
    };
  },

  async getServiceById(id: string) {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  async createService(payload: CreateServiceRequest) {
    const response = await api.post<Service>("/services", payload);
    return response.data;
  },

  async createServiceEndpoint(payload: ServiceEndpointRequest) {
    const response = await api.post<ServiceEndpoint>("/service-endpoints", payload);
    return response.data;
  },

  async updateService(id: string, payload: UpdateServiceRequest) {
    const response = await api.put<Service>(`/services/${id}`, payload);
    return response.data;
  },

  async updateServiceEndpoint(id: string, payload: any) {
    const response = await api.put<ServiceEndpoint>(`/service-endpoints/${id}`, payload);
    return response.data;
  },

  async deleteService(id: string) {
    await api.delete(`/service-endpoints/${id}`);
  },

  async deleteServiceEndpoint(id: string) {
    await api.delete(`/service-endpoints/${id}`);
  },

  async testDatabaseConnection(payload: any) {
    const response = await api.post<{ success: boolean; message: string; detail?: string }>("/service-endpoints/test-connection", payload);
    return response.data;
  },

  async testConnection(id: string) {
    const response = await api.post<{ success: boolean; message: string }>(`/service-endpoints/${id}/test`);
    return response.data;
  },

  async getServiceEndpoint(id: string) {
    const response = await api.get<ServiceEndpoint>(`/service-endpoints/${id}`);
    return response.data;
  },

  async getDatabases(id: string) {
    if (!id || id === "undefined") {
      console.warn("getDatabases: Missing or invalid endpoint_id", id);
      return [];
    }
    const response = await api.get<DatabaseInfo[]>(`/service-endpoints/${id}/explore/databases`);
    return response.data;
  },

  async getSchemas(id: string, database: string) {
    const response = await api.get<SchemaInfo[]>(`/service-endpoints/${id}/explore/${database}/schemas`);
    return response.data;
  },

  async getDBObjects(id: string, database: string, schema: string) {
    const response = await api.get<DBObjectInfo[]>(`/service-endpoints/${id}/explore/${database}/${schema}/objects`, {
      params: { name: "primary" }
    });
    return response.data;
  },

  async getTableDetail(id: string, database: string, schema: string, table: string) {
    const response = await api.get<DBTableDetail>(`/service-endpoints/${id}/explore/${database}/${schema}/${table}`);
    return response.data;
  },

  async getTableDataPreview(
    id: string,
    database: string,
    schema: string,
    table: string,
    params?: {
      limit?: number;
      offset?: number;
      order_by?: string;
      order_dir?: "asc" | "desc";
      filters?: Record<string, string>;
    },
  ) {
    const response = await api.get<DBTablePreviewResponse>(
      `/service-endpoints/${id}/explore/${database}/${schema}/${table}/data`,
      {
        params: {
          limit: params?.limit ?? 50,
          offset: params?.offset ?? 0,
          order_by: params?.order_by,
          order_dir: params?.order_dir,
          ...(params?.filters ?? {}),
        },
      },
    );
    return response.data;
  },

  async getOrganizations() {
    const response = await api.get<any[]>("/orgs");
    return response.data;
  },

  async getBots(endpointId: string, params: GetBotsParams = { skip: 0, limit: 50 }) {
    const response = await api.get<Bot[]>(`/bots/for-endpoint/${endpointId}`, {
      params: {
        ...params,
        name: "primary",
      },
    });
    return response.data;
  },

  async updateBot(botId: string, data: Partial<Bot>) {
    const response = await api.put<Bot>(`/bots/${botId}`, data);
    return response.data;
  },

  async runBot(botId: string, service_endpoint_id: string, config: Record<string, any> = {}) {
    const response = await api.post<{ message: string; success: boolean }>(`/bots/${botId}/run`, { 
      service_endpoint_id,
      config 
    });
    return response.data;
  },

  async enableBot(botId: string) {
    const response = await api.patch(`/bots/${botId}/enable`);
    return response.data;
  },

  async disableBot(botId: string) {
    const response = await api.patch(`/bots/${botId}/disable`);
    return response.data;
  },

  async deleteBot(botId: string) {
    const response = await api.delete(`/bots/${botId}`);
    return response.data;
  },

  async getBotRuns(botId: string, params: GetBotRunsParams = { skip: 0, limit: 50 }) {
    const response = await api.get<BotRun[]>(`/bots/${botId}/runs`, {
      params: {
        ...params,
        name: "primary",
      },
    });
    return response.data;
  },

  async getConnectors() {
    const response = await api.get<ConnectorMetadata[]>("/settings/tree", {
      params: {
        parent: "databases",
        name: "primary",
      },
    });
    return response.data;
  },

  async getServiceEndpointsByType(type: string, orgId?: string, name: string = "primary") {
    const response = await api.get<any>("/service-endpoints/by-type", {
      params: {
        service_type: type,
        name,
        org_id: orgId,
      },
    });
    
    const rawData = response.data;
    
    // 1. Array format: [ { category_name: '...', connections: [...] }, ... ]
    if (Array.isArray(rawData)) return rawData;
    
    // 2. Specific format with categories: { categories: [ ... ] }
    if (rawData && rawData.categories && Array.isArray(rawData.categories)) {
      return rawData.categories;
    }
    
    // 3. Wrapped format: { data: [ ... ], success?: true }
    if (rawData && rawData.data) {
      if (Array.isArray(rawData.data)) return rawData.data;
      // 4. Object in wrapped format: { data: { "postgres": [...], ... } }
      if (typeof rawData.data === 'object') {
        return Object.entries(rawData.data).map(([category, connections]) => ({
          category_name: category,
          connections: Array.isArray(connections) ? connections : []
        }));
      }
    }
    
    // 5. Direct object mapping: { "postgres": [...], "mysql": [...], ... }
    if (rawData && typeof rawData === 'object' && !rawData.service_type) {
      return Object.entries(rawData).map(([category, connections]) => ({
        category_name: category,
        connections: Array.isArray(connections) ? connections : []
      }));
    }
    
    return [];
  },
  async getColumnProfilingData(assetId: string, columnId: string, params: { skip: number; limit: number; exclude_nulls?: boolean }) {
    if (!assetId || !columnId) return null;
    
    const url = `/data-assets/${assetId}/columns/${columnId}/data`;
    try {
      const response = await api.get<ColumnProfilingResponse>(url, {
        params: {
          skip: params.skip,
          limit: params.limit,
          exclude_nulls: params.exclude_nulls ?? true
        }
      });
      return response.data;
    } catch (err: any) {
      console.error(`[Profiling API Error] GET ${url}:`, err.response?.data || err.message || err);
      throw err;
    }
  },
  
  async updateColumn(assetId: string, columnId: string, data: UpdateColumnRequest) {
    const response = await api.put<DataColumnDetail>(`/data-assets/${assetId}/columns/${columnId}`, data);
    return response.data;
  },

  async deleteColumn(assetId: string, columnId: string) {
    await api.delete(`/data-assets/${assetId}/columns/${columnId}`);
  },

  async bulkUpdateColumns(assetId: string, data: BulkUpdateColumnItem[]) {
    const response = await api.post(`/data-assets/${assetId}/columns/bulk`, data);
    return response.data;
  },

  async getCatalogViews(params?: { skip?: number; limit?: number; name?: string }) {
    const response = await api.get<CatalogView[]>("/catalog-views", {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 50,
        name: params?.name,
      },
    });
    return response.data;
  },

  async getCatalogViewById(id: string) {
    const response = await api.get<CatalogView>(`/catalog-views/${id}`);
    return response.data;
  },

  async createCatalogView(data: Partial<CatalogView>) {
    const response = await api.post<CatalogView>("/catalog-views", data);
    return response.data;
  },

  async createCatalogViewFromFileAsset(data: {
    data_asset_id: string;
    name: string;
    display_name: string;
    description?: string;
    tags?: string[];
    glossary_term_ids?: string[];
    synonyms?: string[];
    sync_mode?: string;
    cron_expr?: string;
    sync_config?: Record<string, unknown>;
  }) {
    const response = await api.post<CatalogView>("/catalog-views/from-file-asset", data);
    return response.data;
  },

  async getDataAssets(params?: {
    skip?: number;
    limit?: number;
    name?: string;
    sn?: string;
    dataset_id?: string;
    asset_type?: string;
  }) {
    const response = await api.get<ExplorerFileAsset[] | { data?: ExplorerFileAsset[] }>("/data-assets", { params });
    // Handle both array returns and paginated object returns
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
    return Array.isArray(response.data) ? response.data : [];
  },

  async getDataAssetColumns(assetId: string) {
    const response = await api.get<any[]>(`/data-assets/${assetId}/columns`);
    return response.data;
  },

  async attachDataAssetTags(assetId: string, tag_ids: string[]) {
    const response = await api.post(`/data-assets/${assetId}/tags`, {
      tag_ids,
    });
    return response.data;
  },

  async syncCatalogView(id: string, payload: { sync_data: boolean; force: boolean }) {
    const response = await api.post(`/catalog-views/${id}/sync`, payload);
    return response.data;
  },
  
  async executeTrinoQuery(payload: TrinoQueryRequest, signal?: AbortSignal) {
    const response = await api.post<TrinoQueryResponse>("/integrations/trino/query", {
      ...payload,
    }, { signal });
    return response.data;
  },
  
  async getSyncConfig(id: string) {
    const response = await api.get<SyncConfig>(`/catalog-views/${id}/sync-config`);
    return response.data;
  },

  async getTrinoCatalogs() {
    const response = await api.get<TrinoCatalog[]>("/integrations/trino/catalogs");
    return response.data;
  },

  async getTrinoSchemas(catalog: string) {
    const response = await api.get<TrinoSchema[]>(`/integrations/trino/catalogs/${catalog}/schemas`);
    return response.data;
  },

  async getTrinoTables(catalog: string, schema: string) {
    const response = await api.get<TrinoTable[]>(`/integrations/trino/catalogs/${catalog}/${schema}/tables`);
    return response.data;
  },

  async getTrinoTableDetail(catalog: string, schema: string, table: string) {
    const response = await api.get<TrinoTableDetail>(`/integrations/trino/catalogs/${catalog}/${schema}/${table}`);
    return response.data;
  },
  
  async getTrinoCatalogViewTables() {
    const response = await api.get<TrinoTable[]>("/integrations/trino/catalogs/iceberg/catalog_views/tables");
    return response.data;
  },

  async getExplorerConnections() {
    const response = await api.get<ExplorerServiceEndpoint[] | { data?: ExplorerServiceEndpoint[] }>(
      "/data-assets/explorer/service-endpoints",
    );
    return normalizeExplorerList<ExplorerServiceEndpoint>(response.data);
  },

  async getExplorerDatabases(serviceEndpointId: string) {
    const response = await api.get<ExplorerDatabaseAsset[] | { data?: ExplorerDatabaseAsset[] }>(
      `/data-assets/explorer/service-endpoints/${serviceEndpointId}/databases`,
    );
    return normalizeExplorerList<ExplorerDatabaseAsset>(response.data);
  },

  async getExplorerSchemas(databaseAssetId: string) {
    const response = await api.get<ExplorerSchemaAsset[] | { data?: ExplorerSchemaAsset[] }>(
      `/data-assets/explorer/databases/${databaseAssetId}/schemas`,
    );
    return normalizeExplorerList<ExplorerSchemaAsset>(response.data);
  },

  async getExplorerObjects(schemaAssetId: string) {
    const response = await api.get<
      | ExplorerObjectAsset[]
      | { data?: ExplorerObjectAsset[] }
      | Record<string, unknown>
    >(
      `/data-assets/explorer/schemas/${schemaAssetId}/objects`,
    );
    return normalizeExplorerObjectList(response.data);
  },

  async getExplorerAssetDetail(assetId: string) {
    const response = await api.get<ExplorerAssetDetail | ExplorerAssetDetailResponse>(
      `/data-assets/explorer/assets/${assetId}/detail`,
    );
    return response.data;
  },

  async getKpis() {
    const response = await api.get<CatalogKpi[]>("/catalog/kpis");
    return response.data;
  },

  async getKpiById(kpiId: string) {
    const response = await api.get<CatalogKpi>(`/catalog/kpis/${kpiId}`);
    return response.data;
  }
};
