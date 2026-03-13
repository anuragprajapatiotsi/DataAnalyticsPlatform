"use client";

import React, { useState } from "react";
import {
  ExploreSidebar,
  type ExploreView,
} from "@/features/explore/components/ExploreSidebar";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";

export default function ExplorePage() {
  const [activeView, setActiveView] = useState<ExploreView>("catalog");
  const [activeCategory, setActiveCategory] = useState("database");

  const catalogAssetViews: ExploreView[] = [
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
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-700 overflow-hidden">
      {/* Top Header Section - More compact and integrated */}
      <div className="px-6 pt-2 pb-2 border-b border-slate-200 flex-shrink-0">
        <PageHeader
          title="Explore"
          description="Browse and discover different data assets across your organization."
          breadcrumbItems={breadcrumbItems}
        />
      </div>

      <div className="flex flex-1 min-h-0 bg-[#f8fafc]">
        {/* Left Sidebar Navigation - Fixed width, no extra gap */}
        <ExploreSidebar
          activeView={activeView}
          activeCategory={activeCategory}
          onViewChange={setActiveView}
          onCategoryChange={setActiveCategory}
        />

        {/* Right Content Area - Expands to fill available space */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="h-full min-h-[600px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-12 text-center group transition-all duration-300 hover:border-slate-300 hover:shadow-md">
            {(activeView === "catalog" ||
              activeView === "data" ||
              catalogAssetViews.includes(activeView)) && (
              <>
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
                  <div className="w-10 h-10 border-2 border-dashed border-slate-300 rounded-full animate-[spin_10s_linear_infinite]" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Explore{" "}
                  {activeView === "catalog" || activeView === "data"
                    ? "Catalog"
                    : activeView.replace("-", " ").charAt(0).toUpperCase() +
                      activeView.replace("-", " ").slice(1)}
                </h3>
                <p className="max-w-md text-slate-500 text-sm leading-relaxed">
                  Select a data asset category from the left navigation to view
                  and manage your resources. Content for{" "}
                  <span className="font-semibold text-slate-700">
                    {activeView === "catalog" || activeView === "data"
                      ? "Data assets"
                      : activeView}
                  </span>{" "}
                  is coming soon.
                </p>
              </>
            )}

            {activeView === "drives" && (
              <>
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-500 text-indigo-600">
                  <div className="w-10 h-10 border-2 border-dashed border-indigo-300 rounded-lg animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Drives
                </h3>
                <p className="max-w-md text-slate-500 text-sm leading-relaxed">
                  Manage and explore your connected storage drives. Ready to sync and browse files.
                </p>
              </>
            )}

            {activeView === "ftp-servers" && (
              <>
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 group-hover:bg-amber-50 transition-all duration-500 text-amber-600">
                  <div className="w-10 h-10 border-2 border-dashed border-amber-300 rounded-lg animate-[spin_4s_linear_infinite]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  FTP Servers
                </h3>
                <p className="max-w-md text-slate-500 text-sm leading-relaxed">
                  Configure and access your FTP servers for secure file transfers and management.
                </p>
              </>
            )}

            {activeView === "kpis" && (
              <>
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 group-hover:bg-rose-50 transition-all duration-500 text-rose-600">
                  <div className="w-10 h-10 border-2 border-dashed border-rose-300 rounded-md animate-[bounce_2s_ease-in-out_infinite]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  KPIs
                </h3>
                <p className="max-w-md text-slate-500 text-sm leading-relaxed">
                  Monitor and analyze your key performance indicators. Real-time metrics and insights coming soon.
                </p>
              </>
            )}

            {activeView === "files" && (
              <>
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-500 text-emerald-600">
                  <div className="w-10 h-10 border-2 border-dashed border-emerald-300 rounded-md animate-[bounce_3s_ease-in-out_infinite]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Files</h3>
                <p className="max-w-md text-slate-500 text-sm leading-relaxed">
                  Files feature will be implemented later. It will provide a
                  secure way to manage enterprise data files.
                </p>
              </>
            )}

            <div className="mt-8 flex gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  activeView === "catalog" ||
                  activeView === "data" ||
                  catalogAssetViews.includes(activeView)
                    ? "bg-blue-600"
                    : activeView === "drives"
                      ? "bg-indigo-600"
                      : activeView === "ftp-servers"
                        ? "bg-amber-600"
                        : activeView === "kpis"
                          ? "bg-rose-600"
                          : "bg-emerald-600",
                )}
              />
              <div
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse delay-75",
                  activeView === "catalog" ||
                  activeView === "data" ||
                  catalogAssetViews.includes(activeView)
                    ? "bg-blue-400"
                    : activeView === "drives"
                      ? "bg-indigo-400"
                      : activeView === "ftp-servers"
                        ? "bg-amber-400"
                        : activeView === "kpis"
                          ? "bg-rose-400"
                          : "bg-emerald-400",
                )}
              />
              <div
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse delay-150",
                  activeView === "catalog" ||
                  activeView === "data" ||
                  catalogAssetViews.includes(activeView)
                    ? "bg-blue-200"
                    : activeView === "drives"
                      ? "bg-indigo-200"
                      : activeView === "ftp-servers"
                        ? "bg-amber-200"
                        : activeView === "kpis"
                          ? "bg-rose-200"
                          : "bg-emerald-200",
                )}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
