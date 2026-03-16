"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { roleService } from "@/features/roles/services/role.service";
import { teamService } from "@/features/teams/services/team.service";
import { policyService } from "@/features/policies/services/policy.service";

export const useUserAssignments = (userId: string) => {
  const queryClient = useQueryClient();

  const assignRoleMutation = useMutation({
    mutationFn: (roleId: string) => roleService.assignUsers(roleId, [userId]),
    onSuccess: () => {
      message.success("Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["user-roles", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to assign role");
    },
  });

  const assignTeamMutation = useMutation({
    mutationFn: (teamId: string) => teamService.assignMembers(teamId, [userId]),
    onSuccess: () => {
      message.success("User added to team successfully");
      queryClient.invalidateQueries({ queryKey: ["user-teams", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to add user to team",
      );
    },
  });

  const assignPolicyMutation = useMutation({
    mutationFn: (policyId: string) =>
      policyService.assignUsers(policyId, [userId]),
    onSuccess: () => {
      message.success("Policy assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["user-policies", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to assign policy");
    },
  });

  return {
    assignRole: assignRoleMutation.mutateAsync,
    isAssigningRole: assignRoleMutation.isPending,
    assignTeam: assignTeamMutation.mutateAsync,
    isAssigningTeam: assignTeamMutation.isPending,
    assignPolicy: assignPolicyMutation.mutateAsync,
    isAssigningPolicy: assignPolicyMutation.isPending,
  };
};
