"use client";

import { ChevronDown, Filter, ListFilter, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useState } from "react";

const filterItems = [
  "Data Assets",
  "Domains",
  "Owners",
  "Tag",
  "Tier",
  "Certification",
  "Service",
  "Service Type",
];

export function AssetFilters() {
  const [isDeleted, setIsDeleted] = useState(false);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {filterItems.map((filter) => (
          <DropdownMenu key={filter}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-lg border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {filter}
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 max-h-80 overflow-y-auto z-50"
            >
              <DropdownMenuItem>Option 1</DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
              <DropdownMenuItem>Option 3</DropdownMenuItem>
              <DropdownMenuItem>Option 4</DropdownMenuItem>
              <DropdownMenuItem>Option 5</DropdownMenuItem>
              <DropdownMenuItem>Option 6</DropdownMenuItem>
              <DropdownMenuItem>Option 7</DropdownMenuItem>
              <DropdownMenuItem>Option 8</DropdownMenuItem>
              <DropdownMenuItem>Option 9</DropdownMenuItem>
              <DropdownMenuItem>Option 10</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      <div className="flex items-center gap-4 border-l border-slate-100 pl-4 ml-auto">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-semibold text-slate-500">Deleted</span>
          <div
            onClick={() => setIsDeleted(!isDeleted)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors duration-200",
              isDeleted ? "bg-blue-600" : "bg-slate-200",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                isDeleted ? "translate-x-4.5" : "translate-x-0.5",
              )}
            />
          </div>
        </label>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Filter className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Popularity
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Relevance</DropdownMenuItem>
              <DropdownMenuItem>Name</DropdownMenuItem>
              <DropdownMenuItem>Last Updated</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
