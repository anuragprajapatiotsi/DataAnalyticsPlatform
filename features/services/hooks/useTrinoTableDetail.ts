"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const useTrinoTableDetail = (catalog: string, schema: string, table: string) => {
  return useQuery({
    queryKey: ["trino-table-detail", catalog, schema, table],
    queryFn: () => serviceService.getTrinoTableDetail(catalog, schema, table),
    enabled: !!catalog && !!schema && !!table,
    staleTime: 30 * 1000,
  });
};
