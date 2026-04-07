"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { TableDetailView } from "@/shared/components/catalog/TableDetailView";

export default function TableDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const {
    service_type: serviceType,
    id,
    database,
    schema,
    table,
  } = params as {
    service_type: string;
    id: string;
    database: string;
    schema: string;
    table: string;
  };

  const isDatabaseService = serviceType === "database" || serviceType === "databases";
  const serviceLabel = isDatabaseService ? "Database" : 
    (serviceType.charAt(0).toUpperCase() + serviceType.slice(1));

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: serviceLabel, href: `/explore/${serviceType}` },
    { label: database, href: `/explore/${serviceType}/${id}/${database}` },
    { label: schema, href: `/explore/${serviceType}/${id}/${database}/${schema}/objects` },
    { label: table },
  ];

  return (
    <TableDetailView
      id={id}
      database={database}
      schema={schema}
      table={table}
      breadcrumbItems={breadcrumbItems}
      onCreateCatalogView={() => {
        // Handle catalog view creation (can be navigated to or open a modal)
        router.push(`/explore/${serviceType}/${id}/${database}/${schema}/objects`); // fallback
      }}
    />
  );
}