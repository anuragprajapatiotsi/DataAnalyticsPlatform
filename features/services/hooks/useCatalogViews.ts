"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const CATALOG_VIEWS_QUERY_KEY = ["catalog-views"] as const;

interface UseCatalogViewsParams {
  skip?: number;
  limit?: number;
  name?: string;
  enabled?: boolean;
}

export const useCatalogViews = (params?: UseCatalogViewsParams) => {
  return useQuery({
    queryKey: [
      ...CATALOG_VIEWS_QUERY_KEY,
      {
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 50,
        name: params?.name ?? "",
      },
    ],
    queryFn: () =>
      serviceService.getCatalogViews({
        skip: params?.skip,
        limit: params?.limit,
        name: params?.name,
      }),
    staleTime: 0,
    enabled: params?.enabled ?? true,
  });
};
