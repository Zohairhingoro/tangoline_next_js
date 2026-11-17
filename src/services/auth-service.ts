import { Prisma, UserStatus } from "@prisma/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logActivity } from "@/lib/analytics";
import { prisma } from "@/lib/db/prisma";
import { nextId } from "@/lib/db/next-id";
import type { SessionUser } from "@/types";

export type AuthResult = {
  success: boolean;
  error?: string;
  user?: SessionUser;
};

function toSessionUser(user: {
  id: number;
  username: string;
  email: string;
  fullName: string;
}): SessionUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.fullName || user.username,
    role: "customer",
  };
}

/** Mirrors the original `loginUser()` including auth-activity logging. */
export async function authenticateUser(
  identifier: string,
  password: string,
): Promise<AuthResult> {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });

  if (!user) {
    await logActivity({
      userId: null,
      accountType: "user",
      identifier,
      status: "failed",
    });
    return {
      success: false,
      error: "No account found matching this username or email.",
    };
  }

  if (user.status !== UserStatus.active) {
    await logActivity({
      userId: user.id,
      accountType: "user",
      identifier,
      status: "failed",
    });
    return {
      success: false,
      error: "This account has been disabled. Please contact customer support.",
    };
  }

  if (!(await verifyPassword(password, user.password))) {
    await logActivity({
      userId: user.id,
      accountType: "user",
      identifier,
      status: "failed",
    });
    return { success: false, error: "Invalid password credentials." };
  }

  await logActivity({
    userId: user.id,
    accountType: "user",
    identifier,
    status: "success",
  });
  return { success: true, user: toSessionUser(user) };
}

/** Mirrors the original `registerUser()` with bcrypt hashing and duplicate handling. */
export async function registerCustomer(input: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();

  if (username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }
  if (email.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please provide a valid email address." };
  }
  if (input.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { email: true },
  });
  if (existing) {
    return existing.email.toLowerCase() === email
      ? { success: false, error: "An account with this email address already exists." }
      : { success: false, error: "This username is already taken." };
  }

  try {
    const user = await prisma.user.create({
      data: {
        id: await nextId("users"),
        username,
        email,
        password: await hashPassword(input.password),
        fullName: "",
        status: UserStatus.active,
      },
      select: { id: true, username: true, email: true, fullName: true },
    });

    await logActivity({
      userId: user.id,
      accountType: "user",
      identifier: username,
      status: "success",
    });
    return { success: true, user: toSessionUser(user) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "This username or email address is already in use." };
    }
    throw error;
  }
}
