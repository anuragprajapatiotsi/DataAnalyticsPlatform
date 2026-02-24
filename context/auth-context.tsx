"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/services/api/auth";
import type { AuthUser, LoginRequest, SignupRequest } from "@/services/api/types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_QUERY_KEY = ["auth", "session"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setErrorMessage(null);
      queryClient.setQueryData(SESSION_QUERY_KEY, data);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to login.");
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      setErrorMessage(null);
      queryClient.setQueryData(SESSION_QUERY_KEY, data);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign up.");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.setQueryData(SESSION_QUERY_KEY, { user: null });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to logout.");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: authApi.refresh,
    onSuccess: (data) => {
      setErrorMessage(null);
      queryClient.setQueryData(SESSION_QUERY_KEY, data);
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: sessionQuery.data?.user ?? null,
      isAuthenticated: Boolean(sessionQuery.data?.user),
      isLoading:
        sessionQuery.isLoading ||
        loginMutation.isPending ||
        signupMutation.isPending ||
        logoutMutation.isPending ||
        refreshMutation.isPending,
      errorMessage,
      login: async (payload) => {
        await loginMutation.mutateAsync(payload);
      },
      signup: async (payload) => {
        await signupMutation.mutateAsync(payload);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
      refreshSession: async () => {
        await refreshMutation.mutateAsync();
      },
    }),
    [
      errorMessage,
      loginMutation,
      logoutMutation,
      refreshMutation,
      sessionQuery.data?.user,
      sessionQuery.isLoading,
      signupMutation,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider.");
  }
  return context;
}
