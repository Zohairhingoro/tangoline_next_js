import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/csrf";
import { setSessionCookie } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils";
import { authenticateUser } from "@/services/auth-service";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
  redirect: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin." }, { status: 403 });
  }

  let payload: z.infer<typeof loginSchema>;
  try {
    payload = loginSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Please enter your username/email and password." },
      { status: 400 },
    );
  }

  try {
    const result = await authenticateUser(payload.identifier, payload.password);
    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Unable to log in." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      redirect: safeRedirectPath(payload.redirect),
      name: result.user.name,
    });
    setSessionCookie(response, result.user);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to log in. Please try again later." },
      { status: 500 },
    );
  }
}
