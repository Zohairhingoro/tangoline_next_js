import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getSession } from "@/lib/auth/session";
import { getCartIdentity } from "@/lib/cart";
import { createOrder } from "@/services/order-service";
import type { CheckoutInput } from "@/types";

export const dynamic = "force-dynamic";

const paymentMethods = [
  "cash_on_delivery",
  "credit_debit_card",
  "mobile_wallet",
] as const;

const checkoutSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(1).max(30),
  address: z.string().trim().min(1).max(1000),
  city: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().max(20).default(""),
  paymentMethod: z.enum(paymentMethods).default("cash_on_delivery"),
  notes: z.string().trim().max(1000).default(""),
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin." }, { status: 403 });
  }

  const user = await getSession();
  if (!user || user.role !== "customer") {
    return NextResponse.json(
      { success: false, error: "Please log in to complete checkout." },
      { status: 401 },
    );
  }

  let payload: z.infer<typeof checkoutSchema>;
  try {
    payload = checkoutSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Please check your shipping details and try again." },
      { status: 400 },
    );
  }

  const identity = await getCartIdentity();

  const input: CheckoutInput = {
    customerName: payload.fullName,
    customerEmail: payload.email,
    customerPhone: payload.phone,
    shippingAddress: payload.address,
    city: payload.city,
    postalCode: payload.postalCode,
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
    items: payload.items,
  };

  try {
    const order = await createOrder(user.id, input, identity.sessionId);
    return NextResponse.json({ success: true, ...order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process order. Please try again later.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
