import { api } from "@/shared/api/axios";

export interface DatasetPerson {
  id: string;
  email?: string;
  username?: string;
  display_name?: string;
  name?: string;
}

export interface DatasetGroup {
  id: string;
  org_id?: string;
  name: string;
  display_name: string;
  description?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  domain_id?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  created_by?: string | null;
  is_active?: boolean;
  owners?: DatasetPerson[];
  experts?: DatasetPerson[];
  [key: string]: unknown;
}

export interface GetDatasetGroupsParams {
  source_type?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface CreateDatasetGroupRequest {
  name: string;
  display_name: string;
  description?: string | null;
  domain_id?: string | null;
  source_type: "file";
  source_url: null;
  tags: string[];
  owner_ids: string[];
  expert_ids: string[];
}

export const datasetService = {
  async getDatasets(params?: GetDatasetGroupsParams) {
    const response = await api.get<DatasetGroup[]>("/datasets", {
      params: {
        source_type: params?.source_type,
        search: params?.search,
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 50,
      },
    });
    return response.data;
  },

  async createDataset(payload: CreateDatasetGroupRequest) {
    const response = await api.post<DatasetGroup>("/datasets", payload);
    return response.data;
  },
};
