"use client";

import { api } from "@/shared/api/axios";

import type {
  CreateNotebookSparkJobRequest,
  CreateNotebookScheduleRequest,
  CreateNotebookRequest,
  NotebookCellExecution,
  Notebook,
  NotebookContent,
  NotebookRun,
  NotebookSchedule,
  NotebookScheduleRun,
  NotebookSparkJob,
  NotebookSparkJobRun,
  NotebookSession,
  TriggerNotebookSparkJobRunRequest,
  UpdateNotebookScheduleRequest,
  UpdateNotebookSparkJobRequest,
  UpdateNotebookRequest,
} from "@/features/notebooks/types";

function normalizeNotebookList(payload: unknown): Notebook[] {
  if (Array.isArray(payload)) {
    return payload as Notebook[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as Notebook[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as Notebook[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as Notebook[];
    }
  }

  return [];
}

function normalizeNotebookRunList(payload: unknown): NotebookRun[] {
  if (Array.isArray(payload)) {
    return payload as NotebookRun[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as NotebookRun[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as NotebookRun[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as NotebookRun[];
    }
  }

  return [];
}

function normalizeNotebookSessionList(payload: unknown): NotebookSession[] {
  if (Array.isArray(payload)) {
    return payload as NotebookSession[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as NotebookSession[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as NotebookSession[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as NotebookSession[];
    }
  }

  return [];
}

function normalizeNotebookExecutionList(payload: unknown): NotebookCellExecution[] {
  if (Array.isArray(payload)) {
    return payload as NotebookCellExecution[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as NotebookCellExecution[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as NotebookCellExecution[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as NotebookCellExecution[];
    }
  }

  return [];
}

function normalizeNotebookSparkJobList(payload: unknown): NotebookSparkJob[] {
  if (Array.isArray(payload)) {
    return payload as NotebookSparkJob[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as NotebookSparkJob[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as NotebookSparkJob[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as NotebookSparkJob[];
    }
  }

  return [];
}

function normalizeNotebookSparkJobRunList(payload: unknown): NotebookSparkJobRun[] {
  if (Array.isArray(payload)) {
    return payload as NotebookSparkJobRun[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as NotebookSparkJobRun[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as NotebookSparkJobRun[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as NotebookSparkJobRun[];
    }
  }

  return [];
}

function normalizeNotebookScheduleList(payload: unknown): NotebookSchedule[] {
  if (Array.isArray(payload)) {
    return payload as NotebookSchedule[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as NotebookSchedule[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as NotebookSchedule[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as NotebookSchedule[];
    }
  }

  return [];
}

function normalizeNotebookScheduleRunList(payload: unknown): NotebookScheduleRun[] {
  if (Array.isArray(payload)) {
    return payload as NotebookScheduleRun[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as NotebookScheduleRun[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as NotebookScheduleRun[];
    }

    if (Array.isArray(wrapped.results)) {
      return wrapped.results as NotebookScheduleRun[];
    }
  }

  return [];
}

export const notebookService = {
  async getNotebooks() {
    const response = await api.get<
      Notebook[] | { data?: Notebook[]; items?: Notebook[]; results?: Notebook[] }
    >("/notebooks");
    return normalizeNotebookList(response.data);
  },

  async getNotebookById(notebookId: string) {
    const response = await api.get<Notebook>(`/notebooks/${notebookId}`);
    return response.data;
  },

  async createNotebook(payload: CreateNotebookRequest) {
    const response = await api.post<Notebook>("/notebooks", payload);
    return response.data;
  },

  async uploadNotebook(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<Notebook>("/notebooks/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updateNotebook(notebookId: string, payload: UpdateNotebookRequest) {
    const response = await api.put<Notebook>(`/notebooks/${notebookId}`, payload);
    return response.data;
  },

  async deleteNotebook(notebookId: string) {
    const response = await api.delete(`/notebooks/${notebookId}`);
    return response.data;
  },

  async getNotebookContent(notebookId: string) {
    const response = await api.get<NotebookContent>(`/notebooks/${notebookId}/content`);
    return response.data;
  },

  async updateNotebookContent(notebookId: string, payload: NotebookContent) {
    const response = await api.put<NotebookContent>(`/notebooks/${notebookId}/content`, {
      content: payload,
    });
    return response.data;
  },

  async runNotebook(notebookId: string) {
    const response = await api.post(`/notebooks/${notebookId}/run`, {});
    return response.data;
  },

  async getNotebookRuns(notebookId: string, refreshStatus = true) {
    const response = await api.get<
      NotebookRun[] | { data?: NotebookRun[]; items?: NotebookRun[]; results?: NotebookRun[] }
    >(`/notebooks/${notebookId}/runs`, {
      params: {
        refresh_status: refreshStatus,
      },
    });
    return normalizeNotebookRunList(response.data);
  },

  async getNotebookRunById(
    notebookId: string,
    runId: string,
    refreshStatus = true,
  ) {
    const response = await api.get<NotebookRun>(`/notebooks/${notebookId}/runs/${runId}`, {
      params: {
        refresh_status: refreshStatus,
      },
    });
    return response.data;
  },

  async createNotebookSession(
    notebookId: string,
    payload: {
      execution_profile?: string;
      session_metadata?: Record<string, unknown>;
    },
  ) {
    const response = await api.post<NotebookSession>(
      `/notebooks/${notebookId}/sessions`,
      payload,
    );
    return response.data;
  },

  async getNotebookSessions(notebookId: string) {
    const response = await api.get<
      | NotebookSession[]
      | { data?: NotebookSession[]; items?: NotebookSession[]; results?: NotebookSession[] }
    >(`/notebooks/${notebookId}/sessions`);
    return normalizeNotebookSessionList(response.data);
  },

  async restartNotebookSession(notebookId: string, sessionId: string) {
    const response = await api.post<NotebookSession>(
      `/notebooks/${notebookId}/sessions/${sessionId}/restart`,
      {},
    );
    return response.data;
  },

  async closeNotebookSession(notebookId: string, sessionId: string) {
    const response = await api.post<NotebookSession>(
      `/notebooks/${notebookId}/sessions/${sessionId}/close`,
      {},
    );
    return response.data;
  },

  async getNotebookExecutions(notebookId: string, sessionId: string) {
    const response = await api.get<
      | NotebookCellExecution[]
      | { data?: NotebookCellExecution[]; items?: NotebookCellExecution[]; results?: NotebookCellExecution[] }
    >(`/notebooks/${notebookId}/sessions/${sessionId}/executions`);
    return normalizeNotebookExecutionList(response.data);
  },

  async executeNotebookCell(
    notebookId: string,
    sessionId: string,
    payload: {
      code: string;
      cell_type?: string;
    },
  ) {
    const response = await api.post<NotebookCellExecution>(
      `/notebooks/${notebookId}/sessions/${sessionId}/execute`,
      {
        cell_type: payload.cell_type || "code",
        code: payload.code,
      },
    );
    return response.data;
  },

  async getNotebookSparkJobs(notebookId: string) {
    const response = await api.get<
      | NotebookSparkJob[]
      | { data?: NotebookSparkJob[]; items?: NotebookSparkJob[]; results?: NotebookSparkJob[] }
    >(`/notebooks/${notebookId}/spark-jobs`);
    return normalizeNotebookSparkJobList(response.data);
  },

  async createNotebookSparkJob(
    notebookId: string,
    payload: CreateNotebookSparkJobRequest,
  ) {
    const response = await api.post<NotebookSparkJob>(
      `/notebooks/${notebookId}/spark-jobs`,
      payload,
    );
    return response.data;
  },

  async getNotebookSparkJob(sparkJobId: string) {
    const response = await api.get<NotebookSparkJob>(`/notebooks/spark-jobs/${sparkJobId}`);
    return response.data;
  },

  async updateNotebookSparkJob(
    sparkJobId: string,
    payload: UpdateNotebookSparkJobRequest,
  ) {
    const response = await api.put<NotebookSparkJob>(
      `/notebooks/spark-jobs/${sparkJobId}`,
      payload,
    );
    return response.data;
  },

  async deleteNotebookSparkJob(sparkJobId: string) {
    const response = await api.delete(`/notebooks/spark-jobs/${sparkJobId}`);
    return response.data;
  },

  async pauseNotebookSparkJob(sparkJobId: string) {
    const response = await api.post<NotebookSparkJob>(
      `/notebooks/spark-jobs/${sparkJobId}/pause`,
      {},
    );
    return response.data;
  },

  async resumeNotebookSparkJob(sparkJobId: string) {
    const response = await api.post<NotebookSparkJob>(
      `/notebooks/spark-jobs/${sparkJobId}/resume`,
      {},
    );
    return response.data;
  },

  async triggerNotebookSparkJobRun(
    sparkJobId: string,
    payload: TriggerNotebookSparkJobRunRequest = {},
  ) {
    const response = await api.post<NotebookSparkJobRun>(
      `/notebooks/spark-jobs/${sparkJobId}/runs`,
      payload,
    );
    return response.data;
  },

  async getNotebookSparkJobRuns(sparkJobId: string, refreshStatus = true) {
    const response = await api.get<
      | NotebookSparkJobRun[]
      | { data?: NotebookSparkJobRun[]; items?: NotebookSparkJobRun[]; results?: NotebookSparkJobRun[] }
    >(`/notebooks/spark-jobs/${sparkJobId}/runs`, {
      params: {
        refresh_status: refreshStatus,
      },
    });
    return normalizeNotebookSparkJobRunList(response.data);
  },

  async getNotebookSparkJobRunById(runId: string, refreshStatus = true) {
    const response = await api.get<NotebookSparkJobRun>(
      `/notebooks/spark-jobs/runs/${runId}`,
      {
        params: {
          refresh_status: refreshStatus,
        },
      },
    );
    return response.data;
  },

  async stopNotebookSparkJobRun(runId: string) {
    const response = await api.post<NotebookSparkJobRun>(
      `/notebooks/spark-jobs/runs/${runId}/stop`,
      {},
    );
    return response.data;
  },

  async rerunNotebookSparkJobRun(runId: string) {
    const response = await api.post<NotebookSparkJobRun>(
      `/notebooks/spark-jobs/runs/${runId}/rerun`,
      {},
    );
    return response.data;
  },

  async getNotebookSchedules(sparkJobId: string) {
    const response = await api.get<
      | NotebookSchedule[]
      | { data?: NotebookSchedule[]; items?: NotebookSchedule[]; results?: NotebookSchedule[] }
    >(`/notebooks/spark-jobs/${sparkJobId}/schedules`);
    return normalizeNotebookScheduleList(response.data);
  },

  async getNotebookScheduleById(scheduleId: string) {
    const response = await api.get<NotebookSchedule>(`/notebooks/schedules/${scheduleId}`);
    return response.data;
  },

  async createNotebookSchedule(
    sparkJobId: string,
    payload: CreateNotebookScheduleRequest,
  ) {
    const response = await api.post<NotebookSchedule>(
      `/notebooks/spark-jobs/${sparkJobId}/schedules`,
      payload,
    );
    return response.data;
  },

  async updateNotebookSchedule(
    scheduleId: string,
    payload: UpdateNotebookScheduleRequest,
  ) {
    const response = await api.put<NotebookSchedule>(
      `/notebooks/schedules/${scheduleId}`,
      payload,
    );
    return response.data;
  },

  async pauseNotebookSchedule(scheduleId: string) {
    const response = await api.post<NotebookSchedule>(
      `/notebooks/schedules/${scheduleId}/pause`,
      {},
    );
    return response.data;
  },

  async resumeNotebookSchedule(scheduleId: string) {
    const response = await api.post<NotebookSchedule>(
      `/notebooks/schedules/${scheduleId}/resume`,
      {},
    );
    return response.data;
  },

  async runNotebookSchedule(scheduleId: string) {
    const response = await api.post<NotebookScheduleRun>(
      `/notebooks/schedules/${scheduleId}/runs`,
      {},
    );
    return response.data;
  },

  async getNotebookScheduleRuns(scheduleId: string, refreshStatus = true) {
    const response = await api.get<
      | NotebookScheduleRun[]
      | { data?: NotebookScheduleRun[]; items?: NotebookScheduleRun[]; results?: NotebookScheduleRun[] }
    >(`/notebooks/schedules/${scheduleId}/runs`, {
      params: {
        refresh_status: refreshStatus,
      },
    });
    return normalizeNotebookScheduleRunList(response.data);
  },

  async getNotebookScheduleRunById(runId: string, refreshStatus = true) {
    const response = await api.get<NotebookScheduleRun>(
      `/notebooks/schedules/runs/${runId}`,
      {
        params: {
          refresh_status: refreshStatus,
        },
      },
    );
    return response.data;
  },
};
