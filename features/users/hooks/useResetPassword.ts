"use client";

import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { userService } from "../services/user.service";
import { ResetPasswordRequest } from "../types";

export const useResetPassword = (userId: string) => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      userService.resetPassword(userId, data),
    onSuccess: () => {
      message.success("Password reset successfully");
    },
  });
};
