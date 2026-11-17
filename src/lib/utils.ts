import type { CartItem, StoreProduct } from "@/types";

export const CURRENCY_SYMBOL = "₨";
export const PLACEHOLDER_IMAGE = "/images/product-placeholder.svg";

/** Matches PHP `formatPrice`: ₨ + number_format(value, 2, '.', ',') */
export function formatPrice(value: number | string | null | undefined): string {
  const numeric = Number(value ?? 0) || 0;
  return (
    CURRENCY_SYMBOL +
    numeric.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** PHP-style slugify for product/category names. */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\d]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
  return slug || `item-${Date.now()}`;
}

/** Original homepage brand CSS classes used for client-side filtering. */
export function brandClass(brand: string): string {
  const lower = brand.toLowerCase();
  if (lower.includes("xbox")) return "brand-xbox";
  if (lower.includes("nintendo")) return "brand-nin";
  return "brand-ps";
}

/** Resolve a legacy relative image path (e.g. `uploads/products/x.png`) to a public URL. */
export function imagePath(image: string | null | undefined): string {
  if (!image) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) return image;
  return `/${image.replace(/^\/+/, "")}`;
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Only allow local redirects; prevents open redirects through the login form. */
export function safeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

/** Convert a catalog product into the serialized cart item used by the client. */
export function toCartItem(product: StoreProduct, qty = 1): CartItem {
  return {
    id: product.id,
    title: product.name,
    price: formatPrice(product.price),
    rawPrice: product.price,
    image: product.image,
    brand: product.brand,
    desc: product.shortDescription || product.description,
    docx: product.docxUrl,
    qty,
  };
}
