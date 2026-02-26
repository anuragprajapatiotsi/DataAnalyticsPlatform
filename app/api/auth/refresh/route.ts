import { NextResponse } from "next/server";

import {
  backendAuthRequest,
  getRefreshTokenFromCookie,
  parseErrorMessage,
  setAuthCookiesFromPayload,
  type BackendSessionPayload,
} from "@/services/server/auth-proxy";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookie();
  if (!refreshToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const response = await backendAuthRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    return NextResponse.json({ message }, { status: response.status });
  }

  const payload = (await response.json()) as BackendSessionPayload;

  await setAuthCookiesFromPayload(payload);
  return NextResponse.json({ user: payload.user ?? null }, { status: 200 });
}
