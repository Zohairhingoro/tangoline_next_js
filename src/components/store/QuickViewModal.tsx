"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { formatPrice } from "@/lib/utils";

export function QuickViewModal() {
  const { quickView, closeQuickView, addItem } = useStore();
  const router = useRouter();
  const [qtyState, setQtyState] = useState({ productId: 0, value: 1 });
  const qty =
    quickView && qtyState.productId === quickView.id ? qtyState.value : 1;

  const setQty = (value: number) => {
    if (!quickView) return;
    setQtyState({
      productId: quickView.id,
      value: Math.max(1, Math.min(99, value)),
    });
  };

  useEffect(() => {
    if (!quickView) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeQuickView();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [quickView, closeQuickView]);

  if (!quickView) return null;

  const inStock = quickView.stockStatus === "in_stock";

  return (
    <>
      <div className="modal-backdrop fade show" onClick={closeQuickView} />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-product-title"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content dark-modal">
            <div className="modal-header">
              <div className="d-flex align-items-center gap-2">
                <span id="modal-product-brand" className="badge bg-danger">
                  {quickView.brand.toUpperCase()}
                </span>
                <span id="modal-product-stock" className={`badge ${inStock ? "bg-success" : "bg-secondary"}`}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeQuickView}
                aria-label="Close"
              />
            </div>
            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-12 col-md-5 text-center">
                  <img
                    id="modal-product-img"
                    src={quickView.image}
                    className="modal-product-img"
                    alt={quickView.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/images/product-placeholder.svg";
                    }}
                  />
                </div>
                <div className="col-12 col-md-7">
                  <h2 id="modal-product-title" className="fs-4 fw-bold text-white mb-2">
                    {quickView.name}
                  </h2>
                  <div className="text-warning mb-2 fs-6">
                    ★★★★★ <span className="text-muted ms-1 fs-7">Official Genuine Product</span>
                  </div>
                  <div className="mb-3">
                    <span id="modal-product-price" className="fs-3 fw-bold text-danger">
                      {formatPrice(quickView.price)}
                    </span>
                    {quickView.originalPrice ? (
                      <span id="modal-product-orig-price" className="text-muted text-decoration-line-through ms-2">
                        {formatPrice(quickView.originalPrice)}
                      </span>
                    ) : (
                      <span id="modal-product-orig-price" className="text-muted text-decoration-line-through ms-2" />
                    )}
                  </div>
                  <p
                    id="modal-product-desc"
                    className="text-secondary mb-4"
                    style={{ lineHeight: 1.6, fontSize: "0.95rem" }}
                  >
                    {quickView.shortDescription || quickView.description}
                  </p>

                  <div className="d-flex align-items-center gap-3 mb-4">
                    <label className="text-light fw-bold">Quantity:</label>
                    <div className="qty-selector">
                      <button type="button" onClick={() => setQty(qty - 1)}>-</button>
                      <input type="text" value={qty} readOnly />
                      <button type="button" onClick={() => setQty(qty + 1)}>+</button>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      id="modal-add-to-cart"
                      className="btn btn-danger px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                      disabled={!inStock}
                      onClick={() => {
                        addItem(quickView, qty);
                        closeQuickView();
                      }}
                    >
                      <span>🛒</span> Add to Cart
                    </button>
                    <button
                      type="button"
                      id="modal-buy-now"
                      className="btn btn-outline-danger px-3 py-2 fw-bold"
                      disabled={!inStock}
                      onClick={() => {
                        addItem(quickView, qty);
                        closeQuickView();
                        router.push("/checkout");
                      }}
                    >
                      Buy Now
                    </button>
                    <a
                      id="modal-docx-download"
                      href={quickView.docxUrl}
                      className="btn btn-dark border-secondary px-3 py-2 text-light"
                    >
                      Download Specs (.docx)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
