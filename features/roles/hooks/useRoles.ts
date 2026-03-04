import { useQuery } from "@tanstack/react-query";
import { roleService } from "../services/role.service";
import { GetRolesParams } from "../types";

export const useRoles = (params: GetRolesParams = { skip: 0, limit: 100 }) => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getRoles(params),
  });
};
