import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().max(200).default("General Inquiry"),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin." }, { status: 403 });
  }

  let payload: z.infer<typeof contactSchema>;
  try {
    payload = contactSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Please provide your name, a valid email, and a message." },
      { status: 400 },
    );
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: payload.name,
        email: payload.email,
        subject: payload.subject || "General Inquiry",
        message: payload.message,
      },
    });
    return NextResponse.json({
      success: true,
      message:
        "Thank you! Your message has been sent to Tangoline Inc. We will respond promptly.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to send your message. Please try again." },
      { status: 500 },
    );
  }
}
