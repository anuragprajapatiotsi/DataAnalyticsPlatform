"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

import { serviceService } from "@/features/services/services/service.service";
import { CATALOG_VIEWS_UPDATED_EVENT } from "@/features/sql-editor/constants";

export type CreateCatalogViewFromFileAssetRequest = {
  data_asset_id: string;
  name: string;
  display_name: string;
  description?: string;
  tags?: string[];
  glossary_term_ids?: string[];
  synonyms?: string[];
  sync_mode?: "auto" | "scheduled" | "on_demand" | string;
  cron_expr?: string;
  sync_config?: Record<string, unknown>;
};

export function useCreateCatalogView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCatalogViewFromFileAssetRequest) =>
      serviceService.createCatalogViewFromFileAsset(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["catalog-views"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog-view"] }),
        queryClient.invalidateQueries({ queryKey: ["trino-schemas"] }),
        queryClient.invalidateQueries({ queryKey: ["trino-tables"] }),
        queryClient.invalidateQueries({ queryKey: ["trino-table-detail"] }),
      ]);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(CATALOG_VIEWS_UPDATED_EVENT));
      }

      message.success("Catalog View created successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        typeof error === "object" && error !== null
          ? ((error as { response?: { data?: { message?: string; detail?: string } } }).response
              ?.data?.detail ||
            (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message ||
            (error as { message?: string }).message)
          : undefined;

      message.error(errorMessage || "Failed to create catalog view");
    },
  });
}
