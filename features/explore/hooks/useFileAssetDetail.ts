"use client";

import { useQuery } from "@tanstack/react-query";

import { fileService } from "../services/file.service";

export function useFileAssetDetail(jobId: string) {
  return useQuery({
    queryKey: ["file-asset-detail", jobId],
    queryFn: async () => {
      const [file, preview] = await Promise.all([
        fileService.getFileById(jobId),
        fileService.getFilePreview(jobId),
      ]);

      return { file, preview };
    },
    enabled: !!jobId,
    staleTime: 0,
  });
}
