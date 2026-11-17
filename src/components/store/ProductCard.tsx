"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useStore } from "@/components/store/StoreProvider";
import { formatPrice } from "@/lib/utils";
import type { StoreProduct } from "@/types";

type ProductCardProps = {
  product: StoreProduct;
  /** Extra classes used by the original client-side brand/type filters. */
  filterClasses?: string;
  variant?: "default" | "pc";
  rating?: string;
};

export function ProductCard({
  product,
  filterClasses = "",
  variant = "default",
  rating = "5.0",
}: ProductCardProps) {
  const { addItem, openQuickView } = useStore();
  const inStock = product.stockStatus === "in_stock";
  const fallback = variant === "pc" ? "/images/pc-hub.jpg" : "/images/product-placeholder.svg";
  const desc = product.shortDescription || product.description;

  return (
    <div className={`col product-item-col ${filterClasses}`.trim()} data-brand-filters={filterClasses}>
      <div
        className="product-card"
        data-id={product.id}
        data-title={product.name}
        data-price={formatPrice(product.price)}
        data-raw-price={product.price}
        data-brand={product.brand}
        data-platform={product.platform}
        data-image={product.image}
        data-desc={desc}
        data-full-desc={product.description}
        data-specs={product.specifications ?? ""}
        data-reqs={product.systemRequirements ?? ""}
        data-docx={product.docxUrl}
        data-stock={product.stockStatus}
      >
        <div
          className="product-image-wrap"
          title="Click to view details"
          onClick={() => openQuickView(product)}
        >
          <span className="badge-platform">{product.platform}</span>
          <span className="badge-stock">{inStock ? "● In Stock" : "○ Out of Stock"}</span>
          <img
            src={product.image}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallback;
            }}
          />
        </div>
        <div className="card-body">
          {variant === "pc" && (
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="badge bg-dark border border-secondary text-secondary small">
                {product.brand}
              </span>
              <div className="product-rating mb-0">
                <span>★★★★★</span>
                <span className="reviews-count">4.9</span>
              </div>
            </div>
          )}

          <h3 className="product-title" title={product.name}>
            <Link href={`/product/${product.slug}`} className="text-white text-decoration-none">
              {product.name}
            </Link>
          </h3>

          {variant !== "pc" && (
            <div className="product-rating">
              <span>★★★★★</span>
              <span className="reviews-count">{rating}</span>
            </div>
          )}

          <div className="product-price-row">
            <div>
              <span className="product-price">{formatPrice(product.price)}</span>
              {product.originalPrice ? (
                <span className="product-original-price">
                  {formatPrice(product.originalPrice)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="card-actions-grid">
            <a
              href={product.docxUrl}
              className="btn-card-action btn-specs"
              title="Download Official Specs Document"
            >
              Save Details
            </a>
            <button
              type="button"
              className="btn-card-action btn-quick-view btn-quick-view-trigger"
              onClick={() => openQuickView(product)}
            >
              Quick View
            </button>
          </div>

          <button
            type="button"
            className="btn-add-cart btn-add-to-cart-card"
            disabled={!inStock}
            onClick={() => addItem(product, 1)}
          >
            <span>🛒</span> {inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function brandClass(brand: string): string {
  const lower = brand.toLowerCase();
  if (lower.includes("xbox")) return "brand-xbox";
  if (lower.includes("nintendo")) return "brand-nin";
  return "brand-ps";
}

export function pcPartClasses(name: string, brand: string): string {
  const lowerName = name.toLowerCase();
  const lowerBrand = brand.toLowerCase();
  const classes: string[] = [];

  if (
    lowerName.includes("processor") ||
    lowerName.includes("ryzen") ||
    lowerName.includes("core i")
  ) {
    classes.push("brand-cpu");
  }
  if (
    lowerName.includes("geforce") ||
    lowerName.includes("radeon") ||
    lowerName.includes("rtx") ||
    lowerName.includes("rx")
  ) {
    classes.push("brand-gpu");
  }
  if (lowerName.includes("motherboard")) classes.push("brand-motherboard");
  if (
    lowerName.includes("ddr5") ||
    lowerName.includes("ssd") ||
    lowerName.includes("ram")
  ) {
    classes.push("brand-ram-ssd");
  }
  if (
    lowerName.includes("case") ||
    lowerName.includes("cooler") ||
    lowerName.includes("psu") ||
    lowerName.includes("power supply")
  ) {
    classes.push("brand-case-cooling");
  }
  if (
    lowerName.includes("monitor") ||
    lowerName.includes("keyboard") ||
    lowerName.includes("mouse")
  ) {
    classes.push("brand-peripheral");
  }
  classes.push(`brand-${lowerBrand.replace(/[^a-z0-9]/g, "")}`);
  return [...new Set(classes)].filter(Boolean).join(" ");
}
