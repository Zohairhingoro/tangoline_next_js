import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getAdminSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid security token." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  const newStatus = user.status === "active" ? "disabled" : "active";
  try {
    await prisma.user.update({ where: { id }, data: { status: newStatus } });
    return NextResponse.json({
      success: true,
      message: `Account status changed to "${newStatus}".`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to change this account status." },
      { status: 500 },
    );
  }
}
