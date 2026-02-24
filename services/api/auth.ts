import type {
  AuthMessageResponse,
  LoginRequest,
  SessionResponse,
  SignupRequest,
} from "@/services/api/types";

type ApiErrorPayload = {
  message?: string;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | ApiErrorPayload
      | null;
    throw new Error(payload?.message ?? "Unexpected authentication error.");
  }

  return (await response.json()) as T;
}

export const authApi = {
  login(payload: LoginRequest) {
    return request<SessionResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  signup(payload: SignupRequest) {
    return request<SessionResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  refresh() {
    return request<SessionResponse>("/api/auth/refresh", {
      method: "POST",
    });
  },
  me() {
    return request<SessionResponse>("/api/auth/me", {
      method: "GET",
      cache: "no-store",
    });
  },
  logout() {
    return request<AuthMessageResponse>("/api/auth/logout", {
      method: "POST",
    });
  },
};
