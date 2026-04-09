import { api } from "@/shared/api/axios";

import type {
  CatalogDomain,
  CreateCatalogDomainRequest,
  UpdateCatalogDomainRequest,
} from "../types";

export const domainService = {
  async getDomains() {
    const response = await api.get<CatalogDomain[]>("/catalog-domains");
    return response.data;
  },

  async createDomain(payload: CreateCatalogDomainRequest) {
    const response = await api.post<CatalogDomain>("/catalog-domains", payload);
    return response.data;
  },

  async updateDomain(id: string, payload: UpdateCatalogDomainRequest) {
    const response = await api.put<CatalogDomain>(
      `/catalog-domains/${id}`,
      payload,
    );
    return response.data;
  },

  async deleteDomain(id: string) {
    await api.delete(`/catalog-domains/${id}`);
  },
};
