"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { Plus, Search, TrendingUp } from "lucide-react";
import {
  ExploreSidebar,
  type ExploreView,
} from "@/features/explore/components/ExploreSidebar";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";

export default function ExplorePage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Explore" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white animate-in fade-in duration-500 overflow-hidden relative">
      {/* Header Area */}
      <div className="px-6 py-5 bg-white border-b border-slate-100 shrink-0">
        <PageHeader
          title="Discovery Catalog"
          description="Browse and discover different data assets across your organization."
          breadcrumbItems={breadcrumbItems}
        />
      </div>

      {/* Centered Empty State Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FAFAFA]/50 group transition-all duration-300">
        <div className="relative mb-8">
          {/* Animated Background Ring */}
          <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-2xl scale-150 animate-pulse duration-[4s]" />
          
          <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-100 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500">
            <div className="w-12 h-12 border-[3px] border-dashed border-slate-200 rounded-full animate-[spin_12s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="text-blue-600 opacity-20 group-hover:opacity-40 transition-opacity" size={32} />
            </div>
          </div>
        </div>

        <div className="max-w-md text-center space-y-3">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            Begin Your Discovery
          </h3>
          <p className="text-slate-500 text-[15px] leading-relaxed">
            Select an asset category from the sidebar to start exploring your organization's data landscape.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="mt-10 flex items-center gap-6 py-3 px-6 bg-white rounded-full border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Systems Active</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-2">
            <TrendingUp size={12} className="text-blue-500" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Real-time Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
