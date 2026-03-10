import { api } from "@/shared/api/axios";
import {
  Policy,
  GetPoliciesParams,
  PolicyRule,
  PolicyTeam,
  PolicyRole,
} from "../types";

export const policyService = {
  async getPolicies(params: GetPoliciesParams = { skip: 0, limit: 50 }) {
    const response = await api.get<Policy[]>("/policies", {
      params: {
        skip: params.skip,
        limit: params.limit,
        name: params.name,
        search: params.search,
        resource: params.resource,
        role_id: params.role_id,
        team_id: params.team_id,
        user_id: params.user_id,
        org_id_assigned: params.org_id_assigned,
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

  async deletePolicy(id: string) {
    await api.delete(`/policies/${id}`);
  },

  async getPolicyById(id: string) {
    const response = await api.get<Policy>(`/policies/${id}`);
    return response.data;
  },

  async getPolicyTeams(id: string) {
    const response = await api.get<PolicyTeam[]>(`/policies/${id}/teams`);
    return response.data;
  },

  async getPolicyRoles(id: string) {
    const response = await api.get<PolicyRole[]>(`/policies/${id}/roles`);
    return response.data;
  },

  async getResources() {
    try {
      const response = await api.get<{ data: any[] }>("/resources");
      // Flexibly handle various response structures
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      return [];
    }
  },

  async createPolicy(payload: any) {
    const response = await api.post<Policy>("/policies", payload);
    return response.data;
  },

  async updatePolicy(id: string, payload: any) {
    const response = await api.put<Policy>(`/policies/${id}`, payload);
    return response.data;
  },
};
