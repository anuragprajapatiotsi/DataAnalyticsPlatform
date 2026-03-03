import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../services/role.service";
import { policyService } from "@/features/policies/services/policy.service";
import { message } from "antd";

export const useRoleDetails = (
  roleId: string,
  options?: {
    policiesEnabled?: boolean;
    usersEnabled?: boolean;
    teamsEnabled?: boolean;
    fetchAllPolicies?: boolean;
  },
) => {
  const queryClient = useQueryClient();

  const roleQuery = useQuery({
    queryKey: ["role-details", roleId],
    queryFn: () => roleService.getRoleById(roleId),
    enabled: !!roleId,
  });

  const policiesQuery = useQuery({
    queryKey: ["role-policies", roleId],
    queryFn: () => roleService.getRolePolicies(roleId),
    enabled: !!roleId && !!options?.policiesEnabled,
  });

  const usersQuery = useQuery({
    queryKey: ["role-users", roleId],
    queryFn: () => roleService.getRoleUsers(roleId),
    enabled: !!roleId && !!options?.usersEnabled,
  });

  const teamsQuery = useQuery({
    queryKey: ["role-teams", roleId],
    queryFn: () => roleService.getRoleTeams(roleId),
    enabled: !!roleId && !!options?.teamsEnabled,
  });

  const allPoliciesQuery = useQuery({
    queryKey: ["all-policies"],
    queryFn: () => policyService.getPolicies({ skip: 0, limit: 100 }),
    enabled: !!options?.fetchAllPolicies,
  });

  const attachPoliciesMutation = useMutation({
    mutationFn: (policyIds: string[]) =>
      roleService.attachPolicies(roleId, policyIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-policies", roleId] });
      message.success("Policies added successfully");
    },
    onError: () => {
      message.error("Failed to add policies");
    },
  });

  const detachPolicyMutation = useMutation({
    mutationFn: (policyId: string) =>
      roleService.detachPolicy(roleId, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-policies", roleId] });
      message.success("Policy removed successfully");
    },
    onError: () => {
      message.error("Failed to remove policy");
    },
  });

  const unassignUserMutation = useMutation({
    mutationFn: (userId: string) => roleService.unassignUser(roleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-users", roleId] });
      message.success("User removed from role successfully");
    },
    onError: () => {
      message.error("Failed to remove user from role");
    },
  });

  return {
    role: roleQuery.data,
    isLoadingRole: roleQuery.isLoading,
    policies: policiesQuery.data,
    isLoadingPolicies: policiesQuery.isLoading,
    users: usersQuery.data,
    isLoadingUsers: usersQuery.isLoading,
    teams: teamsQuery.data,
    isLoadingTeams: teamsQuery.isLoading,
    allPolicies: allPoliciesQuery.data?.data || [],
    isLoadingAllPolicies: allPoliciesQuery.isLoading,
    attachPolicies: attachPoliciesMutation.mutateAsync,
    isAttaching: attachPoliciesMutation.isPending,
    detachPolicy: detachPolicyMutation.mutateAsync,
    isDetaching: detachPolicyMutation.isPending,
    unassignUser: unassignUserMutation.mutateAsync,
    isUnassigning: unassignUserMutation.isPending,
  };
};
