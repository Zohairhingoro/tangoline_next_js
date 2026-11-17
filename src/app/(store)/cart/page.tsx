import type { Metadata } from "next";
import { CartView } from "@/components/store/CartView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Shopping Cart - Tangoline Inc.",
};

export default function CartPage() {
  return <CartView />;
}
