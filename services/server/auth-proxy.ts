import { cookies } from "next/headers";

import type { AuthUser } from "@/services/api/types";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

type BackendSessionPayload = {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
};

type AuthBackendError = {
  message?: string;
};

export async function backendAuthRequest(
  endpoint: string,
  init: RequestInit,
): Promise<Response> {
  const authApiBaseUrl = process.env.AUTH_API_BASE_URL;
  if (!authApiBaseUrl) {
    throw new Error("AUTH_API_BASE_URL is not configured.");
  }

  return fetch(`${authApiBaseUrl}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function parseErrorMessage(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as
    | AuthBackendError
    | null;
  return payload?.message ?? "Authentication request failed.";
}

export async function setAuthCookiesFromPayload(payload: BackendSessionPayload) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  if (payload.accessToken) {
    cookieStore.set(ACCESS_COOKIE, payload.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_MAX_AGE,
    });
  }

  if (payload.refreshToken) {
    cookieStore.set(REFRESH_COOKIE, payload.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAccessTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value;
}
