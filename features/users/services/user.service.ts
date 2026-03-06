import { api } from "@/shared/api/axios";
import {
  AdminUser,
  CreateUserRequest,
  GetUserParams,
  UpdateUserRequest,
  UserPolicy,
  UserRole,
  UserTeam,
  ResetPasswordRequest,
} from "../types";

export const userService = {
  getAdminUsers: async (params: GetUserParams) => {
    const response = await api.get<AdminUser[]>("/admin/users", { params });
    return response.data;
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await api.post<AdminUser>("/admin/users", data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    const response = await api.put<AdminUser>(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get<AdminUser>(`/admin/users/${id}`);
    return response.data;
  },

  getUserTeams: async (id: string) => {
    const response = await api.get<UserTeam[]>(`/admin/users/${id}/teams`);
    return response.data;
  },

  getUserRoles: async (id: string) => {
    const response = await api.get<UserRole[]>(`/admin/users/${id}/roles`);
    return response.data;
  },

  getUserPolicies: async (id: string) => {
    const response = await api.get<UserPolicy[]>(`/admin/users/${id}/policies`);
    return response.data;
  },

  resetPassword: async (id: string, data: ResetPasswordRequest) => {
    const response = await api.post(`/admin/users/${id}/reset-password`, data);
    return response.data;
  },
};
