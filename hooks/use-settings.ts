"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/services/api/settings";

export const SETTINGS_QUERY_KEY = ["settings"];

export function useSettings(parent: string = "settings") {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, parent],
    queryFn: () => settingsApi.getSettings(parent),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
