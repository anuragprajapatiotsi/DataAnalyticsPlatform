"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";

function subscribe() {
  return () => {};
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasMounted = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    if (hasMounted && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasMounted, isAuthenticated, isLoading, router]);

  if (!hasMounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

