"use client";
import React from "react";
import { SqlEditorWorkspace } from "@/features/sql-editor/components/SqlEditorWorkspace";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function SqlEditorPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "SQL Editor" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0">
        <SqlEditorWorkspace />
      </div>
    </div>
  );
}
