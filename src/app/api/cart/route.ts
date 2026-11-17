import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getCartIdentity, setCartSessionCookie } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import {
  addDbCartItem,
  clearDbCart,
  getDbCartItems,
  removeDbCartItem,
  syncDbCart,
  updateDbCartItem,
} from "@/services/cart-service";
import type { CartItem } from "@/types";

export const dynamic = "force-dynamic";

const lineSchema = z.object({
  id: z.number().int().positive(),
  qty: z.number().int().min(1).max(99),
});

const cartSchema = z.object({
  action: z
    .enum(["get", "add", "update", "remove", "clear", "sync"])
    .default("get"),
  productId: z.number().int().positive().optional(),
  qty: z.number().int().min(0).max(99).optional(),
  items: z.array(lineSchema).max(50).optional(),
});

function totals(items: CartItem[]) {
  const count = items.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.rawPrice || 0) * Number(item.qty || 1),
    0,
  );
  return {
    count,
    subtotal,
    formatted_subtotal: formatPrice(subtotal),
  };
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  const identity = await getCartIdentity();
  try {
    const items = await getDbCartItems(identity.sessionId);
    const response = NextResponse.json({
      success: true,
      items,
      totals: totals(items),
    });
    setCartSessionCookie(response, identity.sessionId);
    return response;
  } catch {
    return errorResponse("Unable to load cart.", 500);
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse("Invalid origin.", 403);

  let payload: z.infer<typeof cartSchema>;
  try {
    payload = cartSchema.parse(await request.json());
  } catch {
    return errorResponse("Invalid cart request.");
  }

  const identity = await getCartIdentity();
  const { sessionId, userId } = identity;

  try {
    let items: CartItem[] = [];

    switch (payload.action) {
      case "get": {
        items = await getDbCartItems(sessionId);
        break;
      }
      case "add": {
        if (!payload.productId) return errorResponse("Invalid product.");
        const result = await addDbCartItem(
          userId,
          sessionId,
          payload.productId,
          Math.max(1, payload.qty ?? 1),
        );
        if (!result.ok) return errorResponse(result.error ?? "Unable to add product.");
        items = await getDbCartItems(sessionId);
        break;
      }
      case "update": {
        if (!payload.productId) return errorResponse("Invalid product.");
        await updateDbCartItem(sessionId, payload.productId, payload.qty ?? 1);
        items = await getDbCartItems(sessionId);
        break;
      }
      case "remove": {
        if (!payload.productId) return errorResponse("Invalid product.");
        await removeDbCartItem(sessionId, payload.productId);
        items = await getDbCartItems(sessionId);
        break;
      }
      case "clear": {
        await clearDbCart(sessionId);
        break;
      }
      case "sync": {
        await syncDbCart(
          userId,
          sessionId,
          (payload.items ?? []).map((item) => ({ id: item.id, qty: item.qty })),
        );
        items = await getDbCartItems(sessionId);
        break;
      }
    }

    const response = NextResponse.json({
      success: true,
      items,
      totals: totals(items),
    });
    setCartSessionCookie(response, sessionId);
    return response;
  } catch {
    return errorResponse("Unable to update cart.", 500);
  }
}
