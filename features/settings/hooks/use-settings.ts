"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/features/settings/services/settings.service";

export const SETTINGS_QUERY_KEY = ["settings"];

export function useSettings(parent: string = "settings") {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, parent],
    queryFn: () => settingsApi.getSettings(parent),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
