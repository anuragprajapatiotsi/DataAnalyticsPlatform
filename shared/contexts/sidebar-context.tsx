"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState<string | null>(null);

  useEffect(() => {
    // Only trigger collapse/expand when crossing the boundary of the /explore scope
    const isExplore = pathname?.startsWith("/explore");
    const wasExplore = lastPathname?.startsWith("/explore");

    if (isExplore && !wasExplore) {
      setCollapsed(true);
    } else if (!isExplore && wasExplore) {
      setCollapsed(false);
    }
    
    setLastPathname(pathname);
  }, [pathname, lastPathname]);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
