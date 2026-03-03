import { useQuery } from "@tanstack/react-query";
import { roleService } from "../services/role.service";
import { GetRolesParams } from "../types";

export const useRoles = (params: GetRolesParams = { skip: 0, limit: 10 }) => {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => roleService.getRoles(params),
  });
};
