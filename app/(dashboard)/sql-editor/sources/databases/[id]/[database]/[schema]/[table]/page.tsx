"use client";

import React from "react";
import { useParams } from "next/navigation";
import { TableDetailView } from "@/shared/components/catalog/TableDetailView";

export default function SqlEditorTableDetailPage() {
  const params = useParams();
  const { id, database, schema, table } = params as { 
    id: string; 
    database: string; 
    schema: string; 
    table: string 
  };

  const breadcrumbItems = [
    { label: "SQL Editor", href: "/sql-editor" },
    { label: "Sources", href: "/sql-editor/sources/databases" },
    { label: "Databases", href: "/sql-editor/sources/databases" },
    { label: "Connection", href: `/sql-editor/sources/databases/${id}` },
    { label: database, href: `/sql-editor/sources/databases/${id}/${database}` },
    { label: schema, href: `/sql-editor/sources/databases/${id}/${database}/${schema}/objects` },
    { label: table },
  ];

  return (
    <TableDetailView
      id={id}
      database={database}
      schema={schema}
      table={table}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
