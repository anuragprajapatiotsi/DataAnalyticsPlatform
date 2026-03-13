"use client";

import { useState } from "react";
import { ObservabilityHeader } from "@/features/observability/components/header";
import { QualityTabs } from "@/features/observability/components/quality-tabs";
import { QualityFilters } from "@/features/observability/components/quality-filters";
import { QualityMetrics } from "@/features/observability/components/quality-metrics";
import { QualityTable } from "@/features/observability/components/quality-table";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function DataQualityPage() {
  const [activeTab, setActiveTab] = useState("test-cases");

  const breadcrumbItems = [
    { label: "Observability", href: "/observability" },
    { label: "Data Quality" },
  ];

  return (
    <div className="flex flex-col px-6 pt-2 pb-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto">
      <PageHeader
        title="Data Quality"
        description="Build trust in your data with quality tests and create reliable data products."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="space-y-6">
        <QualityTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <QualityFilters />

        <QualityMetrics />

        <QualityTable />
      </div>
    </div>
  );
}
