import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { nextId } from "@/lib/db/next-id";
import type { AccountType } from "@prisma/client";

/** Mirrors the original `recordVisitor()` helper — fails silently. */
export async function recordVisitor(pageUrl: string): Promise<void> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = (h.get("user-agent") ?? "").slice(0, 250);
    const sessionId =
      h.get("x-tangoline-session-id") ??
      createHash("sha256").update(`${ip}:${userAgent}`).digest("hex").slice(0, 64);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.websiteVisit.create({
      data: {
        id: await nextId("website_visits"),
        sessionId,
        ipHash: createHash("sha256").update(`${ip}${today.toISOString().slice(0, 7)}`).digest("hex"),
        pageUrl: pageUrl.slice(0, 255),
        userAgent,
        visitDate: today,
      },
    });
  } catch {
    // Analytics must never break a page.
  }
}

/** Mirrors the original `logActivity()` helper — fails silently. */
export async function logActivity(params: {
  userId?: number | null;
  accountType: AccountType;
  identifier: string;
  status: "success" | "failed";
}): Promise<void> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = (h.get("user-agent") ?? "").slice(0, 250);

    await prisma.loginLog.create({
      data: {
        id: await nextId("login_logs"),
        userId: params.userId ?? null,
        accountType: params.accountType,
        identifier: params.identifier.slice(0, 120),
        ipAddress: ip.slice(0, 45),
        status: params.status,
        userAgent,
      },
    });
  } catch {
    // Analytics must never break authentication.
  }
}
