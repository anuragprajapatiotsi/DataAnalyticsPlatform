"use client";
import React from "react";
import { SqlEditorWorkspace } from "@/features/sql-editor/components/SqlEditorWorkspace";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function SqlEditorPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "SQL Editor" },
  ];

  return <SqlEditorWorkspace />;
}
