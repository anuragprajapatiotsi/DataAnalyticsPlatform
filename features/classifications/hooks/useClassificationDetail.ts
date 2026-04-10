"use client";

import { message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { classificationService } from "../services/classification.service";
import type {
  CreateClassificationTagRequest,
  UpdateClassificationRequest,
  UpdateClassificationTagRequest,
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

export function useClassificationDetail(classificationId: string | null) {
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ["classification", classificationId],
    queryFn: () => classificationService.getClassificationById(classificationId!),
    enabled: !!classificationId,
  });

  const tagsQuery = useQuery({
    queryKey: ["classification-tags", classificationId],
    queryFn: () => classificationService.getClassificationTags(classificationId!),
    enabled: !!classificationId,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateClassificationRequest;
    }) => classificationService.updateClassification(id, payload),
    onSuccess: async (_, variables) => {
      message.success("Classification updated successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["classifications"] }),
        queryClient.invalidateQueries({
          queryKey: ["classification", variables.id],
        }),
      ]);
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to update classification"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => classificationService.deleteClassification(id),
    onSuccess: async () => {
      message.success("Classification deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["classifications"] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to delete classification"));
    },
  });

  const createTagMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateClassificationTagRequest;
    }) => classificationService.createClassificationTag(id, payload),
    onSuccess: async (_, variables) => {
      message.success("Tag added successfully");
      await queryClient.invalidateQueries({
        queryKey: ["classification-tags", variables.id],
      });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to add classification tag"));
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({
      classificationId,
      tagId,
      payload,
    }: {
      classificationId: string;
      tagId: string;
      payload: UpdateClassificationTagRequest;
    }) =>
      classificationService.updateClassificationTag(
        classificationId,
        tagId,
        payload,
      ),
    onSuccess: async (_, variables) => {
      message.success("Tag updated successfully");
      await queryClient.invalidateQueries({
        queryKey: ["classification-tags", variables.classificationId],
      });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to update tag"));
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: ({
      classificationId,
      tagId,
    }: {
      classificationId: string;
      tagId: string;
    }) => classificationService.deleteClassificationTag(classificationId, tagId),
    onSuccess: async (_, variables) => {
      message.success("Tag deleted successfully");
      await queryClient.invalidateQueries({
        queryKey: ["classification-tags", variables.classificationId],
      });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Failed to delete tag"));
    },
  });

  return {
    classification: detailQuery.data ?? null,
    tags: tagsQuery.data ?? [],
    isLoadingDetail: detailQuery.isLoading,
    isFetchingDetail: detailQuery.isFetching,
    isLoadingTags: tagsQuery.isLoading,
    isFetchingTags: tagsQuery.isFetching,
    refetchDetail: detailQuery.refetch,
    refetchTags: tagsQuery.refetch,
    updateClassification: updateMutation.mutateAsync,
    deleteClassification: deleteMutation.mutateAsync,
    createTag: createTagMutation.mutateAsync,
    updateTag: updateTagMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutateAsync,
    isUpdatingClassification: updateMutation.isPending,
    isDeletingClassification: deleteMutation.isPending,
    isCreatingTag: createTagMutation.isPending,
    isUpdatingTag: updateTagMutation.isPending,
    isDeletingTag: deleteTagMutation.isPending,
  };
}
