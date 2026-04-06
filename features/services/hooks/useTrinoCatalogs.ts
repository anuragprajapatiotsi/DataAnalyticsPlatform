"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";

export const useTrinoCatalogs = () => {
  return useQuery({
    queryKey: ["trino-catalogs"],
    queryFn: () => serviceService.getTrinoCatalogs(),
  });
};
