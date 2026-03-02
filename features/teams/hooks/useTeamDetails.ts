import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { teamService } from "../services/team.service";
import { TeamDetail, CreateTeamRequest } from "../types";

export type TeamTabKey = "users" | "assets" | "roles" | "policies";

export const useTeamDetails = (teamId?: string, activeTab?: TeamTabKey) => {
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: ["teams", teamId, "details"],
    queryFn: () => teamService.getTeamDetails(teamId!),
    enabled: !!teamId,
  });

  const membersQuery = useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: () => teamService.getMembers(teamId!),
    enabled: !!teamId && (!activeTab || activeTab === "users"),
  });

  const rolesQuery = useQuery({
    queryKey: ["teams", teamId, "roles"],
    queryFn: () => teamService.getRoles(teamId!),
    enabled: !!teamId && activeTab === "roles",
  });

  const policiesQuery = useQuery({
    queryKey: ["teams", teamId, "policies"],
    queryFn: () => teamService.getPolicies(teamId!),
    enabled: !!teamId && activeTab === "policies",
  });

  const assetsQuery = useQuery({
    queryKey: ["teams", teamId, "assets"],
    queryFn: () => teamService.getAssets(teamId!),
    enabled: !!teamId && activeTab === "assets",
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => teamService.addMember(teamId!, userId),
    onSuccess: () => {
      message.success("Member added successfully");
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to add member");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => teamService.removeMember(teamId!, userId),
    onSuccess: () => {
      message.success("Member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to remove member");
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: (data: Partial<CreateTeamRequest>) =>
      teamService.updateTeam(teamId!, data),
    onSuccess: () => {
      message.success("Team updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "details"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update team");
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: (roleId: string) => teamService.addRole(teamId!, roleId),
    onSuccess: () => {
      message.success("Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "roles"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to assign role");
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: (roleId: string) => teamService.removeRole(teamId!, roleId),
    onSuccess: () => {
      message.success("Role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "roles"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to remove role");
    },
  });

  const addPolicyMutation = useMutation({
    mutationFn: (policyId: string) => teamService.addPolicy(teamId!, policyId),
    onSuccess: () => {
      message.success("Policy assigned successfully");
      queryClient.invalidateQueries({
        queryKey: ["teams", teamId, "policies"],
      });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to assign policy");
    },
  });

  const removePolicyMutation = useMutation({
    mutationFn: (policyId: string) =>
      teamService.removePolicy(teamId!, policyId),
    onSuccess: () => {
      message.success("Policy removed successfully");
      queryClient.invalidateQueries({
        queryKey: ["teams", teamId, "policies"],
      });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to remove policy");
    },
  });

  return {
    team: detailsQuery.data,
    members: membersQuery.data || [],
    roles: rolesQuery.data || [],
    policies: policiesQuery.data || [],
    assets: assetsQuery.data || [],
    // Initial load only waits for team details
    isLoading: detailsQuery.isLoading,
    // Tab specific loading states
    isLoadingMembers: membersQuery.isLoading,
    isLoadingRoles: rolesQuery.isLoading,
    isLoadingPolicies: policiesQuery.isLoading,
    isLoadingAssets: assetsQuery.isLoading,
    isError: detailsQuery.isError,
    // Operations
    addMember: addMemberMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    addRole: addRoleMutation.mutateAsync,
    removeRole: removeRoleMutation.mutateAsync,
    addPolicy: addPolicyMutation.mutateAsync,
    removePolicy: removePolicyMutation.mutateAsync,
    updateTeam: updateTeamMutation.mutateAsync,
    // Pending states
    isPending:
      addMemberMutation.isPending ||
      removeMemberMutation.isPending ||
      addRoleMutation.isPending ||
      removeRoleMutation.isPending ||
      addPolicyMutation.isPending ||
      removePolicyMutation.isPending ||
      updateTeamMutation.isPending,
  };
};
