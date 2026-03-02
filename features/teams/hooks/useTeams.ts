import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { teamService } from "../services/team.service";
import { CreateTeamRequest, UpdateTeamRequest } from "../types";

export const useTeams = () => {
  const queryClient = useQueryClient();

  const {
    data: teams = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: teamService.getTeams,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTeamRequest) => teamService.createTeam(data),
    onSuccess: () => {
      message.success("Team created successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to create team");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) =>
      teamService.updateTeam(id, data),
    onSuccess: () => {
      message.success("Team updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update team");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => {
      message.success("Team deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete team");
    },
  });

  return {
    teams,
    isLoading,
    isError,
    createTeam: createMutation.mutateAsync,
    updateTeam: updateMutation.mutateAsync,
    deleteTeam: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
