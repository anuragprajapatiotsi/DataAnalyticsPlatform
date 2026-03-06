"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { userService } from "../services/user.service";
import { CreateUserRequest } from "../types";
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      // Global invalidation
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};
