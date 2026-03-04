"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { userService } from "../services/user.service";
import { CreateUserRequest } from "../types";
import { useRouter } from "next/navigation";

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      message.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      router.push("/settings/organization-team-user-management/users");
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to create user";
      message.error(errorMsg);
    },
  });
};
