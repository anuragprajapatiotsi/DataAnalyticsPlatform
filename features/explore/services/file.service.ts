import { api } from "@/shared/api/axios";

export interface IngestFile {
  job_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  status: string;
  bucket?: string;
  object_key?: string;
  storage_config_id?: string;
  asset_id?: string;
  asset_name?: string;
  asset_type?: string;
  dataset_id?: string;
  dataset_name?: string;
  column_count?: number;
  created_at: string;
  completed_at?: string;
  triggered_by?: string;
  error_message?: string;
  inferred_schema?: any[];
  [key: string]: any;
}

export const fileService = {
  /**
   * Fetch all uploaded files.
   * GET /ingest/upload
   */
  async getFiles(params?: { 
    skip?: number; 
    limit?: number;
    status?: string | null;
    file_type?: string | null;
    has_asset?: boolean | null;
  }) {
    const response = await api.get<IngestFile[]>("/ingest/files", {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 50,
        status: params?.status,
        file_type: params?.file_type,
        has_asset: params?.has_asset,
      },
    });
    return response.data;
  },

  /**
   * Fetch a specific file by its ingest_id.
   * GET /ingest/upload/{ingest_id}
   */
  async getFileById(ingest_id: string) {
    const response = await api.get<IngestFile>(`/ingest/jobs/${ingest_id}`);
    return response.data;
  },

  /**
   * Upload a new file (multipart/form-data).
   * POST /ingest/upload
   */
  async uploadFile(file: File, additionalData?: Record<string, any>) {
    const formData = new FormData();
    formData.append("file", file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await api.post<IngestFile>("/ingest/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete a file by its job_id.
   * DELETE /ingest/jobs/{job_id}
   */
  async deleteFile(job_id: string) {
    const response = await api.delete(`/ingest/jobs/${job_id}`);
    return response.data;
  },

  /**
   * Confirm job to create Catalog View.
   * POST /ingest/jobs/{job_id}/confirm
   */
  async confirmJob(job_id: string) {
    const response = await api.post(`/ingest/jobs/${job_id}/confirm`);
    return response.data;
  },
};
