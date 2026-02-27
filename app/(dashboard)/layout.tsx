"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { ProtectedRoute } from "@/components/auth/protected-route";

import { NavigationProvider } from "@/context/navigation-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <NavigationProvider>
        <div className="flex h-screen overflow-hidden bg-slate-100">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-r from-[#dbe8ff] via-[#eaf1ff] to-[#f5f9ff]">
            <Topbar />
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </NavigationProvider>
    </ProtectedRoute>
  );
}
