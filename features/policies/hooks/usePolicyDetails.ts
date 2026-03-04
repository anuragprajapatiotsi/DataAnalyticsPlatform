import { useQuery } from "@tanstack/react-query";
import { policyService } from "../services/policy.service";

export const usePolicyDetails = (
  policyId: string,
  options?: {
    rulesEnabled?: boolean;
    teamsEnabled?: boolean;
    rolesEnabled?: boolean;
  },
) => {
  const policyQuery = useQuery({
    queryKey: ["policy-details", policyId],
    queryFn: () => policyService.getPolicyById(policyId),
    enabled: !!policyId,
  });

  const teamsQuery = useQuery({
    queryKey: ["policy-teams", policyId],
    queryFn: () => policyService.getPolicyTeams(policyId),
    enabled: !!policyId && !!options?.teamsEnabled,
  });

  const rolesQuery = useQuery({
    queryKey: ["policy-roles", policyId],
    queryFn: () => policyService.getPolicyRoles(policyId),
    enabled: !!policyId && !!options?.rolesEnabled,
  });

  return {
    policy: policyQuery.data,
    isLoadingPolicy: policyQuery.isLoading,
    teams: teamsQuery.data,
    isLoadingTeams: teamsQuery.isLoading,
    roles: rolesQuery.data,
    isLoadingRoles: rolesQuery.isLoading,
  };
};
