"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";

export function UsersHeader() {
  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-slate-900 m-0">Users</h2>
        <p className="text-[14px] text-slate-500 m-0">
          View and manage regular users in your organization. For admin users,
          please visit the Admin page.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search for user..."
            className="w-[320px] h-10 pl-10 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <span className="text-[13px] text-slate-600 font-medium">
            Show Deleted
          </span>
          <Switch />
        </div>
      </div>
    </div>
  );
}
