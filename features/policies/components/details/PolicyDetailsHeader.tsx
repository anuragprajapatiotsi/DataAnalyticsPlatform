"use client";

import React from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Policy } from "../../types";

interface PolicyDetailsHeaderProps {
  policy?: Policy;
  isLoading: boolean;
}

export function PolicyDetailsHeader({
  policy,
  isLoading,
}: PolicyDetailsHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-5 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-100 animate-pulse rounded" />
          <div className="h-4 w-full max-w-2xl bg-slate-100 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!policy) return null;

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Access Control", href: "/settings/access-control" },
    { label: "Policies", href: "/settings/access-control/policies" },
    { label: policy.name },
  ];

  return (
    <PageHeader
      title={policy.name}
      description={
        policy.description || "No description provided for this policy."
      }
      breadcrumbItems={breadcrumbItems}
    />
  );
}
