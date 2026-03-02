import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policyService } from "../services/policy.service";
import { GetPoliciesParams } from "../types";
import { message } from "antd";

export const usePolicies = (
  params: GetPoliciesParams = { skip: 0, limit: 50 },
) => {
  const queryClient = useQueryClient();

  const policiesQuery = useQuery({
    queryKey: ["policies", params],
    queryFn: () => policyService.getPolicies(params),
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (id: string) => policyService.deletePolicy(id),
    onSuccess: () => {
      message.success("Policy deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete policy");
    },
  });

  return {
    policies: policiesQuery.data?.data || [],
    total: policiesQuery.data?.total || 0,
    isLoading: policiesQuery.isLoading,
    isError: policiesQuery.isError,
    deletePolicy: deletePolicyMutation.mutateAsync,
    isDeleting: deletePolicyMutation.isPending,
  };
};
