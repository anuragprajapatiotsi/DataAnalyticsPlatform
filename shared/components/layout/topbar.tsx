"use client";

import Link from "next/link";
import { ChevronDown, Menu, Search, MessageSquareMore, UserCircle, Settings, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { CustomSelect } from "@/shared/components/ui/custom-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "@/shared/hooks/use-auth";

const languages = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
];

export function Topbar() {
  const { user, logout, isLoggingOut } = useAuth();

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
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
    </header>
  );
}

