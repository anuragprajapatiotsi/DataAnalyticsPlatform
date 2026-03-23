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
  const activeView: ExploreView = pathname.includes("/databases") ? "database" : "catalog";
  const [activeCategory, setActiveCategory] = useState("database");

  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Explore", href: "/explore" },
  ];

  const handleViewChange = (view: ExploreView) => {
    if (view === "database") {
      router.push("/explore/databases");
    } else if (view === "catalog") {
      router.push("/explore");
    }
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
