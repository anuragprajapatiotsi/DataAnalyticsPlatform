"use client";

import React from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";

interface CatalogPageLayoutProps {
  title: string;
  description: string;
  breadcrumbItems: { label: string; href?: string }[];
  tabs?: { id: string; label: string; icon?: any; count?: number }[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  toolbar?: React.ReactNode;
}

export function CatalogPageLayout({
  title,
  description,
  breadcrumbItems,
  tabs = [],
  activeTab,
  onTabChange,
  children,
  headerActions,
  toolbar,
}: CatalogPageLayoutProps) {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 bg-white border-b border-slate-200 shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <PageHeader
              title={title}
              description={description}
              breadcrumbItems={breadcrumbItems}
            />
            {headerActions && <div>{headerActions}</div>}
          </div>

          {/* Unified Tab Navigation */}
          {tabs.length > 0 && (
            <div className="flex gap-8 mt-2">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "pb-3 text-[13px] font-semibold transition-all relative cursor-pointer flex items-center gap-2",
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300",
                  )}
                >
                  {tab.icon && (
                    <tab.icon
                      size={14}
                      className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"}
                    />
                  )}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-4 h-full">
          {toolbar && (
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
              {toolbar}
            </div>
          )}
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
