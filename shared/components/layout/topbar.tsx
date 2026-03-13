"use client";

import Link from "next/link";
import { Bell, ChevronDown, Menu, Search, MessageSquareMore } from "lucide-react";

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
            <button className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white pl-1 pr-2 hover:bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500">
              <Avatar className="h-7 w-7">
                {user?.image && (
                  <AvatarImage src={user.image} alt={user.display_name} />
                )}
                <AvatarFallback className="bg-blue-600 text-[10px] text-white">
                  {user?.display_name
                    ? user.display_name.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/settings/members" className="w-full cursor-pointer">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

