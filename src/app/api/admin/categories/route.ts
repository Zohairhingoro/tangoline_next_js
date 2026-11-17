import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getAdminSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid security token." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  let payload: { name?: unknown; description?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Category name is required." }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const description = String(payload.description ?? "").trim();
  if (!name) {
    return NextResponse.json({ success: false, error: "Category name is required." }, { status: 400 });
  }

  const slug = slugify(name);
  const duplicate = await prisma.category.findFirst({
    where: { OR: [{ slug }, { name }] },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json(
      { success: false, error: "A category with this name or slug already exists." },
      { status: 400 },
    );
  }

  try {
    const category = await prisma.category.create({
      data: { name, slug, description },
    });
    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" added successfully!`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "A category with this name or slug already exists." },
      { status: 400 },
    );
  }
}
