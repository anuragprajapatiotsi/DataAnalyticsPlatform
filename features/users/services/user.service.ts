import { api } from "@/shared/api/axios";
import { AdminUser, GetUserParams } from "../types";

export const userService = {
  getAdminUsers: async (params: GetUserParams) => {
    const response = await api.get<AdminUser[]>("/admin/users", { params });
    return response.data;
  },
};
