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

  async addMember(teamId: string, userId: string) {
    // User mentioned /teams/{team_id}/members/{user_id}
    const response = await api.post(`/teams/${teamId}/members/${userId}`);
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
};
