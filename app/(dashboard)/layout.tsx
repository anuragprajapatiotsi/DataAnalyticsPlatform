"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/shared/components/layout/sidebar";
import { Topbar } from "@/shared/components/layout/topbar";
import { ProtectedRoute } from "@/shared/components/auth/protected-route";

import { NavigationProvider } from "@/shared/contexts/navigation-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <NavigationProvider>
        <div className="flex h-screen overflow-hidden bg-slate-100">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col bg-[#f8fafc]">
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
