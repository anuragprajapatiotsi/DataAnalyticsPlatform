"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const useTrinoSchemas = (catalog: string) => {
  return useQuery({
    queryKey: ["trino-schemas", catalog],
    queryFn: () => serviceService.getTrinoSchemas(catalog),
    enabled: !!catalog,
  });
};
