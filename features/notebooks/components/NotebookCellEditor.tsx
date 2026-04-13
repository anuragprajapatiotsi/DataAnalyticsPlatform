"use client";

import React from "react";
import { Alert, Empty, Input, Select, Tag } from "antd";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  FileCode2,
  FileText,
  EyeOff,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { NotebookMarkdownPreview } from "@/features/notebooks/components/NotebookMarkdownPreview";
import { NotebookCellOutput } from "@/features/notebooks/components/NotebookCellOutput";
import type {
  NotebookContent,
  NotebookExecutionMode,
  NotebookExecutionProfile,
} from "@/features/notebooks/types";

type EditableNotebookCell = {
  cell_type?: string;
  source?: string[] | string;
  metadata?: Record<string, unknown>;
  execution_count?: number | null;
  outputs?: unknown[];
  [key: string]: unknown;
};

type NotebookOutlineItem = {
  cellIndex: number;
  level: number;
  title: string;
};

const NOTEBOOK_CELL_UI_ID_KEY = "__ui_cell_id";

const NOTEBOOK_PROFILE_OPTIONS: Array<{
  label: string;
  value: NotebookExecutionProfile;
}> = [
  { label: "Python", value: "python" },
  { label: "PySpark", value: "pyspark" },
  { label: "SQL", value: "sql_trino" },
];

interface NotebookCellEditorProps {
  notebookId?: string;
  contentValue: string;
  onChange: (nextValue: string) => void;
  selectedSessionId?: string | null;
  onExecuteCell?: (
    cellIndex: number,
    cellCode: string,
    cellType: string,
    executionProfile?: NotebookExecutionProfile,
  ) => Promise<void>;
  executingCellIndex?: number | null;
  onRunAllCells?: () => Promise<void>;
  onRunFromCell?: (cellIndex: number) => Promise<void>;
  isBatchExecuting?: boolean;
  batchExecutingCellIndex?: number | null;
  notebookExecutionMode?: NotebookExecutionMode;
  notebookDefaultExecutionProfile?: NotebookExecutionProfile;
}

type NotebookCellUiState = {
  searchValue: string;
  collapsedOutputIndexes: number[];
  collapsedInputIndexes: number[];
  isOutlineCollapsed: boolean;
};

function getNotebookCellUiStateKey(notebookId?: string) {
  return notebookId ? `notebook_cell_ui_${notebookId}` : "";
}

function readNotebookCellUiState(notebookId?: string): NotebookCellUiState | null {
  if (typeof window === "undefined" || !notebookId) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getNotebookCellUiStateKey(notebookId));
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<NotebookCellUiState>;
    return {
      searchValue: typeof parsed.searchValue === "string" ? parsed.searchValue : "",
      collapsedOutputIndexes: Array.isArray(parsed.collapsedOutputIndexes)
        ? parsed.collapsedOutputIndexes.filter((item): item is number => typeof item === "number")
        : [],
      collapsedInputIndexes: Array.isArray(parsed.collapsedInputIndexes)
        ? parsed.collapsedInputIndexes.filter((item): item is number => typeof item === "number")
        : [],
      isOutlineCollapsed: Boolean(parsed.isOutlineCollapsed),
    };
  } catch {
    return null;
  }
}

function writeNotebookCellUiState(
  notebookId: string,
  state: NotebookCellUiState,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getNotebookCellUiStateKey(notebookId), JSON.stringify(state));
}

function parseNotebookContent(contentValue: string): NotebookContent | null {
  try {
    return JSON.parse(contentValue) as NotebookContent;
  } catch {
    return null;
  }
}

function serializeNotebookContent(content: NotebookContent) {
  return JSON.stringify(content, null, 2);
}

function normalizeSource(source: EditableNotebookCell["source"]) {
  if (Array.isArray(source)) {
    return source.join("");
  }

  return source || "";
}

function toSourceLines(value: string) {
  if (!value) {
    return [];
  }

  const lines = value.split("\n");
  return lines.map((line, index) =>
    index < lines.length - 1 ? `${line}\n` : line,
  );
}

function createNotebookCellUiId() {
  const cryptoApi =
    typeof globalThis !== "undefined" && "crypto" in globalThis
      ? globalThis.crypto
      : undefined;

  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  return `cell-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createCell(cellType: "code" | "markdown"): EditableNotebookCell {
  if (cellType === "markdown") {
    return {
      cell_type: "markdown",
      metadata: {
        [NOTEBOOK_CELL_UI_ID_KEY]: createNotebookCellUiId(),
      },
      source: ["# New Section\n", "Add your notes here.\n"],
    };
  }

  return {
    cell_type: "code",
    execution_count: null,
    metadata: {
      [NOTEBOOK_CELL_UI_ID_KEY]: createNotebookCellUiId(),
    },
    outputs: [],
    source: ["# Write code here\n"],
  };
}

function extractMarkdownHeadings(source: string, cellIndex: number): NotebookOutlineItem[] {
  return source
    .split("\n")
    .map((line) => line.trim())
    .map((line) => {
      const match = /^(#{1,3})\s+(.+)$/.exec(line);
      if (!match) {
        return null;
      }

      return {
        cellIndex,
        level: match[1].length,
        title: match[2].trim(),
      } satisfies NotebookOutlineItem;
    })
    .filter((item): item is NotebookOutlineItem => Boolean(item));
}

function getCellExecutionProfile(
  cell: EditableNotebookCell,
  fallbackProfile: NotebookExecutionProfile,
) {
  const metadata = cell.metadata;
  if (
    metadata &&
    typeof metadata === "object" &&
    typeof metadata.execution_profile === "string" &&
    ["python", "pyspark", "sql_trino"].includes(metadata.execution_profile)
  ) {
    return metadata.execution_profile as NotebookExecutionProfile;
  }

  return fallbackProfile;
}

function getCellUiId(cell: EditableNotebookCell, fallbackIndex: number) {
  const metadata = cell.metadata;
  if (
    metadata &&
    typeof metadata === "object" &&
    typeof metadata[NOTEBOOK_CELL_UI_ID_KEY] === "string" &&
    metadata[NOTEBOOK_CELL_UI_ID_KEY]
  ) {
    return metadata[NOTEBOOK_CELL_UI_ID_KEY] as string;
  }

  return `cell-${fallbackIndex}`;
}

interface NotebookCellCardProps {
  cell: EditableNotebookCell;
  index: number;
  totalCells: number;
  cellUiId: string;
  isMatched: boolean;
  isActive: boolean;
  isMarkdown: boolean;
  isMixedProfileNotebook: boolean;
  notebookDefaultExecutionProfile: NotebookExecutionProfile;
  executingCellIndex?: number | null;
  batchExecutingCellIndex?: number | null;
  isBatchExecuting: boolean;
  collapsedInput: boolean;
  collapsedOutput: boolean;
  onSetActiveCellId: (value: string) => void;
  onMoveCell: (index: number, direction: -1 | 1) => void;
  onToggleInputCollapse: (index: number) => void;
  onToggleOutputCollapse: (index: number) => void;
  onDuplicateCell: (index: number) => void;
  onRemoveCell: (index: number) => void;
  onInsertCell: (
    index: number,
    position: "above" | "below",
    cellType: "code" | "markdown",
  ) => void;
  onUpdateCellType: (index: number, value: string) => void;
  onUpdateCellProfile: (index: number, value: NotebookExecutionProfile) => void;
  onCommitCellSource: (index: number, nextValue: string) => void;
  onExecuteCell?: (
    cellIndex: number,
    cellCode: string,
    cellType: string,
    executionProfile?: NotebookExecutionProfile,
  ) => Promise<void>;
  onRunFromCell?: (cellIndex: number) => Promise<void>;
}

const NotebookCellCard = React.memo(function NotebookCellCard({
  cell,
  index,
  totalCells,
  cellUiId,
  isMatched,
  isActive,
  isMarkdown,
  isMixedProfileNotebook,
  notebookDefaultExecutionProfile,
  executingCellIndex,
  batchExecutingCellIndex,
  isBatchExecuting,
  collapsedInput,
  collapsedOutput,
  onSetActiveCellId,
  onMoveCell,
  onToggleInputCollapse,
  onToggleOutputCollapse,
  onDuplicateCell,
  onRemoveCell,
  onInsertCell,
  onUpdateCellType,
  onUpdateCellProfile,
  onCommitCellSource,
  onExecuteCell,
  onRunFromCell,
}: NotebookCellCardProps) {
  const hasOutputs = !isMarkdown && Array.isArray(cell.outputs) && cell.outputs.length > 0;
  const sourceValue = React.useMemo(() => normalizeSource(cell.source), [cell.source]);
  const executionProfile = React.useMemo(
    () => getCellExecutionProfile(cell, notebookDefaultExecutionProfile),
    [cell, notebookDefaultExecutionProfile],
  );
  const [draftSource, setDraftSource] = React.useState(sourceValue);

  React.useEffect(() => {
    setDraftSource(sourceValue);
  }, [sourceValue]);

  const flushDraftSource = React.useCallback(() => {
    if (draftSource !== sourceValue) {
      onCommitCellSource(index, draftSource);
    }
  }, [draftSource, index, onCommitCellSource, sourceValue]);

  return (
    <div
      id={`notebook-cell-${index}`}
      data-cell-editor-id={cellUiId}
      className={[
        "rounded-2xl border bg-white p-4 shadow-sm",
        isMatched
          ? "border-emerald-300 ring-2 ring-emerald-100"
          : isActive
            ? "border-blue-300 ring-2 ring-blue-100"
            : "border-slate-200",
      ].join(" ")}
      onClick={() => onSetActiveCellId(cellUiId)}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => onInsertCell(index, "above", "code")}
          disabled={isBatchExecuting}
        >
          <Plus size={12} className="mr-1" />
          Code Above
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-slate-300 text-slate-700 hover:bg-slate-100"
          onClick={() => onInsertCell(index, "above", "markdown")}
          disabled={isBatchExecuting}
        >
          <Plus size={12} className="mr-1" />
          Markdown Above
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={[
              "flex h-8 w-8 items-center justify-center rounded-lg",
              isMarkdown ? "bg-slate-100 text-slate-700" : "bg-blue-50 text-blue-600",
            ].join(" ")}
          >
            {isMarkdown ? <FileText size={15} /> : <FileCode2 size={15} />}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Cell {index + 1}</div>
            <div className="text-xs text-slate-500">{isMarkdown ? "Markdown" : "Code"}</div>
          </div>
        </div>

        <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
          <Select
            size="small"
            value={cell.cell_type || "code"}
            className="min-w-[120px] sm:min-w-[140px]"
            options={[
              { label: "Code", value: "code" },
              { label: "Markdown", value: "markdown" },
            ]}
            onChange={(value) => onUpdateCellType(index, value)}
            disabled={isBatchExecuting}
          />
          {!isMarkdown ? (
            isMixedProfileNotebook ? (
              <Select
                size="small"
                value={executionProfile}
                className="min-w-[128px] sm:min-w-[150px]"
                options={NOTEBOOK_PROFILE_OPTIONS}
                onChange={(value) => onUpdateCellProfile(index, value)}
                disabled={isBatchExecuting}
              />
            ) : (
              <Tag className="m-0 max-w-full rounded-full border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700">
                {NOTEBOOK_PROFILE_OPTIONS.find(
                  (option) => option.value === notebookDefaultExecutionProfile,
                )?.label || notebookDefaultExecutionProfile}
              </Tag>
            )
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => onMoveCell(index, -1)}
            disabled={index === 0 || isBatchExecuting}
          >
            <ArrowUp size={13} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => onMoveCell(index, 1)}
            disabled={index === totalCells - 1 || isBatchExecuting}
          >
            <ArrowDown size={13} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => onToggleInputCollapse(index)}
            disabled={isBatchExecuting}
          >
            <EyeOff size={13} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => onDuplicateCell(index)}
            disabled={isBatchExecuting}
          >
            <Copy size={13} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onRemoveCell(index)}
            disabled={isBatchExecuting}
          >
            <Trash2 size={13} />
          </Button>
          {!isMarkdown ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                flushDraftSource();
                void onExecuteCell?.(
                  index,
                  draftSource,
                  cell.cell_type || "code",
                  executionProfile,
                );
              }}
              disabled={!onExecuteCell || isBatchExecuting || executingCellIndex === index}
            >
              <Play size={13} className="mr-1" />
              {executingCellIndex === index ? "Running..." : "Run"}
            </Button>
          ) : null}
          {!isMarkdown ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                flushDraftSource();
                void onRunFromCell?.(index);
              }}
              disabled={!onRunFromCell || isBatchExecuting}
            >
              <Play size={13} className="mr-1" />
              {isBatchExecuting && batchExecutingCellIndex === index
                ? "Running From Here..."
                : "Run From Here"}
            </Button>
          ) : null}
        </div>
      </div>

      {!collapsedInput ? (
        <Input.TextArea
          value={draftSource}
          onChange={(event) => {
            setDraftSource(event.target.value);
          }}
          onBlur={flushDraftSource}
          onFocus={() => onSetActiveCellId(cellUiId)}
          autoSize={{ minRows: isMarkdown ? 5 : 8, maxRows: 18 }}
          className="font-mono text-xs"
          disabled={isBatchExecuting}
          placeholder={isMarkdown ? "Write markdown content for this cell" : "Write code for this cell"}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Input hidden. Expand the cell to keep editing.
        </div>
      )}
      {isMarkdown ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Preview
          </div>
          <NotebookMarkdownPreview value={draftSource} />
        </div>
      ) : null}
      {hasOutputs ? (
        <div className="mt-4">
          <button
            type="button"
            className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
            onClick={() => onToggleOutputCollapse(index)}
          >
            {collapsedOutput ? (
              <ChevronRight size={14} className="text-slate-400" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )}
            {collapsedOutput ? "Show Output" : "Hide Output"}
          </button>
          {!collapsedOutput ? <NotebookCellOutput outputs={cell.outputs} /> : null}
        </div>
      ) : !isMarkdown ? (
        <NotebookCellOutput outputs={cell.outputs} />
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => onInsertCell(index, "below", "code")}
          disabled={isBatchExecuting}
        >
          <Plus size={12} className="mr-1" />
          Code Below
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-slate-300 text-slate-700 hover:bg-slate-100"
          onClick={() => onInsertCell(index, "below", "markdown")}
          disabled={isBatchExecuting}
        >
          <Plus size={12} className="mr-1" />
          Markdown Below
        </Button>
      </div>
    </div>
  );
});

export function NotebookCellEditor({
  notebookId,
  contentValue,
  onChange,
  selectedSessionId,
  onExecuteCell,
  executingCellIndex,
  onRunAllCells,
  onRunFromCell,
  isBatchExecuting = false,
  batchExecutingCellIndex,
  notebookExecutionMode = "single_profile",
  notebookDefaultExecutionProfile = "python",
}: NotebookCellEditorProps) {
  const [collapsedOutputIndexes, setCollapsedOutputIndexes] = React.useState<number[]>([]);
  const [collapsedInputIndexes, setCollapsedInputIndexes] = React.useState<number[]>([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [isOutlineCollapsed, setIsOutlineCollapsed] = React.useState(false);
  const [activeCellId, setActiveCellId] = React.useState<string | null>(null);
  const [editorContent, setEditorContent] = React.useState<NotebookContent | null>(() =>
    parseNotebookContent(contentValue),
  );
  const syncTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedContentValueRef = React.useRef(contentValue);
  const pendingFocusCellIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (contentValue === lastSyncedContentValueRef.current) {
      return;
    }

    setEditorContent(parseNotebookContent(contentValue));
    lastSyncedContentValueRef.current = contentValue;
  }, [contentValue]);

  React.useEffect(() => {
    const savedState = readNotebookCellUiState(notebookId);
    if (!savedState) {
      return;
    }

    setSearchValue(savedState.searchValue);
    setCollapsedOutputIndexes(savedState.collapsedOutputIndexes);
    setCollapsedInputIndexes(savedState.collapsedInputIndexes);
    setIsOutlineCollapsed(savedState.isOutlineCollapsed);
  }, [notebookId]);

  const cells = React.useMemo<EditableNotebookCell[]>(
    () => (Array.isArray(editorContent?.cells) ? (editorContent.cells as EditableNotebookCell[]) : []),
    [editorContent],
  );
  const normalizedSearchValue = searchValue.trim().toLowerCase();
  const matchedCellIndexes = React.useMemo(
    () =>
      cells.reduce<number[]>((accumulator, cell, index) => {
        if (!normalizedSearchValue) {
          return accumulator;
        }

        const sourceValue = normalizeSource(cell.source).toLowerCase();
        if (sourceValue.includes(normalizedSearchValue)) {
          accumulator.push(index);
        }
        return accumulator;
      }, []),
    [cells, normalizedSearchValue],
  );
  const outlineItems = React.useMemo(
    () =>
      cells.flatMap((cell, index) =>
        cell.cell_type === "markdown"
          ? extractMarkdownHeadings(normalizeSource(cell.source), index)
          : [],
      ),
    [cells],
  );
  const codeCellCount = React.useMemo(
    () => cells.filter((cell) => cell.cell_type !== "markdown").length,
    [cells],
  );
  const cellUiIds = React.useMemo(
    () => cells.map((cell, index) => getCellUiId(cell, index)),
    [cells],
  );
  const isMixedProfileNotebook = notebookExecutionMode === "mixed_profile";

  React.useEffect(() => {
    const nextFocusedCellId = pendingFocusCellIdRef.current;

    if (!nextFocusedCellId || !cellUiIds.includes(nextFocusedCellId)) {
      return;
    }

    pendingFocusCellIdRef.current = null;
    const timer = window.setTimeout(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>(
        `[data-cell-editor-id="${nextFocusedCellId}"] textarea`,
      );
      textarea?.focus();
      const valueLength = textarea?.value.length || 0;
      textarea?.setSelectionRange(valueLength, valueLength);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [cellUiIds]);

  React.useEffect(() => {
    if (!notebookId) {
      return;
    }

    writeNotebookCellUiState(notebookId, {
      searchValue,
      collapsedOutputIndexes,
      collapsedInputIndexes,
      isOutlineCollapsed,
    });
  }, [
    notebookId,
    searchValue,
    collapsedOutputIndexes,
    collapsedInputIndexes,
    isOutlineCollapsed,
  ]);

  const syncEditorContentToParent = React.useCallback(
    (nextContent: NotebookContent) => {
      const nextContentValue = serializeNotebookContent(nextContent);
      if (nextContentValue === lastSyncedContentValueRef.current) {
        return;
      }

      lastSyncedContentValueRef.current = nextContentValue;
      onChange(nextContentValue);
    },
    [onChange],
  );

  React.useEffect(() => {
    if (!editorContent) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncEditorContentToParent(editorContent);
    }, 400);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [editorContent, syncEditorContentToParent]);

  const commitCells = React.useCallback(
    (nextCells: EditableNotebookCell[]) => {
      if (!editorContent) {
        return;
      }

      const nextContent: NotebookContent = {
        ...editorContent,
        cells: nextCells,
      };

      setEditorContent(nextContent);
    },
    [editorContent],
  );

  const updateCell = React.useCallback(
    (index: number, updater: (cell: EditableNotebookCell) => EditableNotebookCell) => {
      const nextCells = cells.map((cell, cellIndex) =>
        cellIndex === index ? updater(cell) : cell,
      );
      commitCells(nextCells);
    },
    [cells, commitCells],
  );

  const updateCellType = React.useCallback(
    (index: number, value: string) => {
      updateCell(index, (currentCell) => ({
        ...currentCell,
        cell_type: value,
        ...(value === "code"
          ? {
              execution_count:
                currentCell.execution_count === undefined
                  ? null
                  : currentCell.execution_count,
              outputs: Array.isArray(currentCell.outputs)
                ? currentCell.outputs
                : [],
            }
          : {
              execution_count: undefined,
              outputs: undefined,
            }),
      }));
    },
    [updateCell],
  );

  const updateCellExecutionProfile = React.useCallback(
    (index: number, value: NotebookExecutionProfile) => {
      updateCell(index, (currentCell) => ({
        ...currentCell,
        metadata: {
          ...(currentCell.metadata || {}),
          execution_profile: value,
        },
      }));
    },
    [updateCell],
  );

  const commitCellSource = React.useCallback(
    (index: number, nextValue: string) => {
      updateCell(index, (currentCell) => ({
        ...currentCell,
        source: toSourceLines(nextValue),
      }));
    },
    [updateCell],
  );

  const moveCell = React.useCallback(
    (index: number, direction: -1 | 1) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= cells.length) {
        return;
      }

      const nextCells = [...cells];
      const [movedCell] = nextCells.splice(index, 1);
      nextCells.splice(targetIndex, 0, movedCell);
      commitCells(nextCells);
    },
    [cells, commitCells],
  );

  const removeCell = React.useCallback(
    (index: number) => {
      const nextCells = cells.filter((_, cellIndex) => cellIndex !== index);
      commitCells(nextCells);
    },
    [cells, commitCells],
  );

  const duplicateCell = React.useCallback(
    (index: number) => {
      const sourceCell = cells[index];
      if (!sourceCell) {
        return;
      }

      const clonedCell = JSON.parse(JSON.stringify(sourceCell)) as EditableNotebookCell;
      clonedCell.metadata = {
        ...(clonedCell.metadata || {}),
        [NOTEBOOK_CELL_UI_ID_KEY]: createNotebookCellUiId(),
      };
      const nextCells = [...cells];
      nextCells.splice(index + 1, 0, clonedCell);
      setCollapsedInputIndexes((previous) =>
        previous.map((item) => (item > index ? item + 1 : item)),
      );
      setCollapsedOutputIndexes((previous) =>
        previous.map((item) => (item > index ? item + 1 : item)),
      );
      commitCells(nextCells);
      const nextCellUiId = getCellUiId(clonedCell, index + 1);
      pendingFocusCellIdRef.current = nextCellUiId;
      setActiveCellId(nextCellUiId);
    },
    [cells, commitCells],
  );

  const appendCell = React.useCallback(
    (cellType: "code" | "markdown") => {
      const nextCell = createCell(cellType);
      setCollapsedInputIndexes((previous) =>
        previous.filter((item) => item !== cells.length),
      );
      commitCells([...cells, nextCell]);
      const nextCellUiId = getCellUiId(nextCell, cells.length);
      pendingFocusCellIdRef.current = nextCellUiId;
      setActiveCellId(nextCellUiId);
    },
    [cells, commitCells],
  );

  const insertCell = React.useCallback(
    (index: number, position: "above" | "below", cellType: "code" | "markdown") => {
      const nextCells = [...cells];
      const insertIndex = position === "above" ? index : index + 1;
      const nextCell = createCell(cellType);
      nextCells.splice(insertIndex, 0, nextCell);
      setCollapsedInputIndexes((previous) =>
        previous
          .map((item) => (item >= insertIndex ? item + 1 : item))
          .filter((item) => item !== insertIndex),
      );
      setCollapsedOutputIndexes((previous) =>
        previous.map((item) => (item >= insertIndex ? item + 1 : item)),
      );
      commitCells(nextCells);
      const nextCellUiId = getCellUiId(nextCell, insertIndex);
      pendingFocusCellIdRef.current = nextCellUiId;
      setActiveCellId(nextCellUiId);
    },
    [cells, commitCells],
  );

  const toggleOutputCollapse = React.useCallback((index: number) => {
    setCollapsedOutputIndexes((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index],
    );
  }, []);

  const toggleInputCollapse = React.useCallback((index: number) => {
    setCollapsedInputIndexes((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index],
    );
  }, []);

  if (!editorContent) {
    return (
      <Alert
        type="warning"
        showIcon
        title="Cell editor is unavailable"
        description="Fix the notebook JSON first, then the cell editor will become available again."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Cell Editor</div>
          <div className="mt-1 text-xs text-slate-500">
            Edit notebook cells directly, then keep the raw JSON below for full control.
          </div>
          <div className="mt-2">
            <Tag className="m-0 max-w-full rounded-full border-blue-200 bg-blue-50 text-[11px] text-blue-700">
              <span className="block max-w-full truncate">
                {isMixedProfileNotebook
                  ? "Mixed profile notebook: each code cell can choose its own execution profile."
                  : `Single profile notebook: all code cells run as ${notebookDefaultExecutionProfile}.`}
              </span>
            </Tag>
            {normalizedSearchValue ? (
              <Tag className="ml-2 rounded-full border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">
                {matchedCellIndexes.length} match{matchedCellIndexes.length === 1 ? "" : "es"}
              </Tag>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px]">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search notebook cells"
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => appendCell("code")}
            disabled={isBatchExecuting}
          >
            <Plus size={13} className="mr-1" />
            Add Code Cell
          </Button>
          <Button
            variant="outline"
            className="h-8 border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => appendCell("markdown")}
            disabled={isBatchExecuting}
          >
            <Plus size={13} className="mr-1" />
            Add Markdown Cell
          </Button>
          <Button
            variant="outline"
            className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => void onRunAllCells?.()}
            disabled={
              (!selectedSessionId && !isMixedProfileNotebook) ||
              !onRunAllCells ||
              !codeCellCount ||
              isBatchExecuting
            }
          >
            <Play size={13} className="mr-1" />
            {isBatchExecuting ? "Running Cells..." : "Run All Code Cells"}
          </Button>
        </div>
      </div>

      {cells.length ? (
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Notebook Outline</div>
                <div className="mt-1 text-xs text-slate-500">
                  Jump across sections using markdown headings.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-slate-300 text-slate-700 hover:bg-slate-100"
                onClick={() => setIsOutlineCollapsed((previous) => !previous)}
              >
                {isOutlineCollapsed ? "Expand" : "Collapse"}
              </Button>
            </div>
            {!isOutlineCollapsed && outlineItems.length ? (
              <div className="mt-4 space-y-2">
                {outlineItems.map((item) => (
                  <button
                    key={`outline-${item.cellIndex}-${item.title}`}
                    type="button"
                    className={[
                      "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-white hover:text-slate-900",
                      "text-slate-600",
                    ].join(" ")}
                    style={{ paddingLeft: `${item.level * 12}px` }}
                    onClick={() => {
                      const element = document.getElementById(`notebook-cell-${item.cellIndex}`);
                      element?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            ) : !isOutlineCollapsed ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                Add markdown headings like <code># Section</code> to build an outline.
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                Outline collapsed for a wider cell workspace.
              </div>
            )}
          </aside>

          <div className="space-y-4">
          {cells.map((cell, index) => (
            <NotebookCellCard
              key={cellUiIds[index]}
              cell={cell}
              index={index}
              totalCells={cells.length}
              cellUiId={cellUiIds[index]}
              isMatched={
                normalizedSearchValue.length > 0 &&
                normalizeSource(cell.source).toLowerCase().includes(normalizedSearchValue)
              }
              isActive={activeCellId === cellUiIds[index]}
              isMarkdown={cell.cell_type === "markdown"}
              isMixedProfileNotebook={isMixedProfileNotebook}
              notebookDefaultExecutionProfile={notebookDefaultExecutionProfile}
              executingCellIndex={executingCellIndex}
              batchExecutingCellIndex={batchExecutingCellIndex}
              isBatchExecuting={isBatchExecuting}
              collapsedInput={collapsedInputIndexes.includes(index)}
              collapsedOutput={collapsedOutputIndexes.includes(index)}
              onSetActiveCellId={setActiveCellId}
              onMoveCell={moveCell}
              onToggleInputCollapse={toggleInputCollapse}
              onToggleOutputCollapse={toggleOutputCollapse}
              onDuplicateCell={duplicateCell}
              onRemoveCell={removeCell}
              onInsertCell={insertCell}
              onUpdateCellType={updateCellType}
              onUpdateCellProfile={updateCellExecutionProfile}
              onCommitCellSource={commitCellSource}
              onExecuteCell={onExecuteCell}
              onRunFromCell={onRunFromCell}
            />
          ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No cells in this notebook yet"
          />
        </div>
      )}
    </div>
  );
}
