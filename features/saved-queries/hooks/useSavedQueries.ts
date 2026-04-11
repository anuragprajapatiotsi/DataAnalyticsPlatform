"use client";

import { useQuery } from "@tanstack/react-query";

import {
  savedQueryService,
  type GetSavedQueriesParams,
} from "@/features/sql-editor/services/saved-query.service";

export function useSavedQueries(params?: GetSavedQueriesParams) {
  return useQuery({
    queryKey: ["saved-queries", params],
    queryFn: () => savedQueryService.getSavedQueries(params),
    staleTime: 5 * 60 * 1000,
  });
}
