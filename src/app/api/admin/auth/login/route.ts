import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/csrf";
import { setSessionCookie } from "@/lib/auth/session";
import { authenticateAdmin } from "@/services/admin-auth-service";

export const dynamic = "force-dynamic";

const schema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin." }, { status: 403 });
  }

  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Please enter your administrator username and password." },
      { status: 400 },
    );
  }

  try {
    const result = await authenticateAdmin(payload.username, payload.password);
    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Invalid administrator credentials." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true, redirect: "/admin/dashboard" });
    setSessionCookie(response, result.user);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to log in. Please try again later." },
      { status: 500 },
    );
  }
}
