import { api } from "./axios";
import type { NavItem } from "@/shared/types";

export const navApi = {
  async getNav(name: string = "primary") {
    const response = await api.get<NavItem[]>(`/nav?name=${name}`);
    return response.data;
  },
};
