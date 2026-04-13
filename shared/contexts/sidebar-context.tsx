"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const previousAutoCollapseRef = useRef<boolean | null>(null);
  const wasAutoCollapsedRef = useRef(false);
  const pendingFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const isExploreOrSql =
      pathname?.startsWith("/explore") || pathname?.startsWith("/sql-editor");
    const isChatbotDetail = /^\/chatbot\/[^/]+$/.test(pathname || "");
    const shouldAutoCollapse = Boolean(isExploreOrSql || isChatbotDetail);

    if (pendingFrameRef.current !== null) {
      cancelAnimationFrame(pendingFrameRef.current);
      pendingFrameRef.current = null;
    }

    if (shouldAutoCollapse && !wasAutoCollapsedRef.current) {
      previousAutoCollapseRef.current = collapsed;
      pendingFrameRef.current = requestAnimationFrame(() => {
        setCollapsed(true);
        pendingFrameRef.current = null;
      });
      wasAutoCollapsedRef.current = true;
    } else if (!shouldAutoCollapse && wasAutoCollapsedRef.current) {
      if (previousAutoCollapseRef.current !== null) {
        const nextCollapsedState = previousAutoCollapseRef.current;
        pendingFrameRef.current = requestAnimationFrame(() => {
          setCollapsed(nextCollapsedState);
          pendingFrameRef.current = null;
        });
      }
      previousAutoCollapseRef.current = null;
      wasAutoCollapsedRef.current = false;
    }

    return () => {
      if (pendingFrameRef.current !== null) {
        cancelAnimationFrame(pendingFrameRef.current);
        pendingFrameRef.current = null;
      }
    };
  }, [collapsed, pathname]);

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
