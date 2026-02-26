import { NextResponse } from "next/server";

import {
  backendAuthRequest,
  parseErrorMessage,
  setAuthCookiesFromPayload,
  type BackendSessionPayload,
} from "@/services/server/auth-proxy";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await backendAuthRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    return NextResponse.json({ message }, { status: response.status });
  }

  const payload = (await response.json()) as BackendSessionPayload;

  await setAuthCookiesFromPayload(payload);

  return NextResponse.json({ user: payload.user ?? null }, { status: 201 });
}
