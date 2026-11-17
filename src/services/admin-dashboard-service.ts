import { prisma } from "@/lib/db/prisma";

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(days: number): Date {
  const date = startOfToday();
  date.setDate(date.getDate() - days);
  return date;
}

async function distinctVisitCount(where: object = {}): Promise<number> {
  const rows = await prisma.websiteVisit.findMany({
    where: where as never,
    distinct: ["sessionId"],
    select: { sessionId: true },
  });
  return rows.length;
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

/** Mirrors all aggregate queries in the original admin/dashboard.php. */
export async function getDashboardData() {
  const now = new Date();
  const today = startOfToday();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalProducts,
    totalCategories,
    orderStats,
    totalDownloads,
    totalVisits,
    todayVisits,
    yesterdayVisits,
    last7DaysVisits,
    last30DaysVisits,
    thisMonthVisits,
    regThisMonth,
    recentOrders,
    recentLogins,
    recentUsers,
    mostViewed,
    downloadCounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.aggregate({ _count: true, _sum: { totalAmount: true } }),
    prisma.download.count(),
    distinctVisitCount(),
    distinctVisitCount({ visitDate: { gte: today } }),
    distinctVisitCount({ visitDate: { gte: daysAgo(1), lt: today } }),
    distinctVisitCount({ visitDate: { gte: daysAgo(6) } }),
    distinctVisitCount({ visitDate: { gte: daysAgo(29) } }),
    distinctVisitCount({ visitDate: { gte: monthStart } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.findMany({ orderBy: { id: "desc" }, take: 5 }),
    prisma.loginLog.findMany({ orderBy: { id: "desc" }, take: 6 }),
    prisma.user.findMany({ orderBy: { id: "desc" }, take: 5 }),
    prisma.product.findMany({
      orderBy: { viewsCount: "desc" },
      take: 5,
      select: { id: true, name: true, brand: true, platform: true, viewsCount: true, price: true },
    }),
    // groupBy is not supported by Prisma's MongoDB connector; aggregate in JS.
    prisma.download.findMany({ select: { productId: true } }),
  ]);

  const downloadCountMap = new Map<number, number>();
  for (const row of downloadCounts) {
    downloadCountMap.set(row.productId, (downloadCountMap.get(row.productId) ?? 0) + 1);
  }
  const topDownloads = [...downloadCountMap.entries()]
    .map(([productId, count]) => ({ productId, count }))
    .sort((a, b) => b.count - a.count || a.productId - b.productId)
    .slice(0, 5);

  const mostDownloaded = await Promise.all(
    topDownloads.map(async (entry) => {
      const product = await prisma.product.findUnique({
        where: { id: entry.productId },
        select: { id: true, name: true, brand: true },
      });
      return {
        id: entry.productId,
        name: product?.name ?? `Product #${entry.productId}`,
        brand: product?.brand ?? "",
        dlCount: entry.count,
      };
    }),
  );

  // Original dashboard builds 7 daily labels with `date('D, M d', ...)`.
  const dailyData: Array<{ label: string; value: number }> = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = daysAgo(i);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const label = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
    });
    const value = await distinctVisitCount({ visitDate: { gte: date, lt: next } });
    dailyData.push({ label, value });
  }

  // Monthly breakdown is computed but not charted on the dashboard (kept for parity).
  const monthlyData: Array<{ label: string; value: number }> = [];
  for (let m = 5; m >= 0; m -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    const label = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const value = await distinctVisitCount({
      visitDate: { gte: monthDate, lt: nextMonth },
    });
    monthlyData.push({ label, value });
  }

  return {
    totalUsers,
    totalProducts,
    totalCategories,
    totalOrders: orderStats._count,
    totalRevenue: Number(orderStats._sum.totalAmount ?? 0),
    totalDownloads,
    totalVisits,
    todayVisits,
    yesterdayVisits,
    last7DaysVisits,
    last30DaysVisits,
    thisMonthVisits,
    regThisMonth,
    recentOrders,
    recentLogins,
    recentUsers,
    mostViewed,
    mostDownloaded,
    dailyData,
    monthlyData,
  };
}
