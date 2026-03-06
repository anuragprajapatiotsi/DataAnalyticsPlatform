"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { message } from "antd";
import { parseError } from "@/shared/utils/error-handler";

import { AuthProvider } from "@/shared/contexts/auth-context";
import { SidebarProvider } from "@/shared/contexts/sidebar-context";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any, query) => {
            // Only show toast for queries that don't have their own error handling
            // and are not 401s (already handled by axios interceptor)
            const parsed = parseError(error);
            if (error?.status !== 401 && !query.meta?.errorMessage) {
              // We could show a toast here, but usually page-level errors are better
              // for queries. Mutations ALWAYS get a toast.
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any, _variables, _context, mutation) => {
            // error is already parsed by axios interceptor
            const status = error.status || (error as any).response?.status;

            // Skip if 401 (handled by axios refresh logic) or if mutation meta suppresses global message
            if (status !== 401 && mutation.meta?.showGlobalError !== false) {
              message.error(error.message || "An unexpected error occurred");
            }
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AuthProvider>{children}</AuthProvider>
      </SidebarProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
