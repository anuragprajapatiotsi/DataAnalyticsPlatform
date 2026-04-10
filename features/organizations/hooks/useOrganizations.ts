import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { orgService } from "../services/org.service";
import type { CreateOrgRequest, UpdateOrgRequest } from "@/shared/types";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const response = (error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  }).response;

  return response?.data?.message || fallback;
}

export const useOrganizations = () => {
  const queryClient = useQueryClient();

  const {
    data: organizations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: orgService.getOrgs,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOrgRequest) => orgService.createOrg(data),
    onSuccess: () => {
      message.success("Organization created successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to create organization"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgRequest }) =>
      orgService.updateOrg(id, data),
    onSuccess: () => {
      message.success("Organization updated successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to update organization"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orgService.deleteOrg(id),
    onSuccess: () => {
      message.success("Organization deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to delete organization"));
    },
  });

  return {
    organizations,
    isLoading,
    isError,
    createOrganization: createMutation.mutateAsync,
    updateOrganization: updateMutation.mutateAsync,
    deleteOrganization: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

