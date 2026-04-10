"use client";

import { useQuery } from "@tanstack/react-query";

import { fileService } from "../services/file.service";

export function useDatasetFiles(datasetId?: string | null) {
  return useQuery({
    queryKey: ["dataset-files", datasetId],
    queryFn: () => fileService.getDatasetFiles(datasetId as string),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
}
