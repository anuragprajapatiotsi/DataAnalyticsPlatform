"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export type UserTabKey = "teams" | "roles" | "policies";

export const useUserProfile = (userId: string, activeTab?: UserTabKey) => {
  const userQuery = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });

  const teamsQuery = useQuery({
    queryKey: ["user-teams", userId],
    queryFn: () => userService.getUserTeams(userId),
    enabled: !!userId && (!activeTab || activeTab === "teams"),
  });

  const rolesQuery = useQuery({
    queryKey: ["user-roles", userId],
    queryFn: () => userService.getUserRoles(userId),
    enabled: !!userId && (!activeTab || activeTab === "roles"),
  });

  const policiesQuery = useQuery({
    queryKey: ["user-policies", userId],
    queryFn: () => userService.getUserPolicies(userId),
    enabled: !!userId && (!activeTab || activeTab === "policies"),
  });

  return {
    user: userQuery.data,
    teams: teamsQuery.data || [],
    roles: rolesQuery.data || [],
    policies: policiesQuery.data || [],
    isLoading: userQuery.isLoading,
    isLoadingTeams: teamsQuery.isLoading,
    isLoadingRoles: rolesQuery.isLoading,
    isLoadingPolicies: policiesQuery.isLoading,
    isError: userQuery.isError,
  };
};
