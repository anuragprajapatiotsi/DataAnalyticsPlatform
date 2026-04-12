"use client";

import { useQuery } from "@tanstack/react-query";

import {
  publishedApiService,
  type GetPublishedApisParams,
} from "@/features/published-apis/services/published-api.service";

export function usePublishedApis(params?: GetPublishedApisParams) {
  return useQuery({
    queryKey: ["published-apis", params],
    queryFn: () => publishedApiService.getPublishedApis(params),
    staleTime: 5 * 60 * 1000,
  });
}
