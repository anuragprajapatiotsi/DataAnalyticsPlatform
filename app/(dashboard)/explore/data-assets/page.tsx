"use client";

import { useState } from "react";
import { AlertBanner } from "@/features/catalog/components/AlertBanner";
import { AssetSidebar } from "@/features/catalog/components/AssetSidebar";
import { AssetFilters } from "@/features/catalog/components/AssetFilters";
import { EmptyState } from "@/features/catalog/components/EmptyState";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function ExploreDataAssetsPage() {
  const [hasError, setHasError] = useState(false);

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Explore", href: "/explore/data-assets" },
    { label: "Data Assets" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50/50">
      {hasError && <AlertBanner onClose={() => setHasError(false)} />}

      <div className="flex h-full min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <AssetSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <div className="px-6 pt-2 pb-2">
            <PageHeader
              title="Explore"
              description="Discover and manage your data assets across the organization."
              breadcrumbItems={breadcrumbItems}
            />
          </div>

          <div className="flex flex-1 flex-col h-full min-w-0 space-y-4 overflow-hidden p-4 pt-2">
            <div className="shrink-0">
              <AssetFilters />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-lg border border-dashed border-slate-200 bg-white shadow-inner flex flex-col items-center justify-center p-8">
              <EmptyState />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
