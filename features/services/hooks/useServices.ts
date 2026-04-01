"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";
import { GetServicesParams } from "../types";

export const useServices = (params: GetServicesParams) => {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => serviceService.getServices(params),
    placeholderData: (previousData) => previousData,
  });
};
