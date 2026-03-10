import { api } from "@/shared/api/axios";
import type { SettingsItem } from "@/shared/types";

export const settingsApi = {
  async getSettings(parent: string = "settings") {
    const response = await api.get<SettingsItem[]>(
      `/settings/tree?parent=${parent}&name=primary`,
    );
    return response.data;
  },  
};
