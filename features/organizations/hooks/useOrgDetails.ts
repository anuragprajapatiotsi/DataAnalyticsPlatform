import { useQuery } from "@tanstack/react-query";
import { orgService } from "../services/org.service";

export const useOrgDetails = (id: string) => {
  return useQuery({
    queryKey: ["organization", id],
    queryFn: () => orgService.getOrg(id),
    enabled: !!id,
  });
};
