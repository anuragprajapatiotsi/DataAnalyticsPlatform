import { api } from "@/shared/api/axios";
import { Role, GetRolesParams, Policy, RoleUser, RoleTeam } from "../types";

export const roleService = {
  async getRoles(params: GetRolesParams = { skip: 0, limit: 10 }) {
    const response = await api.get<Role[]>("/roles", {
      params: {
        skip: params.skip,
        limit: params.limit,
      },
    });

    return {
      data: response.data,
      total: response.data.length, // Fallback
    };
  },

  async getRoleById(id: string) {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  async getRolePolicies(id: string) {
    const response = await api.get<Policy[]>(`/roles/${id}/policies`);
    return response.data;
  },

  async getRoleUsers(id: string) {
    const response = await api.get<RoleUser[]>(`/roles/${id}/users`);
    return response.data;
  },

  async getRoleTeams(id: string) {
    const response = await api.get<RoleTeam[]>(`/roles/${id}/teams`);
    return response.data;
  },

  async attachPolicies(roleId: string, policyIds: string[]) {
    const response = await api.post(`/roles/${roleId}/policies`, {
      policy_ids: policyIds,
    });
    return response.data;
  },

  async detachPolicy(roleId: string, policyId: string) {
    const response = await api.delete(`/roles/${roleId}/policies/${policyId}`);
    return response.data;
  },

  async unassignUser(roleId: string, userId: string) {
    const response = await api.delete(`/roles/${roleId}/assign/${userId}`);
    return response.data;
  },
};
