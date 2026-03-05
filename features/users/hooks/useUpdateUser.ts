"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { userService } from "../services/user.service";
import { UpdateUserRequest } from "../types";
import { useRouter } from "next/navigation";

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(id, data),
    onSuccess: () => {
      message.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      router.push("/settings/organization-team-user-management/users");
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to update user";
      message.error(errorMsg);
    },
  });
};
