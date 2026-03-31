import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { teamService } from "../services/team.service";
import { TeamDetail, CreateTeamRequest } from "../types";
import { useAuthContext } from "@/shared/contexts/auth-context";

export type TeamTabKey = "users" | "assets" | "roles" | "policies";

export const useTeamDetails = (teamId?: string, activeTab?: TeamTabKey) => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const detailsQuery = useQuery({
    queryKey: ["teams", teamId, "details"],
    queryFn: () => teamService.getTeamDetails(teamId!),
    enabled: !!teamId,
  });

  const membersQuery = useQuery({
    queryKey: ["team-members", teamId, user?.org_id],
    queryFn: () => teamService.getMembers(teamId!, user?.org_id),
    enabled: !!teamId && (!activeTab || activeTab === "users"),
  });

  const rolesQuery = useQuery({
    queryKey: ["team-roles", teamId, user?.org_id],
    queryFn: () => teamService.getRoles(teamId!, user?.org_id),
    enabled: !!teamId && activeTab === "roles",
  });

  const policiesQuery = useQuery({
    queryKey: ["team-policies", teamId, user?.org_id],
    queryFn: () => teamService.getPolicies(teamId!, user?.org_id),
    enabled: !!teamId && activeTab === "policies",
  });

  const assetsQuery = useQuery({
    queryKey: ["teams", teamId, "assets"],
    queryFn: () => teamService.getAssets(teamId!),
    enabled: !!teamId && activeTab === "assets",
  });

  const assignMembersMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      teamService.assignMembers(teamId!, userIds),
    onSuccess: () => {
      message.success("Members added successfully");
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to add members");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => teamService.removeMember(teamId!, userId),
    onSuccess: () => {
      message.success("Member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
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
    mutationFn: (roleId: string) => {
      if (!user?.org_id) {
        throw new Error("Missing organization context (org_id)");
      }
      return teamService.addRole(teamId!, roleId, user.org_id);
    },
    onSuccess: () => {
      message.success("Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["team-roles", teamId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to assign role");
    },
  });

  const assignRolesMutation = useMutation({
    mutationFn: (roleIds: string[]) => {
      if (!user?.org_id) {
        throw new Error("Missing organization context (org_id)");
      }
      return teamService.assignRoles(teamId!, roleIds, user.org_id);
    },
    onSuccess: () => {
      message.success("Roles assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["team-roles", teamId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to assign roles");
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: (roleId: string) => teamService.removeRole(teamId!, roleId),
    onSuccess: () => {
      message.success("Role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["team-roles", teamId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to remove role");
    },
  });

  const addPolicyMutation = useMutation({
    mutationFn: (policyId: string) => {
      if (!user?.org_id) {
        throw new Error("Missing organization context (org_id)");
      }
      return teamService.addPolicy(teamId!, policyId, user.org_id);
    },
    onSuccess: () => {
      message.success("Policy assigned successfully");
      queryClient.invalidateQueries({
        queryKey: ["team-policies", teamId],
      });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to assign policy");
    },
  });

  const assignPoliciesMutation = useMutation({
    mutationFn: (policyIds: string[]) => {
      if (!user?.org_id) {
        throw new Error("Missing organization context (org_id)");
      }
      return teamService.assignPolicies(teamId!, policyIds, user.org_id);
    },
    onSuccess: () => {
      message.success("Policies assigned successfully");
      queryClient.invalidateQueries({
        queryKey: ["team-policies", teamId],
      });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to assign policies",
      );
    },
  });

  const removePolicyMutation = useMutation({
    mutationFn: (policyId: string) =>
      teamService.removePolicy(teamId!, policyId),
    onSuccess: () => {
      message.success("Policy removed successfully");
      queryClient.invalidateQueries({
        queryKey: ["team-policies", teamId],
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
    assignMembers: assignMembersMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    addRole: addRoleMutation.mutateAsync,
    assignRoles: assignRolesMutation.mutateAsync,
    removeRole: removeRoleMutation.mutateAsync,
    addPolicy: addPolicyMutation.mutateAsync,
    assignPolicies: assignPoliciesMutation.mutateAsync,
    removePolicy: removePolicyMutation.mutateAsync,
    updateTeam: updateTeamMutation.mutateAsync,
    // Pending states
    isPending:
      assignMembersMutation.isPending ||
      removeMemberMutation.isPending ||
      addRoleMutation.isPending ||
      removeRoleMutation.isPending ||
      assignRolesMutation.isPending ||
      addPolicyMutation.isPending ||
      removePolicyMutation.isPending ||
      assignPoliciesMutation.isPending ||
      updateTeamMutation.isPending,
  };
};
