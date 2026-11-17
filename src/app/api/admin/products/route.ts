import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/guards";
import { isSameOrigin } from "@/lib/auth/csrf";
import { saveProductImage } from "@/lib/uploads";
import { createAdminProduct } from "@/services/admin-products-service";

export const dynamic = "force-dynamic";

const REQUIRED_ERROR =
  "Please fill out all required fields (Product Name, Category, Price, Description).";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid security token." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: REQUIRED_ERROR }, { status: 400 });
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
    return NextResponse.json({ success: false, error: REQUIRED_ERROR }, { status: 400 });
  }

  const originalRaw = String(form.get("original_price") ?? "").trim();
  const originalPrice = originalRaw ? Number(originalRaw) : null;
  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
    return NextResponse.json({ success: false, error: REQUIRED_ERROR }, { status: 400 });
  }

  try {
    const uploaded = await saveProductImage(form.get("image") as File | null);
    const product = await createAdminProduct(
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

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" created successfully and official Word specification document generated in fc/ folder!`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to create the product. Please check the category and try again." },
      { status: 500 },
    );
  }
}
