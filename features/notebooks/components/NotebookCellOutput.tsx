"use client";

import React from "react";
import { Empty } from "antd";

type NotebookCellOutputProps = {
  outputs?: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getOutputText(output: Record<string, unknown>) {
  if (typeof output.text === "string") {
    return output.text;
  }

  if (Array.isArray(output.text)) {
    return output.text.join("");
  }

  if (isRecord(output.data)) {
    if ("application/json" in output.data) {
      return output.data["application/json"];
    }

    if ("text/plain" in output.data) {
      return output.data["text/plain"];
    }
  }

  if (output.traceback) {
    return Array.isArray(output.traceback)
      ? output.traceback.join("\n")
      : String(output.traceback);
  }

  return output;
}

function renderStructuredValue(value: unknown) {
  if (Array.isArray(value) && value.length && value.every(isRecord)) {
    const keys = Array.from(
      new Set(value.flatMap((row) => Object.keys(row))),
    );

    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-xs text-slate-700">
          <thead className="bg-slate-50">
            <tr>
              {keys.map((key) => (
                <th
                  key={key}
                  className="border-b border-r border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 last:border-r-0"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-b border-slate-100 last:border-b-0">
                {keys.map((key) => (
                  <td
                    key={`${rowIndex}-${key}`}
                    className="border-r border-slate-100 px-3 py-2 align-top last:border-r-0"
                  >
                    {row[key] === null || row[key] === undefined
                      ? "-"
                      : typeof row[key] === "object"
                        ? JSON.stringify(row[key])
                        : String(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (isRecord(value)) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(value).map(([key, entryValue]) => (
          <div
            key={key}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {key}
            </div>
            <div className="mt-1 text-xs text-slate-700 break-all">
              {entryValue === null || entryValue === undefined
                ? "-"
                : typeof entryValue === "object"
                  ? JSON.stringify(entryValue, null, 2)
                  : String(entryValue)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs text-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs text-slate-700">
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function NotebookCellOutput({ outputs }: NotebookCellOutputProps) {
  if (!Array.isArray(outputs) || outputs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No output yet for this cell"
        />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Output
      </div>
      <div className="space-y-3">
        {outputs.map((output, outputIndex) => {
          const typedOutput = isRecord(output) ? output : { value: output };
          const outputType = String(typedOutput.output_type || "");
          const isError = outputType === "error";
          const normalizedValue = getOutputText(typedOutput);

          return (
            <div
              key={`output-${outputIndex}`}
              className={[
                "rounded-lg p-3",
                isError ? "bg-red-50 text-red-700" : "bg-transparent text-slate-700",
              ].join(" ")}
            >
              {renderStructuredValue(normalizedValue)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
