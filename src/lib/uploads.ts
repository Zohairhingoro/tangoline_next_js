import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/** Public product upload directory (mirrors the original `uploads/products/`). */
export const PRODUCT_UPLOAD_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "uploads",
  "products",
);

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function hasValidSignature(extension: string, buffer: Buffer): boolean {
  if (extension === "jpg" || extension === "jpeg") {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (extension === "png") {
    return (
      buffer.length > 8 &&
      buffer[0] === 0x89 &&
      buffer.toString("ascii", 1, 4) === "PNG" &&
      buffer[8] === 0x0a
    );
  }
  if (extension === "gif") {
    return buffer.length > 6 && ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6));
  }
  if (extension === "webp") {
    return (
      buffer.length > 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }
  return false;
}

/**
 * Secure replacement for the original `uploadProductImage()`.
 * Validates extension, declared MIME type and real file signature, then writes
 * a randomly-named file to `public/uploads/products/`.
 */
export async function saveProductImage(file: File | null | undefined): Promise<string | null> {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) return null;

  const extension = path.extname(file.name).slice(1).toLowerCase();
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) return null;
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(extension, buffer)) return null;

  const filename = `prod_${randomBytes(10).toString("hex")}.${extension}`;
  await mkdir(/* turbopackIgnore: true */ PRODUCT_UPLOAD_DIR, { recursive: true });
  await writeFile(/* turbopackIgnore: true */ path.join(PRODUCT_UPLOAD_DIR, filename), buffer);
  return `uploads/products/${filename}`;
}
