import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCartIdentity, setCartSessionCookie } from "@/lib/cart";
import { prisma } from "@/lib/db/prisma";
import { nextId } from "@/lib/db/next-id";
import { docxExists, generateProductDocx, resolveDocxPath } from "@/lib/docx";
import { getProductDownloadInfo } from "@/services/product-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Invalid product request.", { status: 400 });
  }

  const product = await getProductDownloadInfo(id);
  if (!product) {
    return new Response("Product not found.", { status: 404 });
  }

  let docxFile = product.docxFile;
  let filePath = (await docxExists(docxFile)) ? resolveDocxPath(docxFile) : null;

  if (!filePath) {
    const relativePath = await generateProductDocx({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      platform: product.platform,
      price: Number(product.price),
      originalPrice: product.originalPrice === null ? null : Number(product.originalPrice),
      description: product.description,
      specifications: product.specifications,
      systemRequirements: product.systemRequirements,
    });
    docxFile = relativePath;
    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { docxFile: relativePath },
      });
    } catch {
      // Non-critical: serving the freshly generated file still works.
    }
    filePath = resolveDocxPath(relativePath);
  }

  if (!filePath) {
    return new Response("Product specification file could not be prepared.", { status: 500 });
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(/* turbopackIgnore: true */ filePath);
  } catch {
    return new Response("Product specification file could not be prepared.", { status: 500 });
  }

  // Match the original download-details.php tracking (log failure never blocks).
  try {
    const identity = await getCartIdentity();
    const user = await getSession();
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress =
      forwarded?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    await prisma.download.create({
      data: {
        id: await nextId("downloads"),
        productId: product.id,
        userId: user?.role === "customer" ? user.id : null,
        sessionId: identity.sessionId,
        ipAddress: ipAddress.slice(0, 45),
        fileName: basename(filePath),
      },
    });

    const response = new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${product.name
          .replace(/[^A-Za-z0-9_-]/g, "_")}-Details.docx"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "must-revalidate, post-check=0, pre-check=0",
        Pragma: "public",
        "X-Content-Type-Options": "nosniff",
      },
    });
    setCartSessionCookie(response, identity.sessionId);
    return response;
  } catch {
    // Continue with an untracked download if analytics are unavailable.
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${product.name
        .replace(/[^A-Za-z0-9_-]/g, "_")}-Details.docx"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "must-revalidate, post-check=0, pre-check=0",
      Pragma: "public",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
