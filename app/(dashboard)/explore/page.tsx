"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { Plus } from "lucide-react";
import {
  ExploreSidebar,
  type ExploreView,
} from "@/features/explore/components/ExploreSidebar";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";

export default function ExplorePage() {
  const catalogAssetViews: string[] = [
    "database",
    "api",
    "messaging",
    "dashboards",
    "pipelines",
    "ml-models",
    "storages",
    "metadata",
  ];

  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Explore" },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="px-4 pt-4 pb-4 bg-white border-b border-slate-200">
        <PageHeader
          title="Explore Catalog"
          description="Browse and discover different data assets across your organization."
          breadcrumbItems={breadcrumbItems}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center group transition-all duration-300">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
          <div className="w-10 h-10 border-2 border-dashed border-slate-300 rounded-full animate-[spin_10s_linear_infinite]" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Explore Catalog
        </h3>
        <p className="max-w-md text-slate-500 text-sm leading-relaxed">
          Select a data asset category from the left navigation to view
          and manage your resources. Explore your existing data landscape.
        </p>

        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse bg-blue-600" />
          <div className="w-2 h-2 rounded-full animate-pulse delay-75 bg-blue-400" />
          <div className="w-2 h-2 rounded-full animate-pulse delay-150 bg-blue-200" />
        </div>
      </div>
    </div>
  );
}
