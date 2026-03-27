"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ExploreSidebar,
  type ExploreView,
} from "@/features/explore/components/ExploreSidebar";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active view from pathname
  const getActiveView = (): ExploreView => {
    const segments = pathname.split('/').filter(Boolean); // ['explore', 'databases', '...'] or ['explore']
    if (segments.length < 2) return "catalog";
    
    const viewSlug = segments[1];
    const viewMap: Record<string, ExploreView> = {
      pipelines: "pipelines",
      kpis: "kpis",
      files: "files",
      databases: "database",
      apis: "api",
      storages: "storages",
      messaging: "messaging",
      dashboards: "dashboards",
      "ml-models": "ml-models",
      metadata: "metadata",
      "object-resources": "object-resources",
      "data-assets": "data-assets",
      drives: "drives",
      "ftp-servers": "ftp-servers",
      drive: "drives",
    };

    return viewMap[viewSlug] || "catalog";
  };

  const activeView = getActiveView();
  const [activeCategory, setActiveCategory] = useState("database");

  const handleViewChange = (view: ExploreView) => {
    const routeMap: Record<string, string> = {
      database: "databases",
      api: "apis",
      pipelines: "pipelines",
      kpis: "kpis",
      files: "files",
      "object-resources": "object-resources",
      "data-assets": "data-assets",
      catalog: "",
    };
    const route = routeMap[view] || view;
    router.push(`/explore/${route}`);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-700 overflow-hidden">
      <div className="flex flex-1 min-h-0 bg-[#f8fafc]">
        {/* Left Sidebar Navigation */}
        <ExploreSidebar
          activeView={activeView}
          activeCategory={activeCategory}
          onViewChange={handleViewChange}
          onCategoryChange={setActiveCategory}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
