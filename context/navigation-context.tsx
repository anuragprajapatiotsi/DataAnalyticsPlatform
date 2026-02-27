"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { navApi } from "@/services/api/nav";
import { useAuthContext } from "@/context/auth-context";
import type { NavItem } from "@/services/api/types";

interface NavigationContextValue {
  navItems: NavItem[];
  isLoading: boolean;
  isError: boolean;
  refetchNav: () => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined,
);

export const NAV_QUERY_KEY = ["navigation"];

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();

  const {
    data: navItems = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: NAV_QUERY_KEY,
    queryFn: () => navApi.getNav("primary"),
    enabled: isAuthenticated,
    staleTime: Infinity, // Cache globally, fetch once after login
  });

  const value: NavigationContextValue = {
    navItems,
    isLoading,
    isError,
    refetchNav: refetch,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
