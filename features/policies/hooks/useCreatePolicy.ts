"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { policyService } from "../services/policy.service";
import { CreatePolicyPayload, ResourceGroup } from "../types";
import { message } from "antd";

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  // Fetch resources
  const resourcesQuery = useQuery({
    queryKey: ["resources"],
    queryFn: () => policyService.getResources(),
    select: (data: ResourceGroup[]) => data,
  });

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: (payload: CreatePolicyPayload) =>
      policyService.createPolicy(payload),
    onSuccess: () => {
      message.success("Policy created successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Failed to create policy";
      message.error(errorMsg);
    },
  });

  // Update policy mutation
  const updatePolicyMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreatePolicyPayload;
    }) => policyService.updatePolicy(id, payload),
    onSuccess: () => {
      message.success("Policy updated successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Failed to update policy";
      message.error(errorMsg);
    },
  });

  return {
    resources: resourcesQuery.data || [],
    isLoadingResources: resourcesQuery.isLoading,
    isCreating: createPolicyMutation.isPending,
    createPolicy: createPolicyMutation.mutateAsync,
    isUpdating: updatePolicyMutation.isPending,
    updatePolicy: updatePolicyMutation.mutateAsync,
  };
};
