"use client";

import { message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { domainService } from "../services/domain.service";
import type {
  CreateCatalogDomainRequest,
  UpdateCatalogDomainRequest,
} from "../types";

const DOMAINS_QUERY_KEY = ["catalog-domains"];

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const response = (error as {
    response?: {
      data?: {
        detail?: string;
        message?: string;
      };
    };
  }).response;

  return response?.data?.detail || response?.data?.message || fallback;
}

export function useDomains() {
  const queryClient = useQueryClient();

  const domainsQuery = useQuery({
    queryKey: DOMAINS_QUERY_KEY,
    queryFn: domainService.getDomains,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCatalogDomainRequest) =>
      domainService.createDomain(payload),
    onSuccess: async () => {
      message.success("Domain created successfully");
      await queryClient.invalidateQueries({ queryKey: DOMAINS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to create domain"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCatalogDomainRequest;
    }) => domainService.updateDomain(id, payload),
    onSuccess: async () => {
      message.success("Domain updated successfully");
      await queryClient.invalidateQueries({ queryKey: DOMAINS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to update domain"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => domainService.deleteDomain(id),
    onSuccess: async () => {
      message.success("Domain deleted successfully");
      await queryClient.invalidateQueries({ queryKey: DOMAINS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to delete domain"));
    },
  });

  return {
    domains: domainsQuery.data ?? [],
    isLoading: domainsQuery.isLoading,
    isFetching: domainsQuery.isFetching,
    refetch: domainsQuery.refetch,
    createDomain: createMutation.mutateAsync,
    updateDomain: updateMutation.mutateAsync,
    deleteDomain: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
