"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const useCatalogViews = () => {
  return useQuery({
    queryKey: ["catalog-views"],
    queryFn: () => serviceService.getCatalogViews(),
    staleTime: 0,
  });
};
