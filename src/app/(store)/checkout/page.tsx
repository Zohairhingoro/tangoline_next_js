import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { requireCustomer } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment & Checkout - Tangoline Inc.",
};

export default async function CheckoutPage() {
  const user = await requireCustomer("/checkout");
  return <CheckoutForm user={user} />;
}
