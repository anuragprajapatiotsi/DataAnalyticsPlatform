import { NextResponse } from "next/server";

import {
  backendAuthRequest,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  parseErrorMessage,
  setAuthCookiesFromPayload,
} from "@/services/server/auth-proxy";

async function fetchCurrentUser(accessToken: string) {
  return backendAuthRequest("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function GET() {
  const accessToken = await getAccessTokenFromCookie();

  if (accessToken) {
    const meResponse = await fetchCurrentUser(accessToken);
    if (meResponse.ok) {
      const payload = (await meResponse.json()) as {
        user?: { id: string; email: string; name?: string };
      };
      return NextResponse.json({ user: payload.user ?? null }, { status: 200 });
    }
  }

  const refreshToken = await getRefreshTokenFromCookie();
  if (!refreshToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const refreshResponse = await backendAuthRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshResponse.ok) {
    const message = await parseErrorMessage(refreshResponse);
    return NextResponse.json({ message }, { status: 401 });
  }

  const refreshPayload = (await refreshResponse.json()) as {
    user?: { id: string; email: string; name?: string };
    accessToken?: string;
    refreshToken?: string;
  };

  await setAuthCookiesFromPayload(refreshPayload);
  return NextResponse.json({ user: refreshPayload.user ?? null }, { status: 200 });
}
