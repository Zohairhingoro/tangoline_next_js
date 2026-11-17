import type { Metadata } from "next";
import { ProfileView } from "@/components/store/ProfileView";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import type { CustomerOrderSummary, ProfilePageData } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Profile & Orders - Tangoline Inc.",
};

/** Matches PHP `date('M d, Y', strtotime(...))`. */
function formatMemberDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const session = await requireCustomer("/profile");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        username: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        city: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId: session.id },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        totalAmount: true,
        paymentMethod: true,
        status: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { id: "desc" },
    }),
  ]);

  const orderSummaries: CustomerOrderSummary[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: formatMemberDate(order.createdAt),
    itemCount: order._count.orderItems,
    total: Number(order.totalAmount),
    paymentMethod: order.paymentMethod,
    status: order.status,
  }));

  const data: ProfilePageData = {
    username: user?.username ?? session.username,
    email: user?.email ?? session.email,
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    memberSince: user ? formatMemberDate(user.createdAt) : "",
    orders: orderSummaries,
  };

  return <ProfileView data={data} />;
}
