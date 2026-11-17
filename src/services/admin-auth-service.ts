import { logActivity } from "@/lib/analytics";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/types";

export type AdminAuthResult = {
  success: boolean;
  error?: string;
  user?: SessionUser;
};

/** Mirrors the original `loginAdmin()` including admin auth-activity logging. */
export async function authenticateAdmin(
  identifier: string,
  password: string,
): Promise<AdminAuthResult> {
  const admin = await prisma.admin.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });

  const invalid = async (): Promise<AdminAuthResult> => {
    await logActivity({
      userId: admin?.id ?? null,
      accountType: "admin",
      identifier,
      status: "failed",
    });
    return { success: false, error: "Invalid administrator credentials." };
  };

  if (!admin || !(await verifyPassword(password, admin.password))) {
    return invalid();
  }

  await logActivity({
    userId: admin.id,
    accountType: "admin",
    identifier,
    status: "success",
  });

  return {
    success: true,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.fullName || admin.username,
      role: "admin",
    },
  };
}
