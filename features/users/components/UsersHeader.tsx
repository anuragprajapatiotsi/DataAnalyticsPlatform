"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Search, Plus, Filter, RotateCcw } from "lucide-react";
import { Button, Popover, Select } from "antd";
import { GetUserParams, UserTeam, UserRole, UserPolicy } from "../types";

interface UsersHeaderProps {
  onSearchChange: (value: string) => void;
  filters: GetUserParams;
  onFiltersChange: (newFilters: Partial<GetUserParams>) => void;
  teams: UserTeam[];
  roles: UserRole[];
  policies: UserPolicy[];
  domains: { label: string; value: string }[];
}

export function UsersHeader({
  onSearchChange,
  filters,
  onFiltersChange,
  teams,
  roles,
  policies,
  domains,
}: UsersHeaderProps) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    // Only trigger search if value changed or if it's not the initial mount with empty string
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  const advancedFiltersContent = (
    <div className="w-[calc(100vw-48px)] max-w-[500px] flex flex-col bg-white overflow-hidden shadow-2xl rounded-xl border border-slate-200">
      {/* Content Area - Scrollable for safety */}
      <div 
        className="p-2 flex flex-col gap-4 overflow-y-auto custom-scrollbar"
        style={{ maxHeight: 'min(500px, 75vh)' }}
      >
        {/* Top Row: Boolean Switches in 2 Columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold text-slate-600">Admin Access</span>
            <Switch
              checked={!!filters.is_admin}
              onCheckedChange={(checked) => onFiltersChange({ is_admin: checked })}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold text-slate-600">Verified Email</span>
            <Switch
              checked={!!filters.is_verified}
              onCheckedChange={(checked) => onFiltersChange({ is_verified: checked })}
            />
          </div>
        </div>


        {/* Dynamic Filters 2x2 Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 underline decoration-slate-200 underline-offset-4 uppercase tracking-wider px-0.5">Team</label>
            <Select
              placeholder="All Teams"
              className="w-full custom-select-compact"
              value={filters.team_id}
              onChange={(val) => onFiltersChange({ team_id: val })}
              allowClear
              options={teams.map(t => ({ label: t.display_name || t.name, value: t.id }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 underline decoration-slate-200 underline-offset-4 uppercase tracking-wider px-0.5">Role</label>
            <Select
              placeholder="All Roles"
              className="w-full custom-select-compact"
              value={filters.role_id}
              onChange={(val) => onFiltersChange({ role_id: val })}
              allowClear
              options={roles.map(r => ({ label: r.display_name || r.name, value: r.id }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 underline decoration-slate-200 underline-offset-4 uppercase tracking-wider px-0.5">Policy</label>
            <Select
              placeholder="All Policies"
              className="w-full custom-select-compact"
              value={filters.policy_id}
              onChange={(val) => onFiltersChange({ policy_id: val })}
              allowClear
              options={policies.map(p => ({ label: p.name, value: p.id }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 underline decoration-slate-200 underline-offset-4 uppercase tracking-wider px-0.5">Domain</label>
            <Select
              placeholder="All Domains"
              className="w-full custom-select-compact"
              value={filters.domain_id}
              onChange={(val) => onFiltersChange({ domain_id: val })}
              allowClear
              options={domains}
            />
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-2 flex items-center justify-between">
        <p className="text-[11px] text-slate-400 font-medium">Clear all active filters</p>
        <Button
          type="text"
          danger
          size="small"
          icon={<RotateCcw size={12} />}
          onClick={() => onFiltersChange({
            is_admin: undefined,
            is_verified: undefined,
            team_id: undefined,
            role_id: undefined,
            policy_id: undefined,
            domain_id: undefined,
          })}
          className="flex items-center gap-1.5 font-bold text-[11px] h-7 hover:bg-red-50 px-3 cursor-pointer"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-6">
        {/* Search */}
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
            placeholder="Search users..."
            className="h-9 pl-9 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all font-medium text-[13px] bg-white"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Active Toggle */}
          <div className="flex items-center gap-3 bg-slate-50/50 px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">
              {filters.is_active ? "Active" : "Archived"}
            </span>

            <Switch
              checked={!filters.is_active}
              onCheckedChange={(checked) => onFiltersChange({ is_active: !checked })}
            />
          </div>

          {/* Advanced Filters Popover */}
          <Popover
            content={advancedFiltersContent}
            title={<span className="px-2 py-1.5 font-bold text-slate-800 border-b border-slate-100 block">Advanced Filters</span>}
            trigger="click"
            placement="bottomRight"
            styles={{ content: { padding: 0 } }}
          >
            <Button
              className="h-9 px-4 rounded-lg border-slate-200 flex items-center gap-2 font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-200"
              icon={<Filter size={16} />}
            >
              Filters
              {(filters.is_admin !== undefined || 
                filters.is_verified !== undefined || 
                filters.team_id || 
                filters.role_id || 
                filters.policy_id || 
                filters.domain_id) && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  !
                </span>
              )}
            </Button>
          </Popover>

          {/* Add User */}
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
      </div>
    </div>
  );
}
