import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/csrf";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin." }, { status: 403 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
