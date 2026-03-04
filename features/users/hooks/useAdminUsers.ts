"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { GetUserParams } from "../types";

export const useAdminUsers = (params: GetUserParams) => {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => userService.getAdminUsers(params),
    placeholderData: (previousData) => previousData,
  });
};
