import { prisma } from "@/lib/db/prisma";
import { imagePath } from "@/lib/utils";
import type { StoreProduct } from "@/types";
import type { Prisma } from "@prisma/client";

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true } }>;

export function toStoreProduct(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    platform: row.platform,
    price: Number(row.price),
    originalPrice: row.originalPrice === null ? null : Number(row.originalPrice),
    shortDescription: row.shortDescription,
    description: row.description,
    specifications: row.specifications,
    systemRequirements: row.systemRequirements,
    image: imagePath(row.image),
    docxUrl: `/api/download/${row.id}`,
    stockStatus: row.stockStatus,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
  };
}

const withCategory = { include: { category: true } } as const;

export async function getFeaturedProducts(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    ...withCategory,
    where: { isFeatured: true },
    orderBy: { id: "asc" },
  });
  return rows.map(toStoreProduct);
}

export async function getProductsByCategory(
  categorySlug: string,
  options: { search?: string; brand?: string } = {},
): Promise<StoreProduct[]> {
  const { search, brand } = options;
  const rows = await prisma.product.findMany({
    ...withCategory,
    where: {
      category: { slug: categorySlug },
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
              { brand: { contains: search } },
            ],
          }
        : {}),
      ...(brand && brand !== "all" ? { brand: { contains: brand } } : {}),
    },
    orderBy: { id: "asc" },
  });
  return rows.map(toStoreProduct);
}

export async function getAllProducts(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    ...withCategory,
    orderBy: { id: "asc" },
  });
  return rows.map(toStoreProduct);
}

export async function getProductById(id: number): Promise<StoreProduct | null> {
  const row = await prisma.product.findUnique({
    ...withCategory,
    where: { id },
  });
  return row ? toStoreProduct(row) : null;
}

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  const row = await prisma.product.findUnique({
    ...withCategory,
    where: { slug },
  });
  return row ? toStoreProduct(row) : null;
}

export async function getRelatedProducts(
  categoryId: number,
  excludeId: number,
): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    ...withCategory,
    where: { categoryId, id: { not: excludeId } },
    orderBy: { id: "asc" },
    take: 3,
  });
  return rows.map(toStoreProduct);
}

export async function getCategoriesWithCounts() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { id: "asc" },
  });
}

export async function incrementProductViews(id: number): Promise<void> {
  try {
    await prisma.product.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
  } catch {
    // Non-critical analytics update.
  }
}
