import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { orgService } from "../services/org.service";
import type { CreateOrgRequest, UpdateOrgRequest } from "@/services/api/types";

export const useOrganizations = () => {
  const queryClient = useQueryClient();

  const {
    data: organizations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: orgService.getOrgs,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOrgRequest) => orgService.createOrg(data),
    onSuccess: () => {
      message.success("Organization created successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to create organization",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgRequest }) =>
      orgService.updateOrg(id, data),
    onSuccess: () => {
      message.success("Organization updated successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to update organization",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orgService.deleteOrg(id),
    onSuccess: () => {
      message.success("Organization deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to delete organization",
      );
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
