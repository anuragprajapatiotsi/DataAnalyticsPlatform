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
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <PageHeader
          title="SQL Editor"
          description="Write and execute SQL queries against your data sources."
          breadcrumbItems={breadcrumbItems}
        />
      </div>
      <div className="flex-1 min-h-0">
        <SqlEditorWorkspace />
      </div>
    </div>
  );
}
