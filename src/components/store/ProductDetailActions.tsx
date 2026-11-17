"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import type { StoreProduct } from "@/types";

export function ProductDetailActions({ product }: { product: StoreProduct }) {
  const [qty, setQty] = useState(1);
  const { addItem } = useStore();
  const router = useRouter();
  const inStock = product.stockStatus === "in_stock";

  return (
    <div className="border-top border-secondary pt-4 mt-3">
      <div className="d-flex align-items-center gap-3 mb-4">
        <label className="text-light fw-bold">Quantity:</label>
        <div className="qty-selector">
          <button type="button" id="detail-qty-minus" onClick={() => setQty((value) => Math.max(1, value - 1))}>-</button>
          <input type="text" id="detail-qty-input" value={qty} readOnly />
          <button type="button" id="detail-qty-plus" onClick={() => setQty((value) => Math.min(99, value + 1))}>+</button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-3">
        <button
          type="button"
          id="btn-detail-add-cart"
          className="btn btn-danger px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
          disabled={!inStock}
          onClick={() => addItem(product, qty)}
        >
          <span>🛒</span> Add to Cart
        </button>
        <button
          type="button"
          id="btn-detail-buy-now"
          className="btn btn-outline-danger px-4 py-2 fw-bold"
          disabled={!inStock}
          onClick={() => {
            addItem(product, qty);
            router.push("/checkout");
          }}
        >
          Buy Now
        </button>
        <a
          href={product.docxUrl}
          className="btn btn-dark border-secondary px-4 py-2 text-light"
          title="Download Word Specifications Document"
        >
          📄 Download Details (.docx)
        </a>
      </div>
    </div>
  );
}
