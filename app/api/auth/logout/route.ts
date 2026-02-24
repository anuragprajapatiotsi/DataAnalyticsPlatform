import { NextResponse } from "next/server";

import {
  backendAuthRequest,
  clearAuthCookies,
  getRefreshTokenFromCookie,
} from "@/services/server/auth-proxy";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookie();
  if (refreshToken) {
    await backendAuthRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null);
  }

  await clearAuthCookies();
  return NextResponse.json({ message: "Logged out successfully." }, { status: 200 });
}
