import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import type { SessionUser } from "@/types";

/** Server-side guard for customer pages. */
export async function requireCustomer(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    redirect("/login");
  }
  return session;
}

/** Server-side guard for admin pages. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }
  return session;
}

/** Returns the session only when it belongs to an admin (for route handlers). */
export async function getAdminSession(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}
