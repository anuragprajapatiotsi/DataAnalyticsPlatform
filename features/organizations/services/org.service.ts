import { api } from "@/shared/api/axios";
import type {
  Organization,
  CreateOrgRequest,
  UpdateOrgRequest,
} from "@/shared/types";

export const orgService = {
  async getOrgs() {
    const response = await api.get<Organization[]>("/orgs");
    return response.data;
  },

  async createOrg(data: CreateOrgRequest) {
    const response = await api.post<Organization>("/orgs", data);
    return response.data;
  },

  async updateOrg(id: string, data: UpdateOrgRequest) {
    const response = await api.put<Organization>(`/orgs/${id}`, data);
    return response.data;
  },

  async getOrg(id: string) {
    const response = await api.get<Organization>(`/orgs/${id}`);
    return response.data;
  },

  async getOrgTeamsGrouped(orgId: string) {
    const response = await api.get<any[]>(`/orgs/${orgId}/teams-grouped`);
    return response.data;
  },

  async deleteOrg(id: string) {
    await api.delete(`/orgs/${id}`);
  },
};

