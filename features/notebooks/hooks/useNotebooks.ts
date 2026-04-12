"use client";

import { useQuery } from "@tanstack/react-query";

import { notebookService } from "@/features/notebooks/services/notebook.service";

export function useNotebooks() {
  return useQuery({
    queryKey: ["notebooks"],
    queryFn: notebookService.getNotebooks,
    staleTime: 30 * 1000,
  });
}
