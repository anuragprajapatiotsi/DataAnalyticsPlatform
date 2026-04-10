"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const useAssetDetail = (id: string) => {
  return useQuery({
    queryKey: ["asset-detail", id],
    queryFn: () => serviceService.getAssetDetail(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};
