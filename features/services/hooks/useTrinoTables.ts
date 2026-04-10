"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const useTrinoTables = (catalog: string, schema: string) => {
  return useQuery({
    queryKey: ["trino-tables", catalog, schema],
    queryFn: () => serviceService.getTrinoTables(catalog, schema),
    enabled: !!catalog && !!schema,
    staleTime: 30 * 1000,
  });
};
