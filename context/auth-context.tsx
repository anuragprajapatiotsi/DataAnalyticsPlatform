"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authApi } from "@/services/api/auth";
import type {
  AuthUser,
  LoginRequest,
  SignupRequest,
} from "@/services/api/types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  errorMessage: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_QUERY_KEY = ["auth", "session"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Listen for background token updates from axios interceptors
    const handleTokenUpdate = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("auth-token-updated", handleTokenUpdate);
    return () => {
      window.removeEventListener("auth-token-updated", handleTokenUpdate);
    };
  }, []);

  // Check for existing token and expiry on mount
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    const expiry = localStorage.getItem("token_expiry");

    if (token && expiry) {
      const now = Date.now();
      if (now > Number(expiry)) {
        handleLogoutCleanup();
      } else {
        // Set a timer for auto-logout
        const timeout = Number(expiry) - now;
        const timer = setTimeout(handleLogoutCleanup, timeout);
        return () => clearTimeout(timer);
      }
    }
  }, [token, isMounted]);

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: isMounted && !!token,
  });

  const handleLogoutCleanup = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiry");
    }
    setToken(null);
    queryClient.cancelQueries();
    queryClient.clear();
    router.replace("/login");
  };

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      handleLogoutCleanup();
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      setErrorMessage(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
        const expiryTime = Date.now() + data.expires_in * 1000;
        localStorage.setItem("token_expiry", expiryTime.toString());

        // Setup auto-logout timer
        setTimeout(handleLogoutCleanup, data.expires_in * 1000);
      }
      setToken(data.access_token);
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      router.push("/");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Invalid credentials.";
      setErrorMessage(message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      setErrorMessage(null);
      router.replace("/login");
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign up.",
      );
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: sessionQuery.data ?? null,
      isAuthenticated: !!token,
      isLoading:
        !isMounted ||
        (!!token && (sessionQuery.isLoading || sessionQuery.isFetching)) ||
        loginMutation.isPending ||
        signupMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
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
    }),
    [
      isMounted,
      token,
      errorMessage,
      loginMutation,
      logoutMutation,
      sessionQuery.data,
      sessionQuery.isLoading,
      sessionQuery.isFetching,
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
