"use client";

import { useState } from "react";
import { ObservabilityHeader } from "@/features/observability/components/header";
import { QualityTabs } from "@/features/observability/components/quality-tabs";
import { QualityFilters } from "@/features/observability/components/quality-filters";
import { QualityMetrics } from "@/features/observability/components/quality-metrics";
import { QualityTable } from "@/features/observability/components/quality-table";

export default function DataQualityPage() {
  const [activeTab, setActiveTab] = useState("test-cases");

  return (
    <div className="space-y-6">
      <ObservabilityHeader
        title="Data Quality"
        subtitle="Build trust in your data with quality tests and create reliable data products."
      />

      <QualityTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <QualityFilters />

      <QualityMetrics />

      <QualityTable />
    </div>
  );
}

