import { prisma } from "@/lib/db/prisma";
import { imagePath } from "@/lib/utils";
import type { StoreProduct } from "@/types";
import type { Prisma } from "@prisma/client";

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true } }>;

export type ProductQueryOptions = {
  search?: string;
  brand?: string;
  categorySlugs?: string[];
  categoryId?: number;
  /** PC-parts page type filter, matching the original name patterns. */
  typeFilter?: string;
};

export function toStoreProduct(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    categoryId: row.categoryId,
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

const PC_TYPE_PATTERNS: Record<string, string[]> = {
  cpu: ["Processor", "Ryzen", "Core i9", "CPU"],
  gpu: ["GeForce", "Radeon", "RTX", "RX"],
  motherboard: ["Motherboard", "Z790", "B650"],
  "ram-ssd": ["DDR5", "RAM", "SSD", "NVMe"],
  "case-cooling": ["Case", "Cooler", "Kraken", "PSU", "Power Supply"],
  peripheral: ["Keyboard", "Mouse", "Monitor"],
};

export async function getProductsByCategory(
  categorySlug: string,
  options: ProductQueryOptions = {},
): Promise<StoreProduct[]> {
  const { search, brand, categorySlugs, categoryId, typeFilter } = options;
  const slugs = categorySlugs ?? [categorySlug];

  const categoryConditions: Prisma.ProductWhereInput[] = [
    { category: { slug: { in: slugs } } },
  ];
  if (categoryId) categoryConditions.push({ categoryId });

  const and: Prisma.ProductWhereInput[] = [{ OR: categoryConditions }];

  if (search) {
    const fields: Array<"name" | "description" | "brand" | "platform" | "specifications"> =
      typeFilter || slugs.includes("pc-parts") || slugs.includes("pc")
        ? ["name", "description", "brand", "platform", "specifications"]
        : ["name", "description", "brand"];
    and.push({
      OR: fields.map((field) => ({ [field]: { contains: search } })),
    });
  }

  if (brand && brand !== "all") {
    and.push({ brand: { contains: brand } });
  }

  if (typeFilter && typeFilter !== "all") {
    const patterns = PC_TYPE_PATTERNS[typeFilter];
    if (patterns) {
      and.push({ OR: patterns.map((pattern) => ({ name: { contains: pattern } })) });
    } else {
      and.push({
        OR: [
          { brand: { contains: typeFilter } },
          { platform: { contains: typeFilter } },
        ],
      });
    }
  }

  const rows = await prisma.product.findMany({
    ...withCategory,
    where: { AND: and },
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

export async function getProductDownloadInfo(id: number) {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      platform: true,
      price: true,
      originalPrice: true,
      description: true,
      specifications: true,
      systemRequirements: true,
      docxFile: true,
    },
  });
}
