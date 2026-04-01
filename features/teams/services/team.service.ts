import { api } from "@/shared/api/axios";
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamDetail,
  TeamMember,
  Role,
  Policy,
  TeamAsset,
  GetTeamsParams,
} from "../types";

export const teamService = {
  async getTeams(params: GetTeamsParams = { skip: 0, limit: 50 }) {
    const response = await api.get<Team[]>("/teams", {
      params: {
        ...params,
        skip: params.skip || 0,
        limit: params.limit || 50,
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

  async createTeam(data: CreateTeamRequest) {
    const response = await api.post<Team>("/teams", data);
    return response.data;
  },

  async updateTeam(id: string, data: UpdateTeamRequest) {
    const response = await api.put<Team>(`/teams/${id}`, data);
    return response.data;
  },

  async deleteTeam(id: string) {
    await api.delete(`/teams/${id}`);
  },

  async getTeamDetails(id: string) {
    // User mentioned /team/{id} specifically
    const response = await api.get<TeamDetail>(`/teams/${id}`);
    return response.data;
  },

  async getMembers(id: string, orgId?: string) {
    const response = await api.get<TeamMember[]>(`/teams/${id}/members`, {
      params: {
        org_id: orgId,
        roles: true,
        policies: true,
      },
    });
    return response.data;
  },

  async assignMembers(teamId: string, userIds: string[]) {
    const response = await api.post(`/teams/${teamId}/members`, {
      team_id: teamId,
      user_ids: userIds,
    });
    return response.data;
  },

  async removeMember(teamId: string, userId: string) {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  async getRoles(id: string, orgId?: string) {
    const response = await api.get<Role[]>(`/teams/${id}/roles`, {
      params: { org_id: orgId },
    });
    return response.data;
  },

  async getPolicies(id: string, orgId?: string) {
    const response = await api.get<Policy[]>(`/teams/${id}/policies`, {
      params: { org_id: orgId },
    });
    return response.data;
  },

  async getAssets(id: string) {
    const response = await api.get<TeamAsset[]>(`/teams/${id}/assets`);
    return response.data;
  },

  async addRole(teamId: string, roleId: string, orgId: string) {
    const params = { org_id: orgId };
    console.log(`Adding role ${roleId} with params:`, params);
    const response = await api.post(`/teams/${teamId}/roles/${roleId}`, {}, { params });
    return response.data;
  },

  async removeRole(teamId: string, roleId: string) {
    const response = await api.delete(`/teams/${teamId}/roles/${roleId}`);
    return response.data;
  },

  async assignRoles(teamId: string, roleIds: string[], orgId: string) {
    const params = { org_id: orgId };
    const body = { role_ids: roleIds };
    console.log("Assigning roles with params:", params, "and body:", body);
    const response = await api.post(`/teams/${teamId}/roles`, body, { params });
    return response.data;
  },

  async addPolicy(teamId: string, policyId: string, orgId: string) {
    const params = { org_id: orgId };
    console.log(`Adding policy ${policyId} with params:`, params);
    const response = await api.post(`/teams/${teamId}/policies/${policyId}`, {}, { params });
    return response.data;
  },

  async removePolicy(teamId: string, policyId: string) {
    const response = await api.delete(`/teams/${teamId}/policies/${policyId}`);
    return response.data;
  },

  async assignPolicies(teamId: string, policyIds: string[], orgId: string) {
    const params = { org_id: orgId };
    const body = { policy_ids: policyIds };
    console.log("Assigning policies with params:", params, "and body:", body);
    const response = await api.post(`/teams/${teamId}/policies`, body, { params });
    return response.data;
  },

  async getAvailableUsers() {
    const response = await api.get<any[]>("/admin/users"); // Standard users endpoint
    return response.data;
  },

  async getAvailableRoles() {
    const response = await api.get<Role[]>("/roles");
    return response.data;
  },

  async getAvailablePolicies() {
    const response = await api.get<Policy[]>("/policies");
    return response.data;
  },
};
