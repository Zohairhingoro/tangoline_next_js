import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/csrf";
import { getSession, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  fullName: z.string().trim().max(100).default(""),
  phone: z.string().trim().max(30).default(""),
  address: z.string().trim().max(2000).default(""),
  city: z.string().trim().max(80).default(""),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin." }, { status: 403 });
  }

  const session = await getSession();
  if (!session || session.role !== "customer") {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  let payload: z.infer<typeof profileSchema>;
  try {
    payload = profileSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Please check your profile details." },
      { status: 400 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: {
        fullName: payload.fullName,
        phone: payload.phone,
        address: payload.address || null,
        city: payload.city,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile information updated successfully!",
    });
    setSessionCookie(response, {
      ...session,
      name: payload.fullName || session.username,
    });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to update your profile." },
      { status: 500 },
    );
  }
}
