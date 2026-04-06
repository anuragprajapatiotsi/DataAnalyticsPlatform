"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const useCatalogViewById = (id: string) => {
  return useQuery({
    queryKey: ["catalog-view", id],
    queryFn: () => serviceService.getCatalogViewById(id),
    enabled: !!id,
  });
};
