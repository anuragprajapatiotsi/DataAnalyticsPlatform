"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authApi } from "@/shared/api/auth";
import { orgService } from "@/features/organizations/services/org.service";
import type {
  AuthUser,
  LoginRequest,
  Organization,
  SignupRequest,
  UpdateProfileRequest,
} from "@/shared/types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  isSwitchingOrg: boolean;
  organizations: Organization[];
  currentOrgId: string | null;
  errorMessage: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_QUERY_KEY = ["auth", "session"];

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const response = (error as {
    response?: {
      data?: {
        detail?: string;
        message?: string;
      };
    };
  }).response;

  return response?.data?.detail || response?.data?.message || fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });

  const setSessionTokens = useCallback(
    (accessToken: string, expiresIn: number) => {
      if (typeof window === "undefined") {
        return;
      }

      localStorage.setItem("token", accessToken);
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem("token_expiry", expiryTime.toString());
      setToken(accessToken);
      window.dispatchEvent(new Event("auth-token-updated"));
    },
    [],
  );

  const handleLogoutCleanup = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiry");
    }
    setToken(null);
    queryClient.cancelQueries();
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);

  useEffect(() => {
    // Listen for background token updates from axios interceptors
    const handleTokenUpdate = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("auth-token-updated", handleTokenUpdate);
    window.addEventListener("auth-logout", handleLogoutCleanup);
    return () => {
      window.removeEventListener("auth-token-updated", handleTokenUpdate);
      window.removeEventListener("auth-logout", handleLogoutCleanup);
    };
  }, [handleLogoutCleanup]);

  // Check for existing token and expiry on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const expiry = localStorage.getItem("token_expiry");

    if (token && expiry) {
      const now = Date.now();
      if (now > Number(expiry)) {
        const timer = setTimeout(handleLogoutCleanup, 0);
        return () => clearTimeout(timer);
      } else {
        // Set a timer for auto-logout
        const timeout = Number(expiry) - now;
        const timer = setTimeout(handleLogoutCleanup, timeout);
        return () => clearTimeout(timer);
      }
    }
  }, [token, handleLogoutCleanup]);

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  });

  const organizationsQuery = useQuery({
    queryKey: ["organizations", "switcher"],
    queryFn: orgService.getOrgs,
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  });

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
      setSessionTokens(data.access_token, data.expires_in);
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      router.push("/");
    },
    onError: (error: unknown) => {
      setErrorMessage(getApiErrorMessage(error, "Invalid credentials."));
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

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
    onError: (error: unknown) => {
      setErrorMessage(getApiErrorMessage(error, "Failed to update profile."));
    },
  });

  const switchOrgMutation = useMutation({
    mutationFn: authApi.switchOrg,
    onSuccess: async (data) => {
      setErrorMessage(null);
      setSessionTokens(data.access_token, data.expires_in);

      await queryClient.cancelQueries();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            !Array.isArray(query.queryKey) || query.queryKey[0] !== "auth",
        }),
      ]);
      router.refresh();
    },
    onError: (error: unknown) => {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to switch organization."),
      );
      throw error;
    },
  });

  const currentOrgId =
    sessionQuery.data?.default_org_id ||
    sessionQuery.data?.org_id ||
    organizationsQuery.data?.find((organization) => organization.is_default)?.id ||
    null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user: sessionQuery.data ?? null,
      organizations: organizationsQuery.data ?? [],
      currentOrgId,
      isAuthenticated: !!token,
      isLoading:
        (!!token && (sessionQuery.isLoading || sessionQuery.isFetching)) ||
        loginMutation.isPending ||
        signupMutation.isPending ||
        organizationsQuery.isLoading,
      isLoggingOut: logoutMutation.isPending,
      isSwitchingOrg: switchOrgMutation.isPending,
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
      switchOrg: async (orgId) => {
        if (!orgId || orgId === currentOrgId) {
          return;
        }
        await switchOrgMutation.mutateAsync(orgId);
      },
      updateProfile: async (payload) => {
        await updateProfileMutation.mutateAsync(payload);
      },
    }),
    [
      token,
      currentOrgId,
      errorMessage,
      loginMutation,
      logoutMutation,
      organizationsQuery.data,
      organizationsQuery.isLoading,
      sessionQuery.data,
      sessionQuery.isLoading,
      sessionQuery.isFetching,
      signupMutation,
      switchOrgMutation,
      updateProfileMutation,
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
