"use client";

import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";

export function QualityFilters() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1 rounded-lg border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Advanced
          <ChevronRight className="h-3 w-3" />
        </Button>

        <div className="flex items-center gap-2">
          <CustomSelect
            options={[{ label: "Table", value: "table" }]}
            placeholder="Table"
            className="w-32"
          />
          <CustomSelect
            options={[{ label: "Type", value: "type" }]}
            placeholder="Type"
            className="w-32"
          />
          <CustomSelect
            options={[{ label: "Status", value: "status" }]}
            placeholder="Status"
            className="w-32"
          />
          <CustomSelect
            options={[{ label: "Tags", value: "tags" }]}
            placeholder="Tags"
            className="w-32"
          />
        </div>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search test case"
          className="pl-9 h-9 rounded-lg border-slate-200 text-xs focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
