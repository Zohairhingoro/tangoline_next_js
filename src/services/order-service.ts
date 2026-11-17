import { randomBytes, randomInt } from "node:crypto";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { nextId, nextIds } from "@/lib/db/next-id";
import { formatPrice } from "@/lib/utils";
import type { CheckoutInput } from "@/types";

/** Matches the original checkout.php: TNG-<6 uppercase hex><2-digit random>. */
function generateLegacyOrderNumber(): string {
  return `TNG-${randomBytes(3).toString("hex").toUpperCase()}${randomInt(10, 100)}`;
}

async function findUniqueOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateLegacyOrderNumber();
    const existing = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return generateLegacyOrderNumber();
}

export type CreatedOrder = {
  orderNumber: string;
  total: number;
  formattedTotal: string;
};

/**
 * Creates an order from the submitted cart lines. Prices are always re-read
 * from the database so client-supplied values cannot alter the total.
 */
export async function createOrder(
  userId: number,
  input: CheckoutInput,
  sessionId: string,
): Promise<CreatedOrder> {
  const lines = input.items
    .map((item) => ({
      productId: Number(item.id),
      quantity: Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1))),
    }))
    .filter((item) => Number.isInteger(item.productId) && item.productId > 0);

  if (lines.length === 0) {
    throw new Error("Your shopping cart is empty.");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((line) => line.productId) } },
    select: { id: true, name: true, price: true, image: true, stockStatus: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const orderItems: Array<{
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
    productImage: string;
  }> = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product || product.stockStatus !== "in_stock") {
      throw new Error("Some products in your cart are no longer available.");
    }
    const price = Number(product.price);
    orderItems.push({
      productId: product.id,
      productName: product.name,
      productPrice: price,
      quantity: line.quantity,
      subtotal: price * line.quantity,
      productImage: product.image,
    });
  }

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const orderNumber = await findUniqueOrderNumber();
  const orderId = await nextId("orders");
  const itemIds = await nextIds("order_items", orderItems.length);

  // MongoDB (Prisma 6) has no transaction support; run the writes in order.
  await prisma.order.create({
    data: {
      id: orderId,
      orderNumber,
      userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      shippingAddress: input.shippingAddress,
      city: input.city,
      postalCode: input.postalCode,
      paymentMethod: input.paymentMethod,
      subtotal: total,
      shippingFee: 0,
      totalAmount: total,
      status: OrderStatus.Pending,
      notes: input.notes || null,
      orderItems: {
        create: orderItems.map((item, index) => ({
          id: itemIds[index],
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
          productImage: item.productImage,
        })),
      },
    },
  });
  await prisma.cartItem.deleteMany({
    where: {
      OR: [{ sessionId }, { userId }],
    },
  });

  return {
    orderNumber,
    total,
    formattedTotal: formatPrice(total),
  };
}
