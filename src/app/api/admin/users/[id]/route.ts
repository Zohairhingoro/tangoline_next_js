import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getAdminSession } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function parseId(context: Context): Promise<number | null> {
  const { id } = await context.params;
  const numeric = Number(id);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

export async function PATCH(request: Request, context: Context) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid security token." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }
  const id = await parseId(context);
  if (!id) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Username and email are required." },
      { status: 400 },
    );
  }
  const username = String(payload.username ?? "").trim();
  const email = String(payload.email ?? "").trim();
  if (!username || !email) {
    return NextResponse.json(
      { success: false, error: "Username and email are required." },
      { status: 400 },
    );
  }

  const duplicate = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }], id: { not: id } },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json(
      { success: false, error: "That username or email is already used by another account." },
      { status: 400 },
    );
  }

  const newPassword = String(payload.newPassword ?? "");
  const data = {
    username,
    email,
    fullName: String(payload.fullName ?? "").trim(),
    phone: String(payload.phone ?? "").trim(),
    city: String(payload.city ?? "").trim(),
    status: String(payload.status ?? "active") === "disabled" ? ("disabled" as const) : ("active" as const),
    ...(newPassword ? { password: await hashPassword(newPassword) } : {}),
  };

  try {
    await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ success: true, message: "User account updated successfully!" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to update this account." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid security token." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }
  const id = await parseId(context);
  if (!id) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  try {
    const result = await prisma.user.deleteMany({ where: { id } });
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "User account deleted successfully." });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to delete this account." },
      { status: 500 },
    );
  }
}
