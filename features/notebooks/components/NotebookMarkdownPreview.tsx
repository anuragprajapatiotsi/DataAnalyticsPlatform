"use client";

import React from "react";

type NotebookMarkdownPreviewProps = {
  value: string;
};

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`inline-${index}`} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`inline-${index}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={`inline-${index}`}>{part}</React.Fragment>;
  });
}

export function NotebookMarkdownPreview({ value }: NotebookMarkdownPreviewProps) {
  const lines = value.split("\n");
  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let codeFenceBuffer: string[] = [];
  let inCodeFence = false;

  const flushParagraph = () => {
    if (!paragraphBuffer.length) {
      return;
    }

    elements.push(
      <p key={`p-${elements.length}`} className="leading-7 text-slate-700">
        {renderInlineMarkdown(paragraphBuffer.join(" "))}
      </p>,
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) {
      return;
    }

    elements.push(
      <ul key={`ul-${elements.length}`} className="list-disc space-y-1 pl-5 text-slate-700">
        {listBuffer.map((item, index) => (
          <li key={`li-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  const flushCodeFence = () => {
    if (!codeFenceBuffer.length) {
      return;
    }

    elements.push(
      <pre
        key={`code-${elements.length}`}
        className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100"
      >
        {codeFenceBuffer.join("\n")}
      </pre>,
    );
    codeFenceBuffer = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.replace(/\r$/, "");
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();

      if (inCodeFence) {
        flushCodeFence();
        inCodeFence = false;
      } else {
        inCodeFence = true;
      }
      return;
    }

    if (inCodeFence) {
      codeFenceBuffer.push(line);
      return;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2));
      return;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-lg font-semibold text-slate-900">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-xl font-semibold text-slate-900">
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>,
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-2xl font-semibold text-slate-900">
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>,
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      elements.push(
        <blockquote
          key={`blockquote-${elements.length}`}
          className="border-l-4 border-blue-200 bg-blue-50 px-4 py-3 text-slate-700"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>,
      );
      return;
    }

    paragraphBuffer.push(trimmed);
  });

  flushParagraph();
  flushList();
  flushCodeFence();

  return <div className="space-y-3">{elements}</div>;
}
