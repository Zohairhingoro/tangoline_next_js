import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getAdminSession } from "@/lib/auth/guards";
import { saveProductImage } from "@/lib/uploads";
import {
  deleteAdminProduct,
  updateAdminProduct,
} from "@/services/admin-products-service";

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
    return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Please fill out all required fields." },
      { status: 400 },
    );
  }

  const name = String(form.get("name") ?? "").trim();
  const categoryId = Number(form.get("category_id") ?? 0);
  const price = Number(form.get("price") ?? 0);
  const description = String(form.get("description") ?? "").trim();

  if (
    !name ||
    !Number.isInteger(categoryId) ||
    categoryId <= 0 ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !description
  ) {
    return NextResponse.json(
      { success: false, error: "Please fill out all required fields." },
      { status: 400 },
    );
  }

  const originalRaw = String(form.get("original_price") ?? "").trim();
  const originalPrice = originalRaw ? Number(originalRaw) : null;
  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
    return NextResponse.json(
      { success: false, error: "Please fill out all required fields." },
      { status: 400 },
    );
  }

  try {
    const uploaded = await saveProductImage(form.get("image") as File | null);
    const product = await updateAdminProduct(
      id,
      {
        name,
        categoryId,
        brand: String(form.get("brand") ?? "").trim(),
        platform: String(form.get("platform") ?? "").trim(),
        price,
        originalPrice,
        shortDescription: String(form.get("short_description") ?? "").trim(),
        description,
        specifications: String(form.get("specifications") ?? "").trim() || null,
        systemRequirements: String(form.get("system_requirements") ?? "").trim() || null,
        stockStatus:
          String(form.get("stock_status") ?? "in_stock") === "out_of_stock"
            ? "out_of_stock"
            : "in_stock",
        isFeatured: form.get("is_featured") === "1",
      },
      uploaded,
    );

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" and its Word specification file in fc/ updated successfully!`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to update the product. Please try again." },
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
    return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
  }

  try {
    const name = await deleteAdminProduct(id);
    if (!name) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: `Product "${name}" and its generated document were successfully deleted.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to delete the product. Please try again." },
      { status: 500 },
    );
  }
}
