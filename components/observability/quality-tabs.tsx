"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QualityTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function QualityTabs({ activeTab, onTabChange }: QualityTabsProps) {
  return (
    <div className="border-b border-slate-200">
      <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
        <TabsTrigger
          value="test-cases"
          active={activeTab === "test-cases"}
          onClick={() => onTabChange("test-cases")}
          className={cn(
            "rounded-none border-b-2 bg-transparent px-1 py-3 text-sm font-semibold shadow-none",
            activeTab === "test-cases"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900",
          )}
        >
          Test Cases
        </TabsTrigger>
        <TabsTrigger
          value="test-suites"
          active={activeTab === "test-suites"}
          onClick={() => onTabChange("test-suites")}
          className={cn(
            "rounded-none border-b-2 bg-transparent px-1 py-3 text-sm font-semibold shadow-none",
            activeTab === "test-suites"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900",
          )}
        >
          Test Suites
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

import { cn } from "@/utils/cn";
