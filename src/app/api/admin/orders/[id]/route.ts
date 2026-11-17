import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getAdminSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = ["Pending", "Processing", "Completed", "Cancelled"] as const;

export async function PATCH(
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
    return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
  }

  let payload: { status?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid status." }, { status: 400 });
  }
  const status = String(payload.status ?? "");
  if (!(ALLOWED_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status." }, { status: 400 });
  }

  try {
    const result = await prisma.order.updateMany({ where: { id }, data: { status: status as (typeof ALLOWED_STATUSES)[number] } });
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: `Order status updated to "${status}" successfully.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to update this order." },
      { status: 500 },
    );
  }
}
