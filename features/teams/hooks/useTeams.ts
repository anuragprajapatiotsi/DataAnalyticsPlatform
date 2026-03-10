import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { teamService } from "../services/team.service";
import { GetTeamsParams, CreateTeamRequest, UpdateTeamRequest } from "../types";

export const useTeams = (params: GetTeamsParams = { skip: 0, limit: 50 }) => {
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ["teams", params],
    queryFn: () => teamService.getTeams(params),
  });

  const teams = teamsQuery.data?.data || [];
  const total = teamsQuery.data?.total || 0;

  const createMutation = useMutation({
    mutationFn: (data: CreateTeamRequest) => teamService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) =>
      teamService.updateTeam(id, data),
    onSuccess: () => {
      message.success("Team updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => {
      message.success("Team deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return {
    teams,
    total,
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    createTeam: createMutation.mutateAsync,
    updateTeam: updateMutation.mutateAsync,
    deleteTeam: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: teamsQuery.refetch,
  };
};
