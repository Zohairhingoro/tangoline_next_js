import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/csrf";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(200),
  confirmPassword: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || session.role !== "customer") {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  let payload: z.infer<typeof passwordSchema>;
  try {
    payload = passwordSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "New password must be at least 6 characters." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { password: true },
    });
    if (!user || !(await verifyPassword(payload.currentPassword, user.password))) {
      return NextResponse.json(
        { success: false, error: "Incorrect current password." },
        { status: 400 },
      );
    }
    if (payload.newPassword !== payload.confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New passwords do not match." },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { password: await hashPassword(payload.newPassword) },
    });
    return NextResponse.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to change your password." },
      { status: 500 },
    );
  }
}
