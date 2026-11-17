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

export async function PATCH(request: Request, context: Context) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid security token." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }
  const id = await parseId(context);
  if (!id) {
    return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
  }

  let payload: { name?: unknown; description?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Category name cannot be blank." },
      { status: 400 },
    );
  }
  const name = String(payload.name ?? "").trim();
  const description = String(payload.description ?? "").trim();
  if (!name) {
    return NextResponse.json(
      { success: false, error: "Category name cannot be blank." },
      { status: 400 },
    );
  }

  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
  }

  const duplicate = await prisma.category.findFirst({
    where: { name, id: { not: id } },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json(
      { success: false, error: "Another category already uses this name." },
      { status: 400 },
    );
  }

  try {
    await prisma.category.update({ where: { id }, data: { name, description } });
    return NextResponse.json({ success: true, message: "Category updated successfully!" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to update this category." },
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
    return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Cannot delete this category because ${productCount} products are currently assigned to it. Reassign or delete those products first.`,
      },
      { status: 400 },
    );
  }

  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Category deleted successfully." });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to delete this category." },
      { status: 500 },
    );
  }
}
