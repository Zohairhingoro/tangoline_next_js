import type { StockStatus } from "@prisma/client";
import { generateProductDocx, removeProductDocx } from "@/lib/docx";
import { prisma } from "@/lib/db/prisma";
import { nextId } from "@/lib/db/next-id";
import { slugify } from "@/lib/utils";

export type ProductInput = {
  name: string;
  categoryId: number;
  brand: string;
  platform: string;
  price: number;
  originalPrice: number | null;
  shortDescription: string;
  description: string;
  specifications: string | null;
  systemRequirements: string | null;
  stockStatus: StockStatus;
  isFeatured: boolean;
};

const DEFAULT_IMAGE = "images/product-placeholder.svg";

export async function listAdminProducts(search: string, categoryId: number) {
  const term = search.trim();
  return prisma.product.findMany({
    where: {
      ...(term
        ? {
            OR: [
              { name: { contains: term } },
              { brand: { contains: term } },
              { platform: { contains: term } },
            ],
          }
        : {}),
      ...(categoryId > 0 ? { categoryId } : {}),
    },
    include: { category: { select: { name: true } } },
    orderBy: { id: "desc" },
  });
}

export async function getAdminProduct(id: number) {
  return prisma.product.findUnique({ where: { id } });
}

/** Mirrors the original create-only slug generation with `-1`, `-2`, ... suffixes. */
export async function createAdminProduct(
  values: ProductInput,
  uploadedImage: string | null,
) {
  const baseSlug = slugify(values.name);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const product = await prisma.product.create({
    data: {
      ...values,
      id: await nextId("products"),
      slug,
      image: uploadedImage ?? DEFAULT_IMAGE,
      docxFile: "",
    },
  });

  const docxFile = await generateProductDocx({
    ...product,
    price: Number(product.price),
    originalPrice:
      product.originalPrice === null ? null : Number(product.originalPrice),
  });
  return prisma.product.update({
    where: { id: product.id },
    data: { docxFile },
  });
}

/** Slug and docx name stay unchanged, exactly like the original edit page. */
export async function updateAdminProduct(
  id: number,
  values: ProductInput,
  uploadedImage: string | null,
) {
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) return null;

  await prisma.product.update({
    where: { id },
    data: { ...values, image: uploadedImage ?? current.image },
  });

  const updated = await prisma.product.findUnique({ where: { id } });
  if (!updated) return null;
  const docxFile = await generateProductDocx({
    ...updated,
    price: Number(updated.price),
    originalPrice:
      updated.originalPrice === null ? null : Number(updated.originalPrice),
  });
  return prisma.product.update({ where: { id }, data: { docxFile } });
}

export async function deleteAdminProduct(id: number): Promise<string | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, docxFile: true },
  });
  if (!product) return null;

  await removeProductDocx(product.docxFile);
  await prisma.product.delete({ where: { id } });
  return product.name;
}
