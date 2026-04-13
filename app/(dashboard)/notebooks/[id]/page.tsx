"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Alert,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  PauseCircle,
  Play,
  Plus,
  RefreshCw,
  SquareTerminal,
  Save,
  Sparkles,
  Trash2,
  RotateCcw,
  Square,
  TerminalSquare,
} from "lucide-react";
import {
  Group as ResizablePanelGroup,
  Panel as ResizablePanel,
  Separator as ResizableHandle,
} from "react-resizable-panels";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { NotebookCellEditor } from "@/features/notebooks/components/NotebookCellEditor";
import { NOTEBOOK_CODE_SNIPPETS } from "@/features/notebooks/constants/templates";
import { notebookService } from "@/features/notebooks/services/notebook.service";
import { useNotificationFeed } from "@/features/notifications/hooks/useNotificationFeed";
import type { NotificationNotebookRunItem } from "@/features/notifications/types";
import type {
  NotebookCellExecution,
  NotebookContent,
  NotebookExecutionMode,
  NotebookExecutionProfile,
  NotebookRun,
  NotebookSchedule,
  NotebookScheduleRun,
  NotebookSparkJob,
  NotebookSparkJobRun,
  NotebookSession,
} from "@/features/notebooks/types";

function safeStringifyContent(content: NotebookContent | undefined) {
  if (!content) {
    return JSON.stringify(
      {
        cells: [],
        metadata: {},
        nbformat: 4,
        nbformat_minor: 5,
      },
      null,
      2,
    );
  }

  return JSON.stringify(content, null, 2);
}

function safeStringifyJson(value: unknown) {
  if (!value || (typeof value === "object" && Object.keys(value as Record<string, unknown>).length === 0)) {
    return "{}";
  }

  return JSON.stringify(value, null, 2);
}

function parseJsonRecord(value: string, fallbackMessage: string) {
  if (!value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(fallbackMessage);
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, string>>(
      (accumulator, [key, entryValue]) => {
        accumulator[key] =
          typeof entryValue === "string" ? entryValue : JSON.stringify(entryValue);
        return accumulator;
      },
      {},
    );
  } catch {
    throw new Error(fallbackMessage);
  }
}

function parseArgsList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildCellOutputsFromExecution(execution: NotebookCellExecution) {
  const outputs: Array<Record<string, unknown>> = [];

  if (execution.stdout) {
    outputs.push({
      output_type: "stream",
      name: "stdout",
      text: execution.stdout,
    });
  }

  if (execution.stderr) {
    outputs.push({
      output_type: "stream",
      name: "stderr",
      text: execution.stderr,
    });
  }

  if (execution.result_json !== undefined) {
    outputs.push({
      output_type: "execute_result",
      data: {
        "application/json": execution.result_json,
        "text/plain":
          typeof execution.result_json === "string"
            ? execution.result_json
            : JSON.stringify(execution.result_json, null, 2),
      },
      execution_count: execution.execution_count ?? null,
    });
  }

  if (execution.error_message || execution.error_name || execution.traceback) {
    outputs.push({
      output_type: "error",
      ename: execution.error_name || "ExecutionError",
      evalue: execution.error_message || "",
      traceback: Array.isArray(execution.traceback)
        ? execution.traceback
        : execution.traceback
          ? [String(execution.traceback)]
          : [],
    });
  }

  return outputs;
}

function getActivityBadgeClass(status?: string) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "success" || normalizedStatus === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "failed" || normalizedStatus === "error") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function getActivityLabel(item: NotificationNotebookRunItem) {
  if (item.schedule_id) {
    return item.schedule_name || "Schedule Run";
  }

  if (item.spark_job_id) {
    return item.spark_job_name || "Spark Job Run";
  }

  return item.notebook_name || "Notebook Run";
}

function getNotebookDraftStorageKey(notebookId: string) {
  return `notebook_draft_${notebookId}`;
}

type NotebookContentSnapshot = {
  id: string;
  saved_at: string;
  content: string;
};

function getNotebookHistoryStorageKey(notebookId: string) {
  return `notebook_history_${notebookId}`;
}

function readNotebookHistory(notebookId: string) {
  if (typeof window === "undefined") {
    return [] as NotebookContentSnapshot[];
  }

  try {
    const rawValue = window.localStorage.getItem(getNotebookHistoryStorageKey(notebookId));
    if (!rawValue) {
      return [] as NotebookContentSnapshot[];
    }

    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [] as NotebookContentSnapshot[];
    }

    return parsed.filter(
      (item): item is NotebookContentSnapshot =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as NotebookContentSnapshot).id === "string" &&
        typeof (item as NotebookContentSnapshot).saved_at === "string" &&
        typeof (item as NotebookContentSnapshot).content === "string",
    );
  } catch {
    return [] as NotebookContentSnapshot[];
  }
}

function writeNotebookHistory(
  notebookId: string,
  snapshots: NotebookContentSnapshot[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getNotebookHistoryStorageKey(notebookId),
    JSON.stringify(snapshots.slice(0, 5)),
  );
}

function normalizeCellExecutionProfile(value: unknown): NotebookExecutionProfile | null {
  if (value === "python" || value === "pyspark" || value === "sql_trino") {
    return value;
  }

  return null;
}

function isActiveNotebookSessionStatus(status?: string | null) {
  return String(status || "").toLowerCase() === "active";
}

function isClosedNotebookSessionStatus(status?: string | null) {
  return String(status || "").toLowerCase() === "closed";
}

export default function NotebookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const notebookId = params.id as string;
  const [form] = Form.useForm();
  const [sparkJobForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();
  const [contentValue, setContentValue] = React.useState("");
  const [lastSavedContentValue, setLastSavedContentValue] = React.useState("");
  const [contentHistory, setContentHistory] = React.useState<NotebookContentSnapshot[]>([]);
  const [sessionProfile, setSessionProfile] = React.useState<NotebookExecutionProfile>("python");
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [codeToExecute, setCodeToExecute] = React.useState("print('Hello from DeltaMeta notebook')");
  const [executingCellIndex, setExecutingCellIndex] = React.useState<number | null>(null);
  const [isBatchExecutingCells, setIsBatchExecutingCells] = React.useState(false);
  const [batchExecutingCellIndex, setBatchExecutingCellIndex] = React.useState<number | null>(null);
  const [isSparkJobModalOpen, setIsSparkJobModalOpen] = React.useState(false);
  const [editingSparkJob, setEditingSparkJob] = React.useState<NotebookSparkJob | null>(null);
  const [selectedSparkJobId, setSelectedSparkJobId] = React.useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [editingScheduleId, setEditingScheduleId] = React.useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = React.useState<string | null>(null);
  const draftSaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedContentRef = React.useRef(false);
  const hasPromptedDraftRestoreRef = React.useRef(false);

  const { data: notebook, isLoading: isNotebookLoading, isError: isNotebookError, refetch: refetchNotebook } = useQuery({
    queryKey: ["notebook", notebookId],
    queryFn: () => notebookService.getNotebookById(notebookId),
    enabled: Boolean(notebookId),
  });

  const availableCodeSnippets = React.useMemo(() => {
    const activeProfile =
      notebook?.execution_mode === "mixed_profile"
        ? sessionProfile
        : notebook?.default_execution_profile || "python";

    return NOTEBOOK_CODE_SNIPPETS.filter(
      (snippet) => snippet.profile === "all" || snippet.profile === activeProfile,
    );
  }, [notebook?.default_execution_profile, notebook?.execution_mode, sessionProfile]);

  const { data: notebookContent, isLoading: isContentLoading, isError: isContentError, refetch: refetchContent } = useQuery({
    queryKey: ["notebook-content", notebookId],
    queryFn: () => notebookService.getNotebookContent(notebookId),
    enabled: Boolean(notebookId),
  });

  const { data: notebookRuns = [], isLoading: isRunsLoading, refetch: refetchRuns } = useQuery({
    queryKey: ["notebook-runs", notebookId],
    queryFn: () => notebookService.getNotebookRuns(notebookId, true),
    enabled: Boolean(notebookId),
  });

  const {
    data: notebookSessions = [],
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["notebook-sessions", notebookId],
    queryFn: () => notebookService.getNotebookSessions(notebookId),
    enabled: Boolean(notebookId),
  });

  const {
    data: notebookExecutions = [],
    isLoading: isExecutionsLoading,
    refetch: refetchExecutions,
  } = useQuery({
    queryKey: ["notebook-executions", notebookId, selectedSessionId],
    queryFn: () => notebookService.getNotebookExecutions(notebookId, selectedSessionId as string),
    enabled: Boolean(notebookId && selectedSessionId),
  });
  const { data: notificationFeed } = useNotificationFeed(10);

  const {
    data: sparkJobs = [],
    isLoading: isSparkJobsLoading,
    refetch: refetchSparkJobs,
  } = useQuery({
    queryKey: ["notebook-spark-jobs", notebookId],
    queryFn: () => notebookService.getNotebookSparkJobs(notebookId),
    enabled: Boolean(notebookId),
  });

  const {
    data: sparkJobRuns = [],
    isLoading: isSparkJobRunsLoading,
    refetch: refetchSparkJobRuns,
  } = useQuery({
    queryKey: ["notebook-spark-job-runs", selectedSparkJobId],
    queryFn: () => notebookService.getNotebookSparkJobRuns(selectedSparkJobId as string, true),
    enabled: Boolean(selectedSparkJobId),
  });

  const {
    data: schedules = [],
    isLoading: isSchedulesLoading,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ["notebook-schedules", selectedSparkJobId],
    queryFn: () => notebookService.getNotebookSchedules(selectedSparkJobId as string),
    enabled: Boolean(selectedSparkJobId),
  });

  const {
    data: scheduleRuns = [],
    isLoading: isScheduleRunsLoading,
    refetch: refetchScheduleRuns,
  } = useQuery({
    queryKey: ["notebook-schedule-runs", selectedScheduleId],
    queryFn: () => notebookService.getNotebookScheduleRuns(selectedScheduleId as string, true),
    enabled: Boolean(selectedScheduleId),
  });

  React.useEffect(() => {
    if (!notebook) {
      return;
    }

    form.setFieldsValue({
      name: notebook.name,
      description: notebook.description,
      execution_mode: notebook.execution_mode || "single_profile",
      default_execution_profile: notebook.default_execution_profile || "python",
    });
  }, [form, notebook]);

  React.useEffect(() => {
    if (notebookId) {
      setContentHistory(readNotebookHistory(notebookId));
    }
  }, [notebookId]);

  React.useEffect(() => {
    hasInitializedContentRef.current = false;
    hasPromptedDraftRestoreRef.current = false;
  }, [notebookId]);

  React.useEffect(() => {
    if (!notebookId || !notebookContent || hasInitializedContentRef.current) {
      return;
    }

    const normalized = safeStringifyContent(notebookContent);
    setContentValue(normalized);
    setLastSavedContentValue(normalized);
    hasInitializedContentRef.current = true;
  }, [notebookContent, notebookId]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !notebookId || !notebookContent) {
      return;
    }

    if (hasPromptedDraftRestoreRef.current) {
      return;
    }

    const draftStorageKey = getNotebookDraftStorageKey(notebookId);
    const draftValue = window.localStorage.getItem(draftStorageKey);
    const savedValue = safeStringifyContent(notebookContent);

    if (!draftValue || draftValue === savedValue) {
      hasPromptedDraftRestoreRef.current = true;
      if (draftValue === savedValue) {
        window.localStorage.removeItem(draftStorageKey);
      }
      return;
    }

    hasPromptedDraftRestoreRef.current = true;

    Modal.confirm({
      title: "Restore local notebook draft?",
      content:
        "We found a newer local notebook draft from an earlier session. You can restore it or keep the saved server version.",
      okText: "Restore Draft",
      cancelText: "Keep Saved Version",
      centered: true,
      onOk: () => {
        setContentValue(draftValue);
      },
      onCancel: () => {
        window.localStorage.removeItem(draftStorageKey);
      },
    });
  }, [notebookContent, notebookId]);

  React.useEffect(() => {
    if (!notebook) {
      return;
    }

    setSessionProfile(
      (notebook.default_execution_profile || "python") as NotebookExecutionProfile,
    );
  }, [notebook]);

  React.useEffect(() => {
    if (!notebookSessions.length) {
      setSelectedSessionId(null);
      return;
    }

    if (
      !selectedSessionId ||
      !notebookSessions.some((session) => session.id === selectedSessionId)
    ) {
      setSelectedSessionId(notebookSessions[0].id);
    }
  }, [notebookSessions, selectedSessionId]);

  React.useEffect(() => {
    if (!sparkJobs.length) {
      setSelectedSparkJobId(null);
      return;
    }

    if (!selectedSparkJobId || !sparkJobs.some((job) => job.id === selectedSparkJobId)) {
      setSelectedSparkJobId(sparkJobs[0].id);
    }
  }, [selectedSparkJobId, sparkJobs]);

  React.useEffect(() => {
    if (!schedules.length) {
      setSelectedScheduleId(null);
      return;
    }

    if (!selectedScheduleId || !schedules.some((schedule) => schedule.id === selectedScheduleId)) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  const attachExecutionToCell = React.useCallback(
    (cellIndex: number, execution: NotebookCellExecution) => {
      setContentValue((previous) => {
        try {
          const parsed = JSON.parse(previous) as NotebookContent;
          const currentCells = Array.isArray(parsed.cells) ? [...parsed.cells] : [];
          const currentCell = currentCells[cellIndex];

          if (!currentCell || typeof currentCell !== "object") {
            return previous;
          }

          currentCells[cellIndex] = {
            ...(currentCell as Record<string, unknown>),
            execution_count: execution.execution_count ?? null,
            outputs: buildCellOutputsFromExecution(execution),
          };

          return JSON.stringify(
            {
              ...parsed,
              cells: currentCells,
            },
            null,
            2,
          );
        } catch {
          return previous;
        }
      });
    },
    [],
  );

  const getCellSourceValue = React.useCallback((source: unknown) => {
    if (Array.isArray(source)) {
      return source.join("");
    }

    return typeof source === "string" ? source : "";
  }, []);

  const getCellExecutionProfile = React.useCallback(
    (cell: unknown) => {
      const notebookDefaultProfile = notebook?.default_execution_profile || "python";

      if (
        notebook?.execution_mode === "mixed_profile" &&
        cell &&
        typeof cell === "object" &&
        "metadata" in (cell as Record<string, unknown>)
      ) {
        const metadata = (cell as { metadata?: Record<string, unknown> }).metadata;
        const profile = normalizeCellExecutionProfile(metadata?.execution_profile);
        return profile || notebookDefaultProfile;
      }

      return notebookDefaultProfile;
    },
    [notebook?.default_execution_profile, notebook?.execution_mode],
  );

  const resolveExecutionSessionId = React.useCallback(
    async (profile: NotebookExecutionProfile) => {
      if (notebook?.execution_mode !== "mixed_profile") {
        if (!selectedSessionId) {
          throw new Error("Please create or select an active session first.");
        }

        return selectedSessionId;
      }

      const selectedSession = notebookSessions.find(
        (session) => session.id === selectedSessionId,
      );
      if (
        selectedSession?.id &&
        selectedSession.execution_profile === profile &&
        selectedSession.status !== "closed"
      ) {
        return selectedSession.id;
      }

      const matchedSession = notebookSessions.find(
        (session) =>
          session.execution_profile === profile &&
          session.status !== "closed",
      );

      if (matchedSession?.id) {
        setSelectedSessionId(matchedSession.id);
        return matchedSession.id;
      }

      const createdSession = await notebookService.createNotebookSession(notebookId, {
        execution_profile: profile,
        session_metadata: {},
      });

      await refetchSessions();
      setSelectedSessionId(createdSession.id);
      message.success(
        `Created a ${profile.replace("sql_trino", "sql")} session for this cell.`,
      );

      return createdSession.id;
    },
    [
      notebook?.execution_mode,
      notebookId,
      notebookSessions,
      refetchSessions,
      selectedSessionId,
    ],
  );

  const getExecutableCodeCells = React.useCallback(
    (startIndex = 0) => {
      try {
        const parsed = JSON.parse(contentValue) as NotebookContent;
        const parsedCells = Array.isArray(parsed.cells) ? parsed.cells : [];

        return parsedCells
          .map((cell, index) => ({ cell, index }))
          .filter(
            ({ cell, index }) =>
              index >= startIndex &&
              Boolean(cell) &&
              typeof cell === "object" &&
              (cell as { cell_type?: string }).cell_type !== "markdown",
          )
          .map(({ cell, index }) => ({
            index,
            code: getCellSourceValue((cell as { source?: unknown }).source),
            cellType:
              typeof (cell as { cell_type?: string }).cell_type === "string"
                ? (cell as { cell_type?: string }).cell_type || "code"
                : "code",
            executionProfile: getCellExecutionProfile(cell),
          }))
          .filter((cell) => cell.code.trim().length > 0);
      } catch {
        return [];
      }
    },
    [contentValue, getCellExecutionProfile, getCellSourceValue],
  );

  const getMutationErrorMessage = React.useCallback(
    (error: unknown, fallbackMessage: string) => {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
      ) {
        return (error as { message?: string }).message || fallbackMessage;
      }

      return fallbackMessage;
    },
    [],
  );

  const executeNotebookCellRequest = React.useCallback(
    async (payload: {
      code: string;
      cellType?: string;
      cellIndex?: number;
      executionProfile?: NotebookExecutionProfile;
    }) => {
      const resolvedProfile =
        payload.executionProfile ||
        notebook?.default_execution_profile ||
        "python";
      const sessionId = await resolveExecutionSessionId(resolvedProfile);

      const response = await notebookService.executeNotebookCell(notebookId, sessionId, {
        code: payload.code,
        cell_type: payload.cellType || "code",
      });

      if (typeof payload.cellIndex === "number") {
        attachExecutionToCell(payload.cellIndex, response);
      }

      return response;
    },
    [
      attachExecutionToCell,
      notebook?.default_execution_profile,
      notebookId,
      resolveExecutionSessionId,
    ],
  );

  const runNotebookCellsSequentially = React.useCallback(
    async (startIndex = 0) => {
      if (
        notebook?.execution_mode !== "mixed_profile" &&
        !selectedSessionId
      ) {
        message.warning("Create or select a notebook session before running notebook cells.");
        return;
      }

      const executableCells = getExecutableCodeCells(startIndex);
      if (!executableCells.length) {
        message.info(
          startIndex > 0
            ? "There are no runnable code cells from this point onward."
            : "There are no runnable code cells in this notebook yet.",
        );
        return;
      }

      setIsBatchExecutingCells(true);
      let executedCount = 0;

      try {
        for (const cell of executableCells) {
          setExecutingCellIndex(cell.index);
          setBatchExecutingCellIndex(cell.index);
          await executeNotebookCellRequest({
            cellIndex: cell.index,
            code: cell.code,
            cellType: cell.cellType,
            executionProfile: cell.executionProfile,
          });
          executedCount += 1;
        }

        await refetchExecutions();
        await refetchSessions();

        message.success(
          executedCount === 1
            ? "1 code cell executed successfully."
            : `${executedCount} code cells executed successfully.`,
        );
      } catch (error) {
        message.error(
          getMutationErrorMessage(error, "Failed to execute notebook cells."),
        );
      } finally {
        setExecutingCellIndex(null);
        setBatchExecutingCellIndex(null);
        setIsBatchExecutingCells(false);
      }
    },
    [
      executeNotebookCellRequest,
      getExecutableCodeCells,
      getMutationErrorMessage,
      refetchExecutions,
      refetchSessions,
      notebook?.execution_mode,
      selectedSessionId,
    ],
  );

  const updateMetadataMutation = useMutation({
    mutationFn: (values: {
      name: string;
      description?: string;
      execution_mode: NotebookExecutionMode;
      default_execution_profile: NotebookExecutionProfile;
    }) =>
      notebookService.updateNotebook(notebookId, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        execution_mode: values.execution_mode,
        default_execution_profile: values.default_execution_profile,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notebook", notebookId] });
      await queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      message.success("Notebook metadata updated successfully.");
    },
    onError: (error: unknown) => {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
          ? (error as { message?: string }).message
          : "Failed to update notebook metadata.";
      message.error(errorMessage);
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async (nextContentValue?: string) => {
      const parsed = JSON.parse(nextContentValue ?? contentValue) as NotebookContent;
      return notebookService.updateNotebookContent(notebookId, parsed);
    },
    onSuccess: async (_, nextContentValue) => {
      await queryClient.invalidateQueries({ queryKey: ["notebook-content", notebookId] });
      const savedValue = nextContentValue ?? contentValue;
      setLastSavedContentValue(savedValue);
      if (notebookId) {
        const nextSnapshot: NotebookContentSnapshot = {
          id: `${Date.now()}`,
          saved_at: new Date().toISOString(),
          content: savedValue,
        };
        const nextHistory = [nextSnapshot, ...readNotebookHistory(notebookId)].filter(
          (snapshot, index, snapshots) =>
            snapshots.findIndex((item) => item.content === snapshot.content) === index,
        );
        writeNotebookHistory(notebookId, nextHistory);
        setContentHistory(nextHistory.slice(0, 5));
      }
      message.success("Notebook content saved successfully.");
    },
    onError: () => {
      message.error("Failed to save notebook content. Please verify the JSON structure.");
    },
  });

  const runMutation = useMutation({
    mutationFn: () => notebookService.runNotebook(notebookId),
    onSuccess: async () => {
      await refetchRuns();
      message.success("Notebook run triggered successfully.");
    },
    onError: () => {
      message.error("Failed to trigger notebook run.");
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: () =>
      notebookService.createNotebookSession(notebookId, {
        execution_profile:
          notebook?.execution_mode === "mixed_profile"
            ? sessionProfile
            : notebook?.default_execution_profile || "python",
        session_metadata: {},
      }),
    onSuccess: async (response) => {
      await refetchSessions();
      setSelectedSessionId(response.id);
      message.success("Notebook session created successfully.");
    },
    onError: (error: unknown) => {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
          ? (error as { message?: string }).message
          : "Failed to create notebook session.";
      message.error(errorMessage);
    },
  });

  const restartSessionMutation = useMutation({
    mutationFn: async (payload: { sessionId: string; status?: string | null }) => {
      if (!isClosedNotebookSessionStatus(payload.status)) {
        throw new Error("Restart is only available for closed sessions.");
      }

      return notebookService.restartNotebookSession(notebookId, payload.sessionId);
    },
    onSuccess: async () => {
      await refetchSessions();
      await refetchExecutions();
      message.success("Notebook session restarted successfully.");
    },
    onError: (error: unknown) => {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
          ? (error as { message?: string }).message
          : "Failed to restart notebook session.";
      message.error(errorMessage);
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (payload: { sessionId: string; status?: string | null }) => {
      if (!isActiveNotebookSessionStatus(payload.status)) {
        throw new Error("Close is only available for active sessions.");
      }

      return notebookService.closeNotebookSession(notebookId, payload.sessionId);
    },
    onSuccess: async () => {
      await refetchSessions();
      await refetchExecutions();
      message.success("Notebook session closed successfully.");
    },
    onError: (error: unknown) => {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
          ? (error as { message?: string }).message
          : "Failed to close notebook session.";
      message.error(errorMessage);
    },
  });

  const executeCellMutation = useMutation({
    mutationFn: async (payload: {
      code: string;
      cellType?: string;
      cellIndex?: number;
      executionProfile?: NotebookExecutionProfile;
    }) => executeNotebookCellRequest(payload),
    onSuccess: async () => {
      await refetchExecutions();
      await refetchSessions();
      message.success("Cell executed successfully.");
    },
    onError: (error: unknown) => {
      message.error(getMutationErrorMessage(error, "Failed to execute cell."));
    },
    onSettled: () => {
      setExecutingCellIndex(null);
    },
  });

  const saveSparkJobMutation = useMutation({
    mutationFn: async (values: {
      name: string;
      description?: string;
      app_resource: string;
      main_class?: string;
      default_app_args?: string;
      default_spark_properties?: string;
    }) => {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        app_resource: values.app_resource.trim(),
        main_class: values.main_class?.trim() || "",
        default_app_args: parseArgsList(values.default_app_args || ""),
        default_spark_properties: parseJsonRecord(
          values.default_spark_properties || "{}",
          "Spark properties must be valid JSON object.",
        ),
      };

      if (editingSparkJob) {
        return notebookService.updateNotebookSparkJob(editingSparkJob.id, payload);
      }

      return notebookService.createNotebookSparkJob(notebookId, payload);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["notebook-spark-jobs", notebookId] });
      if (response?.id) {
        setSelectedSparkJobId(response.id);
      }
      setIsSparkJobModalOpen(false);
      setEditingSparkJob(null);
      sparkJobForm.resetFields();
      message.success(
        editingSparkJob ? "Spark job updated successfully." : "Spark job created successfully.",
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save Spark job.";
      message.error(errorMessage);
    },
  });

  const runSparkJobMutation = useMutation({
    mutationFn: (sparkJobId: string) =>
      notebookService.triggerNotebookSparkJobRun(sparkJobId, {}),
    onSuccess: async (_, sparkJobId) => {
      setSelectedSparkJobId(sparkJobId);
      await queryClient.invalidateQueries({ queryKey: ["notebook-spark-job-runs"] });
      message.success("Spark job run triggered successfully.");
    },
    onError: () => {
      message.error("Failed to trigger Spark job run.");
    },
  });

  const pauseSparkJobMutation = useMutation({
    mutationFn: (sparkJobId: string) => notebookService.pauseNotebookSparkJob(sparkJobId),
    onSuccess: async () => {
      await refetchSparkJobs();
      message.success("Spark job paused successfully.");
    },
    onError: () => {
      message.error("Failed to pause Spark job.");
    },
  });

  const resumeSparkJobMutation = useMutation({
    mutationFn: (sparkJobId: string) => notebookService.resumeNotebookSparkJob(sparkJobId),
    onSuccess: async () => {
      await refetchSparkJobs();
      message.success("Spark job resumed successfully.");
    },
    onError: () => {
      message.error("Failed to resume Spark job.");
    },
  });

  const deleteSparkJobMutation = useMutation({
    mutationFn: (sparkJobId: string) => notebookService.deleteNotebookSparkJob(sparkJobId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notebook-spark-jobs", notebookId] });
      await queryClient.invalidateQueries({
        queryKey: ["notebook-spark-job-runs"],
      });
      message.success("Spark job deleted successfully.");
    },
    onError: (error: unknown) => {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
          ? (error as { message?: string }).message
          : "Failed to delete Spark job.";
      message.error(errorMessage);
    },
  });

  const stopSparkJobRunMutation = useMutation({
    mutationFn: (runId: string) => notebookService.stopNotebookSparkJobRun(runId),
    onSuccess: async () => {
      await refetchSparkJobRuns();
      message.success("Spark job run stop requested.");
    },
    onError: () => {
      message.error("Failed to stop Spark job run.");
    },
  });

  const rerunSparkJobRunMutation = useMutation({
    mutationFn: (runId: string) => notebookService.rerunNotebookSparkJobRun(runId),
    onSuccess: async () => {
      await refetchSparkJobRuns();
      message.success("Spark job rerun triggered successfully.");
    },
    onError: () => {
      message.error("Failed to rerun Spark job.");
    },
  });

  const saveScheduleMutation = useMutation({
    mutationFn: async (values: {
      name: string;
      description?: string;
      schedule_type: string;
      cron_expr?: string;
      airflow_dag_id?: string;
      default_conf?: string;
    }) => {
      if (!selectedSparkJobId) {
        throw new Error("Please select a Spark job first.");
      }

      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        schedule_type: values.schedule_type,
        cron_expr: values.cron_expr?.trim() || undefined,
        airflow_dag_id: values.airflow_dag_id?.trim() || undefined,
        default_conf: parseJsonRecord(
          values.default_conf || "{}",
          "Schedule default config must be a valid JSON object.",
        ),
      };

      if (editingScheduleId) {
        return notebookService.updateNotebookSchedule(editingScheduleId, payload);
      }

      return notebookService.createNotebookSchedule(selectedSparkJobId, payload);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["notebook-schedules", selectedSparkJobId] });
      if (response?.id) {
        setSelectedScheduleId(response.id);
      }
      setIsScheduleModalOpen(false);
      setEditingScheduleId(null);
      scheduleForm.resetFields();
      message.success(
        editingScheduleId ? "Schedule updated successfully." : "Schedule created successfully.",
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save schedule.";
      message.error(errorMessage);
    },
  });

  const pauseScheduleMutation = useMutation({
    mutationFn: (scheduleId: string) => notebookService.pauseNotebookSchedule(scheduleId),
    onSuccess: async () => {
      await refetchSchedules();
      message.success("Schedule paused successfully.");
    },
    onError: () => {
      message.error("Failed to pause schedule.");
    },
  });

  const resumeScheduleMutation = useMutation({
    mutationFn: (scheduleId: string) => notebookService.resumeNotebookSchedule(scheduleId),
    onSuccess: async () => {
      await refetchSchedules();
      message.success("Schedule resumed successfully.");
    },
    onError: () => {
      message.error("Failed to resume schedule.");
    },
  });

  const runScheduleMutation = useMutation({
    mutationFn: (scheduleId: string) => notebookService.runNotebookSchedule(scheduleId),
    onSuccess: async (_, scheduleId) => {
      setSelectedScheduleId(scheduleId);
      await queryClient.invalidateQueries({ queryKey: ["notebook-schedule-runs"] });
      message.success("Schedule run triggered successfully.");
    },
    onError: () => {
      message.error("Failed to trigger schedule run.");
    },
  });

  const latestExecution = notebookExecutions[0] || null;
  const selectedSparkJob =
    sparkJobs.find((job) => job.id === selectedSparkJobId) || sparkJobs[0] || null;
  const selectedSchedule =
    schedules.find((schedule) => schedule.id === selectedScheduleId) || schedules[0] || null;
  const isMixedProfileNotebook = notebook?.execution_mode === "mixed_profile";
  const notebookActivity = React.useMemo(() => {
    const notebooksFeed = notificationFeed?.notebooks;
    if (!notebooksFeed) {
      return [];
    }

    return [
      ...(notebooksFeed.notebook_runs || []),
      ...(notebooksFeed.spark_job_runs || []),
      ...(notebooksFeed.schedule_runs || []),
    ]
      .filter((item) => item.notebook_id === notebookId)
      .sort((first, second) =>
        dayjs(second.updated_at || second.created_at).valueOf() -
        dayjs(first.updated_at || first.created_at).valueOf(),
      )
      .slice(0, 8);
  }, [notificationFeed, notebookId]);
  const isContentDirty = React.useMemo(
    () => contentValue !== lastSavedContentValue,
    [contentValue, lastSavedContentValue],
  );
  const isContentJsonValid = React.useMemo(() => {
    try {
      JSON.parse(contentValue);
      return true;
    } catch {
      return false;
    }
  }, [contentValue]);

  const navigateWithContentGuard = React.useCallback(
    (nextPath: string) => {
      if (!isContentDirty) {
        router.push(nextPath);
        return;
      }

      if (updateContentMutation.isPending) {
        message.info("Notebook content is still saving. Please wait a moment.");
        return;
      }

      if (!isContentJsonValid) {
        Modal.confirm({
          title: "Leave with invalid notebook JSON?",
          content:
            "Your notebook content has unsaved changes and the JSON is invalid, so it cannot be saved right now.",
          okText: "Leave Anyway",
          okType: "danger",
          cancelText: "Stay Here",
          centered: true,
          onOk: () => {
            router.push(nextPath);
          },
        });
        return;
      }

      Modal.confirm({
        title: "Save notebook before leaving?",
        content:
          "You have unsaved notebook content changes. We can save them now before navigating away.",
        okText: "Save and Leave",
        cancelText: "Stay Here",
        centered: true,
        onOk: async () => {
          await updateContentMutation.mutateAsync(contentValue);
          router.push(nextPath);
        },
      });
    },
    [
      contentValue,
      isContentDirty,
      isContentJsonValid,
      router,
      updateContentMutation,
    ],
  );

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isContentDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isContentDirty]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !notebookId) {
      return;
    }

    const draftStorageKey = getNotebookDraftStorageKey(notebookId);

    if (isContentDirty) {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }

      draftSaveTimeoutRef.current = setTimeout(() => {
        window.localStorage.setItem(draftStorageKey, contentValue);
      }, 800);

      return;
    }

    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = null;
    }

    window.localStorage.removeItem(draftStorageKey);

    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
        draftSaveTimeoutRef.current = null;
      }
    };
  }, [contentValue, isContentDirty, notebookId]);

  const runColumns: ColumnsType<NotebookRun> = [
    {
      title: "Run ID",
      dataIndex: "id",
      key: "id",
      width: "28%",
      render: (value: string) => <span className="font-mono text-xs text-slate-600">{value}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "16%",
      render: (value?: string) => {
        const normalizedStatus = String(value || "").toLowerCase();
        const className =
          normalizedStatus === "success" || normalizedStatus === "completed"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : normalizedStatus === "failed" || normalizedStatus === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-blue-200 bg-blue-50 text-blue-700";

        return <Tag className={`m-0 rounded-full text-[11px] ${className}`}>{value || "pending"}</Tag>;
      },
    },
    {
      title: "Spark Submission",
      dataIndex: "spark_submission_id",
      key: "spark_submission_id",
      width: "20%",
      render: (value?: string | null) => (
        <span className="font-mono text-xs text-slate-500">{value || "-"}</span>
      ),
    },
    {
      title: "Started",
      dataIndex: "started_at",
      key: "started_at",
      width: "18%",
      render: (value?: string | null) => (
        <span className="text-sm text-slate-500">
          {value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-"}
        </span>
      ),
    },
    {
      title: "Completed",
      dataIndex: "completed_at",
      key: "completed_at",
      width: "18%",
      render: (value?: string | null) => (
        <span className="text-sm text-slate-500">
          {value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-"}
        </span>
      ),
    },
  ];

  const sessionColumns: ColumnsType<NotebookSession> = [
    {
      title: "Session ID",
      dataIndex: "id",
      key: "id",
      width: 240,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value: string) => (
        <Tooltip title={value}>
          <span className="block truncate font-mono text-xs text-slate-600">{value}</span>
        </Tooltip>
      ),
    },
    {
      title: "Profile",
      dataIndex: "execution_profile",
      key: "execution_profile",
      width: 140,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => (
        <Tag className="m-0 rounded-full border-blue-200 bg-blue-50 text-[11px] text-blue-700">
          {value || "python"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => (
        <Tag className="m-0 rounded-full border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">
          {value || "active"}
        </Tag>
      ),
    },
    {
      title: "Kernel",
      dataIndex: "kernel_state",
      key: "kernel_state",
      width: 150,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">{value || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Last Activity",
      dataIndex: "last_activity_at",
      key: "last_activity_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 240,
      align: "right",
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (_, record) => {
        const isActive = isActiveNotebookSessionStatus(record.status);
        const isClosed = isClosedNotebookSessionStatus(record.status);

        return (
          <div className="flex flex-nowrap items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
            <Tooltip title={!isClosed ? "Restart is only available for closed sessions" : ""}>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() =>
                    restartSessionMutation.mutate({
                      sessionId: record.id,
                      status: record.status,
                    })
                  }
                  disabled={!isClosed}
                >
                  <RotateCcw size={13} className="mr-1" />
                  Restart
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={!isActive ? "Close is only available for active sessions" : ""}>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    Modal.confirm({
                      title: "Close notebook session?",
                      content: "This will stop the current interactive session.",
                      okText: "Close Session",
                      okType: "danger",
                      centered: true,
                      onOk: async () => {
                        await closeSessionMutation.mutateAsync({
                          sessionId: record.id,
                          status: record.status,
                        });
                      },
                    });
                  }}
                  disabled={!isActive}
                >
                  <Square size={13} className="mr-1" />
                  Close
                </Button>
              </span>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const executionColumns: ColumnsType<NotebookCellExecution> = [
    {
      title: "Execution",
      dataIndex: "id",
      key: "id",
      width: 220,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value: string) => (
        <Tooltip title={value}>
          <span className="block truncate font-mono text-xs text-slate-600">{value}</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => {
        const normalizedStatus = String(value || "").toLowerCase();
        const className =
          normalizedStatus === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : normalizedStatus === "failed" || normalizedStatus === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-blue-200 bg-blue-50 text-blue-700";

        return <Tag className={`m-0 rounded-full text-[11px] ${className}`}>{value || "pending"}</Tag>;
      },
    },
    {
      title: "Count",
      dataIndex: "execution_count",
      key: "execution_count",
      width: 100,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: number | null) => <span className="text-sm text-slate-500">{value ?? "-"}</span>,
    },
    {
      title: "Started",
      dataIndex: "started_at",
      key: "started_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Completed",
      dataIndex: "completed_at",
      key: "completed_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
  ];

  const openCreateSparkJobModal = React.useCallback(() => {
    setEditingSparkJob(null);
    sparkJobForm.setFieldsValue({
      name: notebook?.name ? `${notebook.name.replace(/\.ipynb$/i, "")}_job` : "",
      description: notebook?.description || "",
      app_resource: "local:///opt/spark/jobs/notebook_runner.py",
      main_class: "com.deltameta.jobs.NotebookRunner",
      default_app_args: "",
      default_spark_properties: JSON.stringify(
        {
          "spark.app.name": notebook?.name?.replace(/\.ipynb$/i, "") || "notebook_job",
          "spark.executor.memory": "2g",
        },
        null,
        2,
      ),
    });
    setIsSparkJobModalOpen(true);
  }, [notebook, sparkJobForm]);

  const openEditSparkJobModal = React.useCallback(
    (job: NotebookSparkJob) => {
      setEditingSparkJob(job);
      sparkJobForm.setFieldsValue({
        name: job.name,
        description: job.description || "",
        app_resource: job.app_resource || "",
        main_class: job.main_class || "",
        default_app_args: (job.default_app_args || []).join("\n"),
        default_spark_properties: safeStringifyJson(job.default_spark_properties || {}),
      });
      setIsSparkJobModalOpen(true);
    },
    [sparkJobForm],
  );

  const openCreateScheduleModal = React.useCallback(() => {
    if (!selectedSparkJob) {
      message.info("Select a Spark job first to create a schedule.");
      return;
    }

    setEditingScheduleId(null);
    scheduleForm.setFieldsValue({
      name: `${selectedSparkJob.name}_schedule`,
      description: selectedSparkJob.description || "",
      schedule_type: "cron",
      cron_expr: "0 6 * * *",
      airflow_dag_id: "notebook_spark_runner",
      default_conf: JSON.stringify(
        {
          owner: "analytics",
        },
        null,
        2,
      ),
    });
    setIsScheduleModalOpen(true);
  }, [scheduleForm, selectedSparkJob]);

  const openEditScheduleModal = React.useCallback(
    (schedule: NotebookSchedule) => {
      setEditingScheduleId(schedule.id);
      scheduleForm.setFieldsValue({
        name: schedule.name,
        description: schedule.description || "",
        schedule_type: schedule.schedule_type || "cron",
        cron_expr: schedule.cron_expr || "",
        airflow_dag_id: schedule.airflow_dag_id || "notebook_spark_runner",
        default_conf: safeStringifyJson(schedule.default_conf || {}),
      });
      setIsScheduleModalOpen(true);
    },
    [scheduleForm],
  );

  const sparkJobColumns: ColumnsType<NotebookSparkJob> = [
    {
      title: "Spark Job",
      dataIndex: "name",
      key: "name",
      width: 240,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value: string, record) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-slate-900">{value}</div>
          <div className="truncate text-xs text-slate-500">{record.description || "No description"}</div>
        </div>
      ),
    },
    {
      title: "App Resource",
      dataIndex: "app_resource",
      key: "app_resource",
      width: 280,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate font-mono text-xs text-slate-600">{value || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Default Args",
      dataIndex: "default_app_args",
      key: "default_app_args",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string[] | null) => (
        <Tooltip title={value?.length ? value.join(", ") : "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value?.length ? value.join(", ") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "State",
      key: "state",
      width: 130,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (_, record) => {
        const isPaused = String(record.status || "").toLowerCase() === "paused" || Boolean(record.paused_at);
        const isActive = record.is_active !== false;
        const className = !isActive
          ? "border-red-200 bg-red-50 text-red-700"
          : isPaused
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700";

        return (
          <Tag className={`m-0 rounded-full text-[11px] ${className}`}>
            {!isActive ? "inactive" : isPaused ? "paused" : "active"}
          </Tag>
        );
      },
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 360,
      align: "right",
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (_, record) => {
        const isPaused =
          String(record.status || "").toLowerCase() === "paused" || Boolean(record.paused_at);

        return (
          <div className="flex flex-nowrap items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => openEditSparkJobModal(record)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => runSparkJobMutation.mutate(record.id)}
              disabled={runSparkJobMutation.isPending || !record.is_active}
            >
              <Play size={13} className="mr-1" />
              Run
            </Button>
            {isPaused ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => resumeSparkJobMutation.mutate(record.id)}
                disabled={resumeSparkJobMutation.isPending || !record.is_active}
              >
                Resume
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => pauseSparkJobMutation.mutate(record.id)}
                disabled={pauseSparkJobMutation.isPending || !record.is_active}
              >
                <PauseCircle size={13} className="mr-1" />
                Pause
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                Modal.confirm({
                  title: "Delete Spark job?",
                  content:
                    "This deactivates the Spark job and linked schedules. Active runs may block deletion.",
                  okText: "Delete Spark Job",
                  okType: "danger",
                  centered: true,
                  onOk: async () => {
                    await deleteSparkJobMutation.mutateAsync(record.id);
                  },
                });
              }}
            >
              <Trash2 size={13} className="mr-1" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const sparkJobRunColumns: ColumnsType<NotebookSparkJobRun> = [
    {
      title: "Run ID",
      dataIndex: "id",
      key: "id",
      width: 220,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value: string) => (
        <Tooltip title={value}>
          <span className="block truncate font-mono text-xs text-slate-600">{value}</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => {
        const normalizedStatus = String(value || "").toLowerCase();
        const className =
          normalizedStatus === "success" || normalizedStatus === "completed"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : normalizedStatus === "failed" || normalizedStatus === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : normalizedStatus === "running"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-amber-200 bg-amber-50 text-amber-700";

        return <Tag className={`m-0 rounded-full text-[11px] ${className}`}>{value || "pending"}</Tag>;
      },
    },
    {
      title: "Spark Submission",
      dataIndex: "spark_submission_id",
      key: "spark_submission_id",
      width: 220,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate font-mono text-xs text-slate-500">{value || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Started",
      dataIndex: "started_at",
      key: "started_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Completed",
      dataIndex: "completed_at",
      key: "completed_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      align: "right",
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (_, record) => {
        const isRunning = String(record.status || "").toLowerCase() === "running";

        return (
          <div
            className="flex items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            {isRunning ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => stopSparkJobRunMutation.mutate(record.id)}
                disabled={stopSparkJobRunMutation.isPending}
              >
                Stop
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => rerunSparkJobRunMutation.mutate(record.id)}
                disabled={rerunSparkJobRunMutation.isPending}
              >
                Rerun
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const scheduleColumns: ColumnsType<NotebookSchedule> = [
    {
      title: "Schedule",
      dataIndex: "name",
      key: "name",
      width: 240,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value: string, record) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-slate-900">{value}</div>
          <div className="truncate text-xs text-slate-500">{record.description || "No description"}</div>
        </div>
      ),
    },
    {
      title: "Cron",
      dataIndex: "cron_expr",
      key: "cron_expr",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate font-mono text-xs text-slate-600">{value || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "DAG",
      dataIndex: "airflow_dag_id",
      key: "airflow_dag_id",
      width: 220,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate font-mono text-xs text-slate-500">{value || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "State",
      key: "state",
      width: 130,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (_, record) => {
        const isPaused =
          String(record.status || "").toLowerCase() === "paused" || Boolean(record.paused_at);
        const isActive = record.is_active !== false;
        const className = !isActive
          ? "border-red-200 bg-red-50 text-red-700"
          : isPaused
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700";

        return (
          <Tag className={`m-0 rounded-full text-[11px] ${className}`}>
            {!isActive ? "inactive" : isPaused ? "paused" : "active"}
          </Tag>
        );
      },
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      align: "right",
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (_, record) => {
        const isPaused =
          String(record.status || "").toLowerCase() === "paused" || Boolean(record.paused_at);

        return (
          <div className="flex flex-nowrap items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => openEditScheduleModal(record)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => runScheduleMutation.mutate(record.id)}
              disabled={runScheduleMutation.isPending || !record.is_active}
            >
              Run Now
            </Button>
            {isPaused ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => resumeScheduleMutation.mutate(record.id)}
                disabled={resumeScheduleMutation.isPending || !record.is_active}
              >
                Resume
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => pauseScheduleMutation.mutate(record.id)}
                disabled={pauseScheduleMutation.isPending || !record.is_active}
              >
                Pause
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const scheduleRunColumns: ColumnsType<NotebookScheduleRun> = [
    {
      title: "Run ID",
      dataIndex: "id",
      key: "id",
      width: 220,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value: string) => (
        <Tooltip title={value}>
          <span className="block truncate font-mono text-xs text-slate-600">{value}</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string) => {
        const normalizedStatus = String(value || "").toLowerCase();
        const className =
          normalizedStatus === "success" || normalizedStatus === "completed"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : normalizedStatus === "failed" || normalizedStatus === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : normalizedStatus === "running"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-amber-200 bg-amber-50 text-amber-700";

        return <Tag className={`m-0 rounded-full text-[11px] ${className}`}>{value || "pending"}</Tag>;
      },
    },
    {
      title: "Started",
      dataIndex: "started_at",
      key: "started_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Completed",
      dataIndex: "completed_at",
      key: "completed_at",
      width: 180,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">
            {value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Error",
      dataIndex: "error_message",
      key: "error_message",
      width: 240,
      onCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (value?: string | null) => (
        <Tooltip title={value || "-"}>
          <span className="block truncate text-sm text-slate-500">{value || "-"}</span>
        </Tooltip>
      ),
    },
  ];

  const notebookMetadataSection = (
    <section className="h-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <BookOpen size={18} className="text-blue-600" />
        Notebook Metadata
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={async (values) => {
          await updateMetadataMutation.mutateAsync(values);
        }}
      >
        <Form.Item
          name="name"
          label="Notebook Name"
          rules={[{ required: true, message: "Notebook name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="execution_mode"
          label="Execution Mode"
          rules={[{ required: true, message: "Execution mode is required" }]}
        >
          <Select
            options={[
              { label: "Single Profile", value: "single_profile" },
              { label: "Mixed Profile", value: "mixed_profile" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="default_execution_profile"
          label="Default Execution Profile"
          rules={[{ required: true, message: "Default profile is required" }]}
        >
          <Select
            options={[
              { label: "Python", value: "python" },
              { label: "PySpark", value: "pyspark" },
              { label: "SQL / Trino", value: "sql_trino" },
            ]}
          />
        </Form.Item>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
            <Sparkles size={15} className="text-blue-600" />
            Product Rule
          </div>
          <p>
            Mixed-profile notebooks stay interactive-only. Single-profile notebooks are the
            path for direct Spark runs, Spark jobs, and schedules.
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            className="h-9 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
            onClick={() => form.submit()}
            disabled={updateMetadataMutation.isPending}
          >
            <Save size={14} className="mr-2" />
            Save Metadata
          </Button>
        </div>
      </Form>
    </section>
  );

  const notebookWorkspaceSection = (
            <section className="flex h-full min-w-0 min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Tabs
                className="notebook-detail-tabs h-full min-h-0"
                items={[
                  {
                    key: "content",
                    label: "Content",
                    children: (
                      <div className="notebook-section">
                        {isContentError ? (
                          <Alert
                            type="error"
                            showIcon
                            title="Failed to load notebook content"
                            description="We couldn't load notebook JSON right now."
                          />
                        ) : (
                          <div className="space-y-4">
                            <NotebookCellEditor
                              notebookId={notebookId}
                              contentValue={contentValue}
                              onChange={setContentValue}
                              selectedSessionId={selectedSessionId}
                              executingCellIndex={executingCellIndex}
                              isBatchExecuting={isBatchExecutingCells}
                              batchExecutingCellIndex={batchExecutingCellIndex}
                              notebookExecutionMode={notebook?.execution_mode || "single_profile"}
                              notebookDefaultExecutionProfile={
                                notebook?.default_execution_profile || "python"
                              }
                              onExecuteCell={async (
                                cellIndex,
                                cellCode,
                                cellType,
                                executionProfile,
                              ) => {
                                setExecutingCellIndex(cellIndex);
                                await executeCellMutation.mutateAsync({
                                  cellIndex,
                                  code: cellCode,
                                  cellType,
                                  executionProfile,
                                });
                              }}
                              onRunAllCells={async () => {
                                await runNotebookCellsSequentially(0);
                              }}
                              onRunFromCell={async (cellIndex) => {
                                await runNotebookCellsSequentially(cellIndex);
                              }}
                            />

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    Local Version History
                                  </div>
                                  <div className="mt-1 text-xs text-slate-500">
                                    Recent locally saved notebook snapshots for quick rollback.
                                  </div>
                                </div>
                              </div>

                              {contentHistory.length ? (
                                <div className="space-y-2">
                                  {contentHistory.map((snapshot) => (
                                    <div
                                      key={snapshot.id}
                                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                                    >
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium text-slate-900">
                                          Saved {dayjs(snapshot.saved_at).format("MMM D, YYYY h:mm A")}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">
                                          Snapshot size: {snapshot.content.length} characters
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                                          onClick={() => {
                                            setContentValue(snapshot.content);
                                            message.success("Notebook content restored from local version history.");
                                          }}
                                        >
                                          Restore
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                  No local saved snapshots yet
                                </div>
                              )}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="json-header">
                                <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-base font-semibold text-slate-900">
                                    Notebook Content JSON
                                  </div>
                                  {!isContentJsonValid ? (
                                    <Tag className="m-0 rounded-full border-red-200 bg-red-50 text-[11px] text-red-700">
                                      Invalid JSON
                                    </Tag>
                                  ) : updateContentMutation.isPending ? (
                                    <Tag className="m-0 rounded-full border-blue-200 bg-blue-50 text-[11px] text-blue-700">
                                      Saving...
                                    </Tag>
                                  ) : isContentDirty ? (
                                    <Tag className="m-0 rounded-full border-amber-200 bg-amber-50 text-[11px] text-amber-700">
                                      Unsaved Changes
                                    </Tag>
                                  ) : (
                                    <Tag className="m-0 rounded-full border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">
                                      Saved
                                    </Tag>
                                  )}
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                  This is a phase-1 editor placeholder so we can edit notebook cells and save notebook content when you are ready.
                                </div>
                                </div>
                                <div className="json-actions">
                                <Select
                                  className="w-full max-w-[260px]"
                                  placeholder="Insert template cells"
                                  options={[
                                    {
                                      label: "Python Analysis Cells",
                                      value: "python-analysis",
                                    },
                                    {
                                      label: "PySpark Job Cells",
                                      value: "pyspark-job",
                                    },
                                    {
                                      label: "SQL Exploration Cells",
                                      value: "sql-trino",
                                    },
                                  ]}
                                  onChange={(value) => {
                                    const templateMap = {
                                      "python-analysis": {
                                        cells: [
                                          {
                                            cell_type: "markdown",
                                            metadata: {},
                                            source: ["# Analysis Notes\n", "Add context for this notebook section.\n"],
                                          },
                                          {
                                            cell_type: "code",
                                            execution_count: null,
                                            metadata: {},
                                            outputs: [],
                                            source: ["import pandas as pd\n\n# TODO: load dataframe here\n"],
                                          },
                                        ],
                                      },
                                      "pyspark-job": {
                                        cells: [
                                          {
                                            cell_type: "code",
                                            execution_count: null,
                                            metadata: {},
                                            outputs: [],
                                            source: ["from pyspark.sql import SparkSession\nspark = SparkSession.builder.getOrCreate()\n"],
                                          },
                                        ],
                                      },
                                      "sql-trino": {
                                        cells: [
                                          {
                                            cell_type: "code",
                                            execution_count: null,
                                            metadata: {},
                                            outputs: [],
                                            source: ["SELECT * FROM schema.table LIMIT 100;\n"],
                                          },
                                        ],
                                      },
                                    } as const;

                                    try {
                                      const parsed = JSON.parse(contentValue) as NotebookContent;
                                      const nextCells = templateMap[value as keyof typeof templateMap]?.cells || [];
                                      const nextContent = {
                                        ...parsed,
                                        cells: [...(parsed.cells || []), ...nextCells],
                                      };
                                      setContentValue(JSON.stringify(nextContent, null, 2));
                                      message.success("Template cells inserted into notebook content.");
                                    } catch {
                                      message.error("Notebook JSON is invalid. Fix it before inserting template cells.");
                                    }
                                  }}
                                />
                                <Button
                                  className="h-9 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                                  onClick={() => updateContentMutation.mutate(contentValue)}
                                  disabled={updateContentMutation.isPending || isContentLoading || !isContentJsonValid}
                                >
                                  <Save size={14} className="mr-2" />
                                  Save Content
                                </Button>
                                </div>
                              </div>
                              <div className="json-body mt-4">
                                <Input.TextArea
                                  value={contentValue}
                                  onChange={(event) => setContentValue(event.target.value)}
                                  autoSize={{ minRows: 18, maxRows: 28 }}
                                  className="font-mono text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "sessions",
                    label: "Sessions",
                    children: (
                      <div className="notebook-section space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="section-header">
                            <div className="min-w-0">
                              <div className="text-base font-semibold text-slate-900">
                                Interactive Sessions
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                Create a runtime session, execute a code cell, and inspect execution outputs.
                              </div>
                            </div>
                            <div className="section-actions items-end">
                            {notebook?.execution_mode === "mixed_profile" ? (
                              <div className="w-full max-w-[260px] self-end">
                                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Session Profile
                                </div>
                                <Select
                                  value={sessionProfile}
                                  onChange={(value) => setSessionProfile(value as NotebookExecutionProfile)}
                                  options={[
                                    { label: "Python", value: "python" },
                                    { label: "PySpark", value: "pyspark" },
                                    { label: "SQL / Trino", value: "sql_trino" },
                                  ]}
                                />
                              </div>
                            ) : (
                              <div className="self-end rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                                Default Profile: {notebook?.default_execution_profile || "python"}
                              </div>
                            )}
                            <Button
                              className="h-10 self-end border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                              onClick={() => createSessionMutation.mutate()}
                              disabled={createSessionMutation.isPending}
                            >
                              <TerminalSquare size={14} className="mr-2" />
                              Create Session
                            </Button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <div className="table-container">
                            <Table
                              rowKey="id"
                              dataSource={notebookSessions}
                              columns={sessionColumns}
                              tableLayout="fixed"
                              scroll={{ x: 1120 }}
                              loading={{
                                spinning: isSessionsLoading,
                                indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={20} />} />,
                              }}
                              pagination={{
                                pageSize: 8,
                                hideOnSinglePage: true,
                                className: "!mb-0 px-4 py-4",
                              }}
                              onRow={(record) => ({
                                onClick: () => setSelectedSessionId(record.id),
                                className: selectedSessionId === record.id ? "bg-blue-50/60 cursor-pointer" : "cursor-pointer",
                              })}
                              locale={{
                                emptyText: (
                                  <div className="py-10">
                                    <Empty
                                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                                      description="No notebook sessions yet"
                                    />
                                  </div>
                                ),
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="section-header">
                              <div>
                                <div className="text-base font-semibold text-slate-900">Execute Cell</div>
                                <div className="mt-1 text-sm text-slate-500">
                                  Run code in the selected notebook session.
                                </div>
                              </div>
                              <div className="section-actions execute-cell-actions items-end">
                                <Select
                                  className="w-full max-w-[260px] self-end"
                                  placeholder="Insert code snippet"
                                  options={availableCodeSnippets.map((snippet) => ({
                                    label: snippet.label,
                                    value: snippet.key,
                                  }))}
                                  onChange={(value) => {
                                    const snippet = availableCodeSnippets.find((item) => item.key === value);
                                    if (!snippet) {
                                      return;
                                    }

                                    setCodeToExecute((previous) =>
                                      previous.trim()
                                        ? `${previous.trim()}\n\n${snippet.code}`
                                        : snippet.code,
                                    );
                                  }}
                                />
                                <Button
                                  className="h-9 self-end border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                                  onClick={() =>
                                    executeCellMutation.mutate({
                                      code: codeToExecute,
                                      cellType: "code",
                                    })
                                  }
                                  disabled={!selectedSessionId || executeCellMutation.isPending}
                                >
                                  <Play size={14} className="mr-2" />
                                  Execute Cell
                                </Button>
                              </div>
                            </div>
                            <Input.TextArea
                              value={codeToExecute}
                              onChange={(event) => setCodeToExecute(event.target.value)}
                              autoSize={{ minRows: 10, maxRows: 16 }}
                              className="font-mono text-xs"
                              placeholder="Write Python, PySpark, or SQL/Trino code based on the session profile."
                            />

                            <div className="mt-6">
                              <div className="mb-3 text-sm font-semibold text-slate-900">Execution Timeline</div>
                              <div className="execution-table-container">
                                <Table
                                  rowKey="id"
                                  dataSource={notebookExecutions}
                                  columns={executionColumns}
                                  tableLayout="fixed"
                                  scroll={{ x: 1000 }}
                                  loading={{
                                    spinning: isExecutionsLoading,
                                    indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={18} />} />,
                                  }}
                                  pagination={{
                                    pageSize: 6,
                                    hideOnSinglePage: true,
                                    className: "!mb-0",
                                  }}
                                  locale={{
                                    emptyText: (
                                      <div className="py-8">
                                        <Empty
                                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                                          description={
                                            selectedSessionId
                                              ? "No executions yet for this session"
                                              : "Select a session to view executions"
                                          }
                                        />
                                      </div>
                                    ),
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                              <TerminalSquare size={16} className="text-blue-600" />
                              Latest Output
                            </div>
                            {latestExecution ? (
                              <div className="space-y-4 text-sm">
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Status</div>
                                  <div className="mt-1">
                                    <Tag className="m-0 rounded-full border-blue-200 bg-blue-50 text-blue-700">
                                      {latestExecution.status || "pending"}
                                    </Tag>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Code</div>
                                  <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                    {latestExecution.code || "--"}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Result</div>
                                  <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                    {latestExecution.result_json !== undefined
                                      ? JSON.stringify(latestExecution.result_json, null, 2)
                                      : latestExecution.stdout || latestExecution.stderr || latestExecution.error_message || "--"}
                                  </pre>
                                </div>
                                {(latestExecution.traceback || latestExecution.error_name) ? (
                                  <div>
                                    <div className="text-xs uppercase tracking-wide text-slate-400">Traceback</div>
                                    <pre className="mt-1 overflow-x-auto rounded-xl bg-red-50 p-3 text-xs text-red-700">
                                      {Array.isArray(latestExecution.traceback)
                                        ? latestExecution.traceback.join("\n")
                                        : latestExecution.traceback || latestExecution.error_name || latestExecution.error_message}
                                    </pre>
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <div className="flex min-h-[220px] items-center justify-center">
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="Execute a cell to inspect notebook output"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "runs",
                    label: "Notebook Runs",
                    children: (
                      <div className="notebook-section">
                        <Table
                          rowKey="id"
                          dataSource={notebookRuns}
                          columns={runColumns}
                          loading={{
                            spinning: isRunsLoading,
                            indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={20} />} />,
                          }}
                          pagination={{
                            pageSize: 10,
                            hideOnSinglePage: true,
                            className: "!mb-0",
                          }}
                          onRow={(record) => ({
                            onClick: () =>
                              navigateWithContentGuard(`/notebooks/${notebookId}/runs/${record.id}`),
                            className: "cursor-pointer",
                          })}
                          locale={{
                            emptyText: (
                              <div className="py-10">
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="No notebook runs yet"
                                />
                              </div>
                            ),
                          }}
                        />
                      </div>
                    ),
                  },
                  {
                    key: "spark-jobs",
                    label: "Linked Spark Jobs",
                    children: (
                      <div className="notebook-section space-y-6">
                        {isMixedProfileNotebook ? (
                          <Alert
                            type="info"
                            showIcon
                            title="Spark jobs are disabled for mixed-profile notebooks"
                            description="Mixed-profile notebooks stay interactive-only. Switch to a single-profile notebook, ideally PySpark, to create reusable Spark jobs and schedules."
                          />
                        ) : null}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="section-header">
                            <div className="min-w-0">
                              <div className="text-base font-semibold text-slate-900">
                                Linked Spark Jobs
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                Save this notebook as reusable Spark jobs, then monitor each job&apos;s run history from the same workspace.
                              </div>
                            </div>
                            <div className="section-actions">
                              <Button
                                variant="outline"
                                className="h-10 border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  void refetchSparkJobs();
                                  if (selectedSparkJobId) {
                                    void refetchSparkJobRuns();
                                  }
                                }}
                              >
                                <RefreshCw size={14} className="mr-2" />
                                Refresh Jobs
                              </Button>
                              <Button
                                className="h-10 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                                onClick={openCreateSparkJobModal}
                                disabled={isMixedProfileNotebook}
                              >
                                <Plus size={14} className="mr-2" />
                                Create Spark Job
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <div className="table-container">
                            <Table
                              rowKey="id"
                              dataSource={sparkJobs}
                              columns={sparkJobColumns}
                              tableLayout="fixed"
                              scroll={{ x: 1420 }}
                              loading={{
                                spinning: isSparkJobsLoading,
                                indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={20} />} />,
                              }}
                              pagination={{
                                pageSize: 8,
                                hideOnSinglePage: true,
                                className: "!mb-0 px-4 py-4",
                              }}
                              onRow={(record) => ({
                                onClick: () => setSelectedSparkJobId(record.id),
                                className:
                                  selectedSparkJobId === record.id
                                    ? "bg-blue-50/60 cursor-pointer"
                                    : "cursor-pointer",
                              })}
                              locale={{
                                emptyText: (
                                  <div className="py-10">
                                    <Empty
                                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                                      description="No Spark jobs linked to this notebook yet"
                                    />
                                  </div>
                                ),
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="text-base font-semibold text-slate-900">
                                  Spark Job Runs
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                  {selectedSparkJob
                                    ? `Recent runs for ${selectedSparkJob.name}`
                                    : "Select a Spark job to inspect run history"}
                                </div>
                              </div>
                              {selectedSparkJob ? (
                                <Button
                                  variant="outline"
                                  className="h-9 max-w-full border-blue-200 text-center text-blue-700 hover:bg-blue-50"
                                  onClick={() => void refetchSparkJobRuns()}
                                >
                                  <RefreshCw size={14} className="mr-2" />
                                  Refresh Runs
                                </Button>
                              ) : null}
                            </div>
                            <div className="table-container">
                              <Table
                                rowKey="id"
                                dataSource={sparkJobRuns}
                                columns={sparkJobRunColumns}
                                tableLayout="fixed"
                                scroll={{ x: 1200 }}
                                loading={{
                                  spinning: isSparkJobRunsLoading,
                                  indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={20} />} />,
                                }}
                                pagination={{
                                  pageSize: 8,
                                  hideOnSinglePage: true,
                                  className: "!mb-0",
                                }}
                                onRow={(record) => ({
                                  onClick: () =>
                                    navigateWithContentGuard(`/notebooks/${notebookId}/spark-job-runs/${record.id}`),
                                  className: "cursor-pointer",
                                })}
                                locale={{
                                  emptyText: (
                                    <div className="py-8">
                                      <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                          selectedSparkJob
                                            ? "No runs yet for this Spark job"
                                            : "Select a Spark job to view runs"
                                        }
                                      />
                                    </div>
                                  ),
                                }}
                              />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                              <SquareTerminal size={16} className="text-blue-600" />
                              Spark Job Detail
                            </div>
                            {selectedSparkJob ? (
                              <div className="space-y-4 text-sm">
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Job Name</div>
                                  <div className="mt-1 font-medium text-slate-900">{selectedSparkJob.name}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Description</div>
                                  <div className="mt-1 text-slate-600">
                                    {selectedSparkJob.description || "No description"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">App Resource</div>
                                  <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                    {selectedSparkJob.app_resource || "--"}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Main Class</div>
                                  <div className="mt-1 font-mono text-xs text-slate-600">
                                    {selectedSparkJob.main_class || "--"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Default App Args</div>
                                  <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                    {selectedSparkJob.default_app_args?.length
                                      ? selectedSparkJob.default_app_args.join("\n")
                                      : "--"}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Spark Properties</div>
                                  <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                    {safeStringifyJson(selectedSparkJob.default_spark_properties || {})}
                                  </pre>
                                </div>
                              </div>
                            ) : (
                              <div className="flex min-h-[240px] items-center justify-center">
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="Select a Spark job to inspect its defaults"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="section-header">
                            <div className="min-w-0">
                              <div className="text-base font-semibold text-slate-900">
                                Schedules
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                Create Airflow-backed schedules for the selected Spark job, then pause, resume, or trigger them on demand.
                              </div>
                            </div>
                            <div className="section-actions">
                              <Button
                                variant="outline"
                                className="h-10 border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  if (selectedSparkJobId) {
                                    void refetchSchedules();
                                  }
                                  if (selectedScheduleId) {
                                    void refetchScheduleRuns();
                                  }
                                }}
                                disabled={!selectedSparkJob}
                              >
                                <RefreshCw size={14} className="mr-2" />
                                Refresh Schedules
                              </Button>
                              <Button
                                className="h-10 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                                onClick={openCreateScheduleModal}
                                disabled={!selectedSparkJob || isMixedProfileNotebook}
                              >
                                <CalendarClock size={14} className="mr-2" />
                                Create Schedule
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <div className="table-container">
                            <Table
                              rowKey="id"
                              dataSource={schedules}
                              columns={scheduleColumns}
                              tableLayout="fixed"
                              scroll={{ x: 1320 }}
                              loading={{
                                spinning: isSchedulesLoading,
                                indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={20} />} />,
                              }}
                              pagination={{
                                pageSize: 8,
                                hideOnSinglePage: true,
                                className: "!mb-0 px-4 py-4",
                              }}
                              onRow={(record) => ({
                                onClick: () => setSelectedScheduleId(record.id),
                                className:
                                  selectedScheduleId === record.id
                                    ? "bg-blue-50/60 cursor-pointer"
                                    : "cursor-pointer",
                              })}
                              locale={{
                                emptyText: (
                                  <div className="py-10">
                                    <Empty
                                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                                      description={
                                        selectedSparkJob
                                          ? "No schedules linked to this Spark job yet"
                                          : "Select a Spark job to manage schedules"
                                      }
                                    />
                                  </div>
                                ),
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="text-base font-semibold text-slate-900">
                                  Schedule Runs
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                  {selectedSchedule
                                    ? `Recent runs for ${selectedSchedule.name}`
                                    : "Select a schedule to inspect run history"}
                                </div>
                              </div>
                              {selectedSchedule ? (
                                <Button
                                  variant="outline"
                                  className="h-9 max-w-full border-blue-200 text-center text-blue-700 hover:bg-blue-50"
                                  onClick={() => void refetchScheduleRuns()}
                                >
                                  <RefreshCw size={14} className="mr-2" />
                                  Refresh Schedule Runs
                                </Button>
                              ) : null}
                            </div>
                            <div className="table-container">
                              <Table
                                rowKey="id"
                                dataSource={scheduleRuns}
                                columns={scheduleRunColumns}
                                tableLayout="fixed"
                                scroll={{ x: 1200 }}
                                loading={{
                                  spinning: isScheduleRunsLoading,
                                  indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={20} />} />,
                                }}
                                pagination={{
                                  pageSize: 8,
                                  hideOnSinglePage: true,
                                  className: "!mb-0",
                                }}
                                onRow={(record) => ({
                                  onClick: () =>
                                    navigateWithContentGuard(`/notebooks/${notebookId}/schedule-runs/${record.id}`),
                                  className: "cursor-pointer",
                                })}
                                locale={{
                                  emptyText: (
                                    <div className="py-8">
                                      <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                          selectedSchedule
                                            ? "No runs yet for this schedule"
                                            : "Select a schedule to view runs"
                                        }
                                      />
                                    </div>
                                  ),
                                }}
                              />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                              <CalendarClock size={16} className="text-blue-600" />
                              Schedule Detail
                            </div>
                            {selectedSchedule ? (
                              <div className="space-y-4 text-sm">
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Schedule Name</div>
                                  <div className="mt-1 font-medium text-slate-900">{selectedSchedule.name}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Description</div>
                                  <div className="mt-1 text-slate-600">
                                    {selectedSchedule.description || "No description"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Schedule Type</div>
                                  <div className="mt-1 text-slate-600">{selectedSchedule.schedule_type || "cron"}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Cron</div>
                                  <div className="mt-1 font-mono text-xs text-slate-600">
                                    {selectedSchedule.cron_expr || "--"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Airflow DAG</div>
                                  <div className="mt-1 font-mono text-xs text-slate-600">
                                    {selectedSchedule.airflow_dag_id || "--"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-400">Default Conf</div>
                                  <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                    {safeStringifyJson(selectedSchedule.default_conf || {})}
                                  </pre>
                                </div>
                              </div>
                            ) : (
                              <div className="flex min-h-[240px] items-center justify-center">
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="Select a schedule to inspect its defaults"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </section>
  );

  const breadcrumbItems = [
    { label: "Notebook", href: "/notebooks" },
    { label: notebook?.name || "Notebook Detail" },
  ];

  if (isNotebookLoading && !notebook) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FAFAFA]">
        <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
          <PageHeader
            title={notebook?.name || "Notebook"}
            description="Edit notebook metadata and content, then inspect run history from the same workspace."
            breadcrumbItems={breadcrumbItems}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-9 border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
              onClick={() => navigateWithContentGuard("/notebooks")}
            >
              Back to Notebooks
            </Button>
            <Button
              variant="outline"
              className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                void refetchNotebook();
                void refetchContent();
                void refetchRuns();
                void refetchSparkJobs();
                if (selectedSparkJobId) {
                  void refetchSparkJobRuns();
                  void refetchSchedules();
                }
                if (selectedScheduleId) {
                  void refetchScheduleRuns();
                }
              }}
            >
              <RefreshCw size={14} className="mr-2" />
              Refresh
            </Button>
            <Button
              className="h-9 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
            >
              <Play size={14} className="mr-2" />
              Run Notebook
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
          {isNotebookError ? (
            <Alert
              type="error"
              showIcon
              title="Failed to load notebook"
              description="We couldn't load the notebook metadata right now."
            />
          ) : null}

                    <div className="space-y-6 xl:hidden">
            {notebookMetadataSection}
            {notebookWorkspaceSection}
          </div>

          <div className="hidden xl:block">
            <div className="h-[calc(100vh-240px)] min-h-[780px]">
              <ResizablePanelGroup
                orientation="horizontal"
                id="notebook-detail-workspace"
                className="h-full w-full"
              >
                <ResizablePanel defaultSize="28%" minSize="16%" maxSize="48%" className="pr-3 min-w-0">
                  {notebookMetadataSection}
                </ResizablePanel>

                <ResizableHandle className="relative w-[4px] shrink-0 rounded-full bg-slate-200 transition-colors hover:bg-blue-400 active:bg-blue-600 after:absolute after:-inset-x-2 after:inset-y-0 after:z-10 after:content-['']" />

                <ResizablePanel defaultSize="72%" minSize="52%" className="pl-3 min-w-0 min-h-0">
                  {notebookWorkspaceSection}
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-900">Notebook Activity</div>
                <div className="mt-1 text-sm text-slate-500">
                  Live notebook, Spark job, and schedule events scoped to this notebook.
                </div>
              </div>
            </div>

            {notebookActivity.length ? (
              <div className="grid gap-3 xl:grid-cols-2">
                {notebookActivity.map((item) => (
                  <div
                    key={`${item.category}-${item.id}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {getActivityLabel(item)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.message || item.error_message || item.category}
                        </div>
                      </div>
                      <Tag className={`m-0 rounded-full text-[11px] ${getActivityBadgeClass(item.status)}`}>
                        {item.status || "pending"}
                      </Tag>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      {dayjs(item.updated_at || item.created_at).format("MMM D, YYYY h:mm A")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[180px] items-center justify-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No notebook activity yet"
                />
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal
        title={editingSparkJob ? "Edit Spark Job" : "Create Spark Job"}
        open={isSparkJobModalOpen}
        onCancel={() => {
          setIsSparkJobModalOpen(false);
          setEditingSparkJob(null);
          sparkJobForm.resetFields();
        }}
        onOk={() => sparkJobForm.submit()}
        okText={editingSparkJob ? "Save Changes" : "Create Spark Job"}
        okButtonProps={{
          disabled: saveSparkJobMutation.isPending,
        }}
        confirmLoading={saveSparkJobMutation.isPending}
        destroyOnHidden
        centered
      >
        <Form
          form={sparkJobForm}
          layout="vertical"
          requiredMark={false}
          onFinish={async (values) => {
            await saveSparkJobMutation.mutateAsync(values);
          }}
        >
          <Form.Item
            name="name"
            label="Job Name"
            rules={[{ required: true, message: "Spark job name is required" }]}
          >
            <Input placeholder="sales_analysis_daily_batch" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe what this Spark job is for" />
          </Form.Item>

          <Form.Item
            name="app_resource"
            label="App Resource"
            rules={[{ required: true, message: "App resource is required" }]}
          >
            <Input placeholder="local:///opt/spark/jobs/notebook_runner.py" />
          </Form.Item>

          <Form.Item name="main_class" label="Main Class">
            <Input placeholder="com.deltameta.jobs.NotebookRunner" />
          </Form.Item>

          <Form.Item name="default_app_args" label="Default App Args">
            <Input.TextArea
              rows={4}
              placeholder={"Enter one argument per line\n--mode\ndaily"}
            />
          </Form.Item>

          <Form.Item
            name="default_spark_properties"
            label="Default Spark Properties"
            extra={
              'Provide a JSON object, for example {"spark.executor.memory": "2g"}'
            }
          >
            <Input.TextArea rows={6} className="font-mono text-xs" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingScheduleId ? "Edit Schedule" : "Create Schedule"}
        open={isScheduleModalOpen}
        onCancel={() => {
          setIsScheduleModalOpen(false);
          setEditingScheduleId(null);
          scheduleForm.resetFields();
        }}
        onOk={() => scheduleForm.submit()}
        okText={editingScheduleId ? "Save Changes" : "Create Schedule"}
        okButtonProps={{
          disabled: saveScheduleMutation.isPending,
        }}
        confirmLoading={saveScheduleMutation.isPending}
        destroyOnHidden
        centered
      >
        <Form
          form={scheduleForm}
          layout="vertical"
          requiredMark={false}
          onFinish={async (values) => {
            await saveScheduleMutation.mutateAsync(values);
          }}
        >
          <Form.Item
            name="name"
            label="Schedule Name"
            rules={[{ required: true, message: "Schedule name is required" }]}
          >
            <Input placeholder="Daily Sales Refresh" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe what this schedule is for" />
          </Form.Item>

          <Form.Item
            name="schedule_type"
            label="Schedule Type"
            rules={[{ required: true, message: "Schedule type is required" }]}
          >
            <Select
              options={[
                { label: "Cron", value: "cron" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="cron_expr"
            label="Cron Expression"
            rules={[{ required: true, message: "Cron expression is required" }]}
          >
            <Input placeholder="0 6 * * *" />
          </Form.Item>

          <Form.Item
            name="airflow_dag_id"
            label="Airflow DAG ID"
            rules={[{ required: true, message: "Airflow DAG ID is required" }]}
          >
            <Input placeholder="notebook_spark_runner" />
          </Form.Item>

          <Form.Item
            name="default_conf"
            label="Default Conf"
            extra='Provide a JSON object, for example {"owner": "analytics"}'
          >
            <Input.TextArea rows={6} className="font-mono text-xs" />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .notebook-detail-tabs {
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100%;
          padding: 16px 20px;
        }

        .notebook-detail-tabs .ant-tabs-nav {
          flex-shrink: 0;
          margin-bottom: 16px;
        }

        .notebook-detail-tabs .ant-tabs-nav-wrap {
          min-width: 0;
        }

        .notebook-detail-tabs .ant-tabs-nav-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 8px;
        }

        .notebook-detail-tabs .ant-tabs-tab {
          white-space: nowrap;
        }

        .notebook-detail-tabs .ant-tabs-content-holder {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .notebook-detail-tabs .ant-tabs-content {
          min-height: 100%;
          padding: 12px 0;
        }

        .notebook-section {
          min-height: 100%;
          padding: 16px;
          background: #fff;
          border-radius: 8px;
        }

        .json-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .json-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          max-width: 100%;
        }

        .json-actions > * {
          max-width: 100%;
        }

        .json-actions .ant-select {
          width: min(260px, 100%);
        }

        .json-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          white-space: normal;
          text-align: center;
        }

        .json-body {
          background: #f8fafc;
          padding: 12px;
          border-radius: 12px;
          overflow-x: auto;
        }

        .execution-table-container {
          width: 100%;
          overflow-x: auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .section-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          margin-left: auto;
          max-width: 100%;
        }

        .section-actions > * {
          max-width: 100%;
        }

        .section-actions .ant-select {
          width: min(260px, 100%);
        }

        .section-actions button {
          max-width: 100%;
          white-space: normal;
          text-align: center;
        }

        .section-header + .table-container {
          margin-top: 8px;
        }

        .execute-cell-actions {
          flex-wrap: nowrap;
          min-width: 0;
          width: 100%;
        }

        .execute-cell-actions .ant-select {
          flex: 1 1 0;
          min-width: 0;
          max-width: 100%;
        }

        .execute-cell-actions button {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .json-body .ant-input-textarea textarea {
          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}



