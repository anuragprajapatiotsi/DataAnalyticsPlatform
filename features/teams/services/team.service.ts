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
} from "../types";

export const teamService = {
  async getTeams() {
    const response = await api.get<Team[]>("/teams");
    return response.data;
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

  async getMembers(id: string) {
    const response = await api.get<TeamMember[]>(`/teams/${id}/members`);
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

  async getRoles(id: string) {
    const response = await api.get<Role[]>(`/teams/${id}/roles`);
    return response.data;
  },

  async getPolicies(id: string) {
    const response = await api.get<Policy[]>(`/teams/${id}/policies`);
    return response.data;
  },

  async getAssets(id: string) {
    const response = await api.get<TeamAsset[]>(`/teams/${id}/assets`);
    return response.data;
  },

  async addRole(teamId: string, roleId: string) {
    const response = await api.post(`/teams/${teamId}/roles/${roleId}`);
    return response.data;
  },

  async removeRole(teamId: string, roleId: string) {
    const response = await api.delete(`/teams/${teamId}/roles/${roleId}`);
    return response.data;
  },

  async assignRoles(teamId: string, roleIds: string[]) {
    // Current API might only support single assignments, but requested structure suggests bulk
    // For now, if the API doesn't support bulk, we could loop, but user requested POST /teams/{team_id}/roles with role_ids array
    const response = await api.post(`/teams/${teamId}/roles`, {
      role_ids: roleIds,
    });
    return response.data;
  },

  async addPolicy(teamId: string, policyId: string) {
    const response = await api.post(`/teams/${teamId}/policies/${policyId}`);
    return response.data;
  },

  async removePolicy(teamId: string, policyId: string) {
    const response = await api.delete(`/teams/${teamId}/policies/${policyId}`);
    return response.data;
  },

  async assignPolicies(teamId: string, policyIds: string[]) {
    const response = await api.post(`/teams/${teamId}/policies`, {
      policy_ids: policyIds,
    });
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
