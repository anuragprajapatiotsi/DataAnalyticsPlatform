import { api } from "@/shared/api/axios";
import { Service, GetServicesParams, CreateServiceRequest, UpdateServiceRequest, ServiceEndpoint, ServiceEndpointRequest, DatabaseInfo } from "../types";

export const serviceService = {
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

  async deleteService(id: string) {
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
    const response = await api.get<DatabaseInfo[]>(`/service-endpoints/${id}/explore/databases`);
    return response.data;
  },
};
