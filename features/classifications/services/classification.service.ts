import { api } from "@/shared/api/axios";

import type {
  Classification,
  ClassificationTag,
  CreateClassificationRequest,
  CreateClassificationTagRequest,
  GetClassificationsParams,
  UpdateClassificationRequest,
  UpdateClassificationTagRequest,
} from "../types";

export const classificationService = {
  async getClassifications(params: GetClassificationsParams = {}) {
    const response = await api.get<Classification[]>("/classifications", {
      params: {
        search: params.search,
        is_active: params.is_active,
        mutually_exclusive: params.mutually_exclusive,
        created_by: params.created_by,
        owner_id: params.owner_id,
        catalog_domain_id: params.catalog_domain_id,
        skip: params.skip ?? 0,
        limit: params.limit ?? 50,
      },
    });

    return response.data;
  },

  async getClassificationById(id: string) {
    const response = await api.get<Classification>(`/classifications/${id}`);
    return response.data;
  },

  async createClassification(payload: CreateClassificationRequest) {
    const response = await api.post<Classification>(
      "/classifications",
      payload,
    );
    return response.data;
  },

  async updateClassification(id: string, payload: UpdateClassificationRequest) {
    const response = await api.put<Classification>(
      `/classifications/${id}`,
      payload,
    );
    return response.data;
  },

  async deleteClassification(id: string) {
    await api.delete(`/classifications/${id}`);
  },

  async getClassificationTags(classificationId: string) {
    const response = await api.get<ClassificationTag[]>(
      `/classifications/${classificationId}/tags`,
    );
    return response.data;
  },

  async createClassificationTag(
    classificationId: string,
    payload: CreateClassificationTagRequest,
  ) {
    const response = await api.post<ClassificationTag>(
      `/classifications/${classificationId}/tags`,
      payload,
    );
    return response.data;
  },

  async updateClassificationTag(
    classificationId: string,
    tagId: string,
    payload: UpdateClassificationTagRequest,
  ) {
    const response = await api.put<ClassificationTag>(
      `/classifications/${classificationId}/tags/${tagId}`,
      payload,
    );
    return response.data;
  },

  async deleteClassificationTag(classificationId: string, tagId: string) {
    await api.delete(`/classifications/${classificationId}/tags/${tagId}`);
  },
};
