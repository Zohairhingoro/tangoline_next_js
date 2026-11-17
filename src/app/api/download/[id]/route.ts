import { readFile } from "node:fs/promises";
import { getProductDownloadInfo } from "@/services/product-service";
import { docxExists, generateProductDocx, resolveDocxPath } from "@/lib/docx";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Invalid product id", { status: 400 });
  }

  const product = await getProductDownloadInfo(id);
  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  let filePath = await docxExists(product.docxFile)
    ? resolveDocxPath(product.docxFile)
    : null;

  if (!filePath) {
    await generateProductDocx({
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
    filePath = resolveDocxPath(`${product.slug || slugify(product.name)}-details.docx`);
  }

  if (!filePath) {
    return new Response("Unable to prepare document", { status: 500 });
  }

  const buffer = await readFile(/* turbopackIgnore: true */ filePath);
  const fileName = `${product.slug || slugify(product.name)}-details.docx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
