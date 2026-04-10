"use client";

import { message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { classificationService } from "../services/classification.service";
import type {
  CreateClassificationRequest,
  GetClassificationsParams,
} from "../types";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const response = (error as {
    response?: {
      data?: {
        detail?: string;
        message?: string;
      };
    };
  }).response;

  return response?.data?.detail || response?.data?.message || fallback;
}

export function useClassifications(params: GetClassificationsParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["classifications", params],
    queryFn: () => classificationService.getClassifications(params),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateClassificationRequest) =>
      classificationService.createClassification(payload),
    onSuccess: async () => {
      message.success("Classification created successfully");
      await queryClient.invalidateQueries({ queryKey: ["classifications"] });
    },
    onError: (error: unknown) => {
      message.error(
        getApiErrorMessage(error, "Failed to create classification"),
      );
    },
  });

  return {
    ...query,
    createClassification: createMutation.mutateAsync,
    isCreatingClassification: createMutation.isPending,
  };
}
