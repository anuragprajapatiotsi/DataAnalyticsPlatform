"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id && enabled,
  });
};
