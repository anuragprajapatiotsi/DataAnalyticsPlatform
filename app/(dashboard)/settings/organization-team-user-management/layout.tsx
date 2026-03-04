"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function OrganizationManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="h-full overflow-y-auto px-6 py-6 pb-20 custom-scrollbar animate-in fade-in duration-500">
      <div className="w-full">
        {/* Page Header is now handled by individual pages for layout consistency */}

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
