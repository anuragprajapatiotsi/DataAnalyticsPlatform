"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Search, Plus } from "lucide-react";
import { Button } from "antd";

interface UsersHeaderProps {
  onSearchChange: (value: string) => void;
  isActive: boolean;
  onIsActiveChange: (checked: boolean) => void;
}

export function UsersHeader({
  onSearchChange,
  isActive,
  onIsActiveChange,
}: UsersHeaderProps) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  return (
    <div className="flex flex-col gap-8 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold text-slate-900 m-0 tracking-tight">
            Users
          </h1>
          <p className="text-[13px] text-slate-500 font-medium max-w-[600px]">
            View and manage regular users in your organization. For admin users,
            please visit the Admin page.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
        >
          Add User
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-[400px] group">
          <div className="absolute left-3.5 top-0 bottom-0 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for User..."
            className="h-11 pl-10 rounded-xl border-slate-200 shadow-none focus-visible:ring-2 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 transition-all font-medium text-slate-900 bg-slate-50/30 hover:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            {isActive ? "Active" : "Deleted"}
          </span>
          <Switch
            checked={!isActive}
            onCheckedChange={(checked) => onIsActiveChange(!checked)}
            className="h-5 w-9 data-[state=checked]:bg-red-500"
          />
        </div>
      </div>
    </div>
  );
}
