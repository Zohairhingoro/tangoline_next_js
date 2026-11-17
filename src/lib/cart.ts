import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const CART_SESSION_COOKIE = "tangoline_cart_session";
const MAX_AGE = 60 * 60 * 24 * 30;

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export async function getCartIdentity(): Promise<{
  sessionId: string;
  userId: number | null;
  isNew: boolean;
}> {
  const store = await cookies();
  const existing = store.get(CART_SESSION_COOKIE)?.value;
  const valid = existing && SESSION_ID_PATTERN.test(existing);
  const sessionId = valid ? existing : randomUUID();
  const user = await getSession();

  return {
    sessionId,
    userId: user?.role === "customer" ? user.id : null,
    isNew: !valid,
  };
}

export function setCartSessionCookie(
  response: NextResponse,
  sessionId: string,
): void {
  response.cookies.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}
