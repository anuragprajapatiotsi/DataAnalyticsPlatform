import { api } from "@/services/api";
import type {
  Organization,
  CreateOrgRequest,
  UpdateOrgRequest,
} from "@/services/api/types";

export const orgsApi = {
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

  async deleteOrg(id: string) {
    await api.delete(`/orgs/${id}`);
  },
};
