"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const useSyncConfig = (id: string) => {
  return useQuery({
    queryKey: ["sync-config", id],
    queryFn: () => serviceService.getSyncConfig(id),
    enabled: !!id,
    staleTime: 0,
  });
};
