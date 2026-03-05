import { api } from "@/shared/api/axios";
import {
  Role,
  GetRolesParams,
  Policy,
  RoleUser,
  RoleTeam,
  CreateRolePayload,
} from "../types";

export const roleService = {
  async getRoles(params: GetRolesParams = { skip: 0, limit: 10 }) {
    const response = await api.get<Role[]>("/roles", {
      params: {
        skip: params.skip,
        limit: params.limit,
        search: params.search,
        is_system_role: params.is_system_role,
        user_id: params.user_id,
        team_id: params.team_id,
        org_id_assigned: params.org_id_assigned,
      },
    });

    return {
      data: response.data,
      total: response.data.length, // Fallback
    };
  },

  async createRole(payload: CreateRolePayload) {
    const response = await api.post<Role>("/roles", payload);
    return response.data;
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

  async updateRole(id: string, payload: CreateRolePayload) {
    const response = await api.put<Role>(`/roles/${id}`, payload);
    return response.data;
  },

  async deleteRole(id: string) {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};
