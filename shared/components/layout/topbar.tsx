"use client";

import Link from "next/link";
import { Bell, ChevronDown, Menu } from "lucide-react";

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/40 bg-white/60 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="lg:hidden">
          <Menu className="h-4 w-4" />
        </Button>
        <p className="text-sm font-medium text-slate-600">
          Metadata Intelligence Dashboard
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* <CustomSelect
          options={languages}
          value="en"
          className="h-9 min-w-32 rounded-lg"
        /> */}

        {/* <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
        </button> */}

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

