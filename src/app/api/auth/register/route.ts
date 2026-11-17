import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/csrf";
import { setSessionCookie } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils";
import { registerCustomer } from "@/services/auth-service";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  username: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(120),
  password: z.string().min(1).max(200),
  redirect: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin." }, { status: 403 });
  }

  let payload: z.infer<typeof registerSchema>;
  try {
    payload = registerSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Please enter a valid username, email, and password." },
      { status: 400 },
    );
  }

  try {
    const result = await registerCustomer({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });
    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Unable to create account." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      redirect: safeRedirectPath(payload.redirect),
    });
    setSessionCookie(response, result.user);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to create account. Please try again later." },
      { status: 500 },
    );
  }
}
