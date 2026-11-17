import { prisma } from "@/lib/db/prisma";
import { toCartItem } from "@/lib/utils";
import { toStoreProduct } from "@/services/product-service";
import type { CartItem } from "@/types";

export type CartLineInput = { id: number; qty: number };
export type CartMutationResult = { ok: boolean; error?: string };

export async function getDbCartItems(sessionId: string): Promise<CartItem[]> {
  const rows = await prisma.cartItem.findMany({
    where: { sessionId },
    include: { product: { include: { category: true } } },
    orderBy: { id: "asc" },
  });
  return rows.map((row) => toCartItem(toStoreProduct(row.product), row.quantity));
}

export async function addDbCartItem(
  userId: number | null,
  sessionId: string,
  productId: number,
  qty: number,
): Promise<CartMutationResult> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Product not found." };
  if (product.stockStatus !== "in_stock") {
    return { ok: false, error: "Product is currently out of stock." };
  }

  await prisma.cartItem.upsert({
    where: { unique_cart_item: { sessionId, productId } },
    create: { userId, sessionId, productId, quantity: qty },
    update: { userId, quantity: { increment: qty } },
  });
  return { ok: true };
}

export async function updateDbCartItem(
  sessionId: string,
  productId: number,
  qty: number,
): Promise<void> {
  if (qty <= 0) {
    await prisma.cartItem.deleteMany({ where: { sessionId, productId } });
    return;
  }
  await prisma.cartItem.upsert({
    where: { unique_cart_item: { sessionId, productId } },
    create: { sessionId, productId, quantity: qty },
    update: { quantity: qty },
  });
}

export async function removeDbCartItem(
  sessionId: string,
  productId: number,
): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { sessionId, productId } });
}

export async function clearDbCart(sessionId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { sessionId } });
}

/** Replace the whole DB cart with the current localStorage cart. */
export async function syncDbCart(
  userId: number | null,
  sessionId: string,
  items: CartLineInput[],
): Promise<void> {
  const validItems = items
    .map((item) => ({
      productId: Number(item.id),
      quantity: Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1))),
    }))
    .filter((item) => Number.isInteger(item.productId) && item.productId > 0);

  const products = validItems.length
    ? await prisma.product.findMany({
        where: { id: { in: validItems.map((item) => item.productId) } },
        select: { id: true, stockStatus: true },
      })
    : [];
  const inStockIds = new Set(
    products.filter((product) => product.stockStatus === "in_stock").map((product) => product.id),
  );
  const rows = validItems
    .filter((item) => inStockIds.has(item.productId))
    .map((item) => ({
      userId,
      sessionId,
      productId: item.productId,
      quantity: item.quantity,
    }));

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { sessionId } }),
    ...(rows.length
      ? [prisma.cartItem.createMany({ data: rows, skipDuplicates: true })]
      : []),
  ]);
}

export async function clearDbCartForCheckout(
  sessionId: string,
  userId: number | null,
): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: {
      OR: [
        { sessionId },
        ...(userId ? [{ userId }] : []),
      ],
    },
  });
}
