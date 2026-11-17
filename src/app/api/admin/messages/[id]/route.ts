import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getAdminSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function parseId(context: Context): Promise<number | null> {
  const { id } = await context.params;
  const numeric = Number(id);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

/** Silent mark-read / mark-unread action (no flash in the original page). */
export async function PATCH(request: Request, context: Context) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid security token." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }
  const id = await parseId(context);
  if (!id) {
    return NextResponse.json({ success: false, error: "Message not found." }, { status: 404 });
  }

  let payload: { action?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  }

  const action = String(payload.action ?? "");
  const isRead = action === "mark_read" ? true : action === "mark_unread" ? false : null;
  if (isRead === null) {
    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  }

  try {
    const result = await prisma.contactMessage.updateMany({
      where: { id },
      data: { isRead },
    });
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Message not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Message status updated." });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to update this message." },
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
    return NextResponse.json({ success: false, error: "Message not found." }, { status: 404 });
  }

  try {
    const result = await prisma.contactMessage.deleteMany({ where: { id } });
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Message not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Message deleted." });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to delete this message." },
      { status: 500 },
    );
  }
}
