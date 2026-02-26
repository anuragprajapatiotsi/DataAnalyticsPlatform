"use client";

import { useState } from "react";
import { ObservabilityHeader } from "@/components/observability/header";
import { QualityTabs } from "@/components/observability/quality-tabs";
import { QualityFilters } from "@/components/observability/quality-filters";
import { QualityMetrics } from "@/components/observability/quality-metrics";
import { QualityTable } from "@/components/observability/quality-table";

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
