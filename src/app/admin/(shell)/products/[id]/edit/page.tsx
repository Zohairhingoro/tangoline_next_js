import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Product - Tangoline Admin",
};

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    redirect("/admin/products?error=Product not found.");
  }

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!product) redirect("/admin/products?error=Product not found.");

  return (
    <ProductForm
      mode="edit"
      categories={categories}
      initial={{
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        brand: product.brand,
        platform: product.platform,
        price: Number(product.price),
        originalPrice: product.originalPrice === null ? null : Number(product.originalPrice),
        shortDescription: product.shortDescription,
        description: product.description,
        specifications: product.specifications,
        systemRequirements: product.systemRequirements,
        stockStatus: product.stockStatus,
        isFeatured: product.isFeatured,
        image: product.image,
      }}
    />
  );
}
