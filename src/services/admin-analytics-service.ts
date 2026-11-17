import { formatChartDate } from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function parseIsoDate(value: string | undefined, fallback: Date): Date {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return fallback;
  }
  return parsed;
}

async function distinctSessionCount(where: object = {}): Promise<number> {
  const rows = await prisma.websiteVisit.findMany({
    where: where as never,
    distinct: ["sessionId"],
    select: { sessionId: true },
  });
  return rows.length;
}

export type ChartPoint = { label: string; sessions: number; pageviews: number };
export type DownloadChartPoint = { label: string; value: number };

/** Mirrors the aggregate queries in admin/analytics/visitors.php. */
export async function getVisitorAnalytics(rawFrom?: string, rawTo?: string) {
  const now = new Date();
  const today = startOfDay(now);
  const defaultFrom = addDays(today, -30);
  const fromDate = parseIsoDate(rawFrom, defaultFrom);
  const toDate = parseIsoDate(rawTo, today);
  const dateFrom = toIsoDate(fromDate);
  const dateTo = toIsoDate(toDate);
  const from = startOfDay(fromDate);
  const to = startOfDay(toDate);

  const [
    totalSessions,
    totalPageviews,
    uniqueIps,
    todayVisits,
    yesterdayVisits,
    last7,
    last30,
    allVisits,
    recentVisits,
  ] = await Promise.all([
    distinctSessionCount(),
    prisma.websiteVisit.count(),
    prisma.websiteVisit.findMany({
      distinct: ["ipHash"],
      select: { ipHash: true },
    }),
    distinctSessionCount({ visitDate: { gte: today } }),
    distinctSessionCount({
      visitDate: { gte: addDays(today, -1), lt: today },
    }),
    distinctSessionCount({ visitDate: { gte: addDays(today, -7) } }),
    distinctSessionCount({ visitDate: { gte: addDays(today, -30) } }),
    prisma.websiteVisit.findMany({
      where: { visitDate: { gte: from, lte: to } },
      select: { sessionId: true, visitedAt: true, pageUrl: true },
    }),
    prisma.websiteVisit.findMany({
      where: { visitDate: { gte: from, lte: to } },
      orderBy: { id: "desc" },
      take: 100,
      select: { pageUrl: true, ipHash: true, sessionId: true, visitedAt: true },
    }),
  ]);

  // The original groups by DATE(visited_at) (not visit_date) for the chart.
  const byDay = new Map<string, { sessions: Set<string>; pageviews: number }>();
  for (const visit of allVisits) {
    const key = toIsoDate(startOfDay(visit.visitedAt));
    let bucket = byDay.get(key);
    if (!bucket) {
      bucket = { sessions: new Set<string>(), pageviews: 0 };
      byDay.set(key, bucket);
    }
    bucket.sessions.add(visit.sessionId);
    bucket.pageviews += 1;
  }
  const chartData: ChartPoint[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, bucket]) => ({
      label: formatChartDate(parseIsoDate(day, from)),
      sessions: bucket.sessions.size,
      pageviews: bucket.pageviews,
    }));

  // COUNT(DISTINCT session_id) per page URL — computed in JS for Prisma parity.
  // Popular pages are global in the original, so query the full table as well.
  const allPageVisits = await prisma.websiteVisit.findMany({
    select: { pageUrl: true, sessionId: true },
  });
  const globalPageMap = new Map<string, { hits: number; sessions: Set<string> }>();
  for (const visit of allPageVisits) {
    let bucket = globalPageMap.get(visit.pageUrl);
    if (!bucket) {
      bucket = { hits: 0, sessions: new Set<string>() };
      globalPageMap.set(visit.pageUrl, bucket);
    }
    bucket.hits += 1;
    bucket.sessions.add(visit.sessionId);
  }
  const popularPages = [...globalPageMap.entries()]
    .map(([pageUrl, bucket]) => ({
      pageUrl,
      hits: bucket.hits,
      sessions: bucket.sessions.size,
    }))
    .sort((a, b) => b.hits - a.hits || a.pageUrl.localeCompare(b.pageUrl))
    .slice(0, 10);

  return {
    dateFrom,
    dateTo,
    totalSessions,
    totalPageviews,
    uniqueIPs: uniqueIps.length,
    todayVisits,
    yesterdayVisits,
    last7,
    last30,
    chartData,
    popularPages,
    recentVisits,
  };
}

/** Mirrors the aggregate queries in admin/analytics/downloads.php. */
export async function getDownloadAnalytics(
  search: string,
  rawFrom?: string,
  rawTo?: string,
) {
  const now = new Date();
  const today = startOfDay(now);
  const defaultFrom = addDays(today, -30);
  const fromDate = parseIsoDate(rawFrom, defaultFrom);
  const toDate = parseIsoDate(rawTo, today);
  const dateFrom = toIsoDate(fromDate);
  const dateTo = toIsoDate(toDate);
  const from = startOfDay(fromDate);
  const toExclusive = addDays(startOfDay(toDate), 1);
  const term = search.trim();

  const [
    totalDownloads,
    todayDownloads,
    last7Downloads,
    groupedTop,
    logs,
    chartRows,
  ] = await Promise.all([
    prisma.download.count(),
    prisma.download.count({ where: { downloadedAt: { gte: today } } }),
    prisma.download.count({
      where: { downloadedAt: { gte: new Date(now.getTime() - 7 * 86_400_000) } },
    }),
    prisma.download.groupBy({
      by: ["productId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.download.findMany({
      where: {
        downloadedAt: { gte: from, lt: toExclusive },
        ...(term
          ? {
              OR: [
                { product: { name: { contains: term } } },
                { ipAddress: { contains: term } },
                { user: { username: { contains: term } } },
              ],
            }
          : {}),
      },
      orderBy: { id: "desc" },
      take: 200,
      select: {
        id: true,
        ipAddress: true,
        downloadedAt: true,
        product: { select: { name: true, brand: true } },
        user: { select: { username: true } },
      },
    }),
    prisma.download.findMany({
      where: {
        downloadedAt: { gte: new Date(now.getTime() - 14 * 86_400_000) },
      },
      select: { downloadedAt: true },
    }),
  ]);

  const topIds = groupedTop.map((entry) => entry.productId);
  const topProductsRaw = topIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topIds } },
        select: { id: true, name: true, brand: true },
      })
    : [];
  const productById = new Map(topProductsRaw.map((product) => [product.id, product]));
  const topProducts = groupedTop.map((entry) => {
    const product = productById.get(entry.productId);
    return {
      id: entry.productId,
      name: product?.name ?? `Product #${entry.productId}`,
      brand: product?.brand ?? "",
      count: entry._count.id,
    };
  });

  const byDay = new Map<string, number>();
  for (const row of chartRows) {
    const key = toIsoDate(startOfDay(row.downloadedAt));
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const chartData: DownloadChartPoint[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, value]) => ({
      label: formatChartDate(parseIsoDate(day, now)),
      value,
    }));

  return {
    dateFrom,
    dateTo,
    totalDownloads,
    todayDownloads,
    last7Downloads,
    topProducts,
    logs,
    chartData,
  };
}
