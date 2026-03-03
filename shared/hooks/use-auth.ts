"use client";

import { useAuthContext } from "@/shared/contexts/auth-context";

export function useAuth() {
  return useAuthContext();
}

