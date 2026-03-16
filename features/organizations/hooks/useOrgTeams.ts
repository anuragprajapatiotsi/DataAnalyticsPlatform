import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { orgService } from "../services/org.service";
import { teamService } from "@/features/teams/services/team.service";

export const useOrgTeams = (orgId: string) => {
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ["organization-teams", orgId],
    queryFn: () => orgService.getOrgTeamsGrouped(orgId),
    enabled: !!orgId,
  });

  const teams = React.useMemo(() => {
    const rawData = teamsQuery.data;
    if (Array.isArray(rawData)) return rawData;
    
    if (rawData && typeof rawData === "object") {
      // Handle cases where data is wrapped in a 'data' or 'teams' property
      if ((rawData as any).data && Array.isArray((rawData as any).data)) {
        return (rawData as any).data;
      }
      if ((rawData as any).teams && Array.isArray((rawData as any).teams)) {
        return (rawData as any).teams;
      }

      // If it's a grouped object (e.g., { "Engineering": [...], "Sales": [...] }), flatten it
      const values = Object.values(rawData);
      if (values.every((v) => Array.isArray(v))) {
        return values.flat();
      }
    }

    return [];
  }, [teamsQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => {
      message.success("Team deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["organization-teams", orgId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return {
    teams,
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    deleteTeam: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
