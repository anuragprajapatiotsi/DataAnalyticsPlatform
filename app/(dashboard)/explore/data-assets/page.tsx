"use client";

import { useState } from "react";
import { AlertBanner } from "@/features/catalog/components/AlertBanner";
import { AssetSidebar } from "@/features/catalog/components/AssetSidebar";
import { AssetFilters } from "@/features/catalog/components/AssetFilters";
import { EmptyState } from "@/features/catalog/components/EmptyState";

export default function ExploreDataAssetsPage() {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
      {hasError && <AlertBanner onClose={() => setHasError(false)} />}

      <div className="grid grid-cols-[280px_1fr] md:gap-6 p-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <AssetSidebar />

        {/* Main Content Area */}
        <div className="flex flex-col h-full min-w-0 space-y-4 overflow-hidden">
          <div className="shrink-0">
            <AssetFilters />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-2xl border border-dashed border-slate-200 bg-white shadow-inner flex flex-col items-center justify-center p-8">
            <EmptyState />
          </div>
        </div>
      </div>
    </div>
  );
}

