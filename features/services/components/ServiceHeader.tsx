"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "antd";
import { GetServicesParams } from "../types";

interface ServiceHeaderProps {
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export function ServiceHeader({ onSearchChange, onAddClick }: ServiceHeaderProps) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="relative flex-1 max-w-[410px] group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <Search
            size={16}
            className="text-slate-400 group-focus-within:text-blue-500 transition-colors"
          />
        </div>
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search services..."
          className="h-9 pl-9 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all font-medium text-[13px] bg-white"
        />
      </div>

      <Button
        type="primary"
        icon={<Plus size={16} />}
        onClick={onAddClick}
        className="bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2"
      >
        Add Service
      </Button>
    </div>
  );
}
