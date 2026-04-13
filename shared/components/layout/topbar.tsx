"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Select } from "antd";
import { ChevronDown, Menu, Search, MessageSquareMore, UserCircle, Settings, LogOut } from "lucide-react";

import { ChatQuickDrawer } from "@/features/chatbot/components/ChatQuickDrawer";
import { NotificationMenu } from "@/features/notifications/components/notification-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "@/shared/hooks/use-auth";

export function Topbar() {
  const pathname = usePathname();
  const [isChatQuickDrawerOpen, setIsChatQuickDrawerOpen] = React.useState(false);
  const {
    user,
    organizations,
    currentOrgId,
    switchOrg,
    isSwitchingOrg,
    logout,
    isLoggingOut,
  } = useAuth();

  const orgOptions = organizations
    .filter((organization) => organization.is_active)
    .map((organization) => ({
    label: organization.name,
    value: organization.id,
    }));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="lg:hidden shrink-0">
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center">
          <div className="relative group w-80 md:w-[500px] lg:w-[600px] transition-all duration-300">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              className="h-9 w-full rounded-lg border-slate-200 bg-slate-100 pl-10 pr-12 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white transition-all"
              placeholder="Search users, teams, roles, policies..."
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-medium text-slate-400 select-none pointer-events-none">
              <span className="text-[11px]">⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        <div className="hidden min-w-[220px] md:block">
          <Select
            value={currentOrgId ?? undefined}
            options={orgOptions}
            onChange={(value) => void switchOrg(value)}
            loading={isSwitchingOrg}
            disabled={isSwitchingOrg || orgOptions.length === 0}
            placeholder="Select organization"
            className="w-full org-switcher-select"
            showSearch
            optionFilterProp="label"
            suffixIcon={<ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            notFoundContent="No organizations found"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationMenu />

        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${
            pathname.startsWith("/chatbot")
              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          onClick={() => setIsChatQuickDrawerOpen(true)}
        >
          <MessageSquareMore className="h-4 w-4" />
          <span className="font-medium">Chatbot</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2.5 rounded-full p-0.5 pr-2 transition-all hover:bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95">
              <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm border border-slate-200">
                {user?.image && (
                  <AvatarImage src={user.image} alt={user.display_name} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-[11px] font-bold text-white">
                  {user?.display_name
                    ? user.display_name.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {user?.display_name || "User"}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-slate-200/60">
            <div className="px-2.5 py-2 mb-1.5 rounded-md bg-slate-50/50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Account</p>
              <p className="text-sm font-bold text-slate-800 truncate">{user?.display_name || "Active User"}</p>
              <p className="text-[11px] text-slate-500 truncate font-medium">{user?.email || "user@example.com"}</p>
            </div>
            
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded hover:bg-slate-50 group">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <UserCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">My Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded hover:bg-slate-50 group">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
            
            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded text-red-600 hover:bg-red-50 focus:bg-red-50 group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                {isLoggingOut ? "Logging out..." : "Sign out"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChatQuickDrawer
        open={isChatQuickDrawerOpen}
        onClose={() => setIsChatQuickDrawerOpen(false)}
      />

      <style jsx global>{`
        .org-switcher-select .ant-select-selector {
          height: 36px !important;
          border-radius: 10px !important;
          border-color: #e2e8f0 !important;
          background: #f8fafc !important;
          box-shadow: none !important;
        }
        .org-switcher-select .ant-select-selection-item {
          line-height: 34px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #334155 !important;
        }
        .org-switcher-select.ant-select-focused .ant-select-selector,
        .org-switcher-select .ant-select-selector:hover {
          border-color: #93c5fd !important;
          background: #ffffff !important;
        }
      `}</style>
    </header>
  );
}
