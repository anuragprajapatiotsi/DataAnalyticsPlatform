"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end w-full">
        <Link href="/settings/organization-team-user-management/users/create">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            className="bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            Add User
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-[360px] group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <Search
              size={16}
              className="text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
          </div>
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search users..."
            className="h-9 pl-9 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all font-medium text-[13px] bg-white"
          />
        </div>

        <div className="flex items-center gap-3 bg-slate-50/50 px-3 py-1 rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">
            {isActive ? "Active" : "Archived"}
          </span>
          <Switch
            checked={!isActive}
            onCheckedChange={(checked) => onIsActiveChange(!checked)}
            className="h-5 w-9"
          />
        </div>
      </div>
    </div>
  );
}
