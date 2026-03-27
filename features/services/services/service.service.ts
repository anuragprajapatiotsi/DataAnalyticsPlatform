import { api } from "@/shared/api/axios";
import { Service, GetServicesParams, CreateServiceRequest, UpdateServiceRequest, ServiceEndpoint, ServiceEndpointRequest, DatabaseInfo, GroupedServiceCategory, SchemaInfo, DBObjectInfo, DBTableDetail, Bot, GetBotsParams, BotRun, GetBotRunsParams, ConnectorMetadata, AggregatedDatabase, CatalogResponse, CatalogAsset, DataAssetDetail, DataAssetProfile } from "../types";

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

  async getOrganizations() {
    const response = await api.get<any[]>("/orgs");
    return response.data;
  },

  async getBots(params: GetBotsParams = { skip: 0, limit: 50 }) {
    const response = await api.get<Bot[]>("/bots", {
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

  async runBot(botId: string, config: Record<string, any> = {}) {
    const response = await api.post<{ message: string; success: boolean }>(`/bots/${botId}/run`, { config });
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
};
