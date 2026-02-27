import { api } from "@/shared/api/axios";
import type { NavItem } from "@/services/api/types";

export const navApi = {
  async getNav(name: string = "primary") {
    const response = await api.get<NavItem[]>(`/nav?name=${name}`);
    return response.data;
  },
};
