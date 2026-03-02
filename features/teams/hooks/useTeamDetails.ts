import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { teamService } from "../services/team.service";
import { TeamDetail } from "../types";

export const useTeamDetails = (teamId?: string) => {
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => teamService.getTeamDetails(teamId!),
    enabled: !!teamId,
  });

  const membersQuery = useQuery({
    queryKey: ["team", teamId, "members"],
    queryFn: () => teamService.getMembers(teamId!),
    enabled: !!teamId,
  });

  const rolesQuery = useQuery({
    queryKey: ["team", teamId, "roles"],
    queryFn: () => teamService.getRoles(teamId!),
    enabled: !!teamId,
  });

  const policiesQuery = useQuery({
    queryKey: ["team", teamId, "policies"],
    queryFn: () => teamService.getPolicies(teamId!),
    enabled: !!teamId,
  });

  const assetsQuery = useQuery({
    queryKey: ["team", teamId, "assets"],
    queryFn: () => teamService.getAssets(teamId!),
    enabled: !!teamId,
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => teamService.addMember(teamId!, userId),
    onSuccess: () => {
      message.success("Member added successfully");
      queryClient.invalidateQueries({ queryKey: ["team", teamId, "members"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to add member");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => teamService.removeMember(teamId!, userId),
    onSuccess: () => {
      message.success("Member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["team", teamId, "members"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to remove member");
    },
  });

  return {
    team: detailsQuery.data,
    members: membersQuery.data || [],
    roles: rolesQuery.data || [],
    policies: policiesQuery.data || [],
    assets: assetsQuery.data || [],
    isLoading:
      detailsQuery.isLoading ||
      membersQuery.isLoading ||
      rolesQuery.isLoading ||
      policiesQuery.isLoading ||
      assetsQuery.isLoading,
    isError: detailsQuery.isError,
    addMember: addMemberMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
  };
};
