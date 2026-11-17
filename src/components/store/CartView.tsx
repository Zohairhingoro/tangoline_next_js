"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useStore } from "@/components/store/StoreProvider";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { items, subtotal, updateQty, removeItem, clear } = useStore();

  return (
    <main className="container my-5">
      <h1 className="h3 fw-bold text-white mb-4">Shopping Cart</h1>

      {items.length === 0 ? (
        <div
          className="p-5 text-center rounded-3"
          style={{ background: "rgba(18, 18, 18, 0.9)", border: "1px solid #2a2a2a" }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: 15, color: "#444" }}>🛒</div>
          <h4 className="text-white fw-bold">Your cart is currently empty</h4>
          <p className="text-secondary mb-4">
            Discover our top-rated games, consoles, and pro accessories.
          </p>
          <Link href="/games" className="btn btn-outline-danger me-2">
            Browse Games
          </Link>
          <Link href="/consoles" className="btn btn-danger">
            Browse Consoles
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div
              className="p-4 rounded-3"
              style={{ background: "rgba(18, 18, 18, 0.9)", border: "1px solid #2a2a2a" }}
            >
              <div className="table-responsive">
                <table className="table text-white align-middle mb-0">
                  <thead>
                    <tr className="border-secondary text-secondary small">
                      <th scope="col">Product</th>
                      <th scope="col">Price</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Total</th>
                      <th scope="col" className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr className="border-secondary" key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.title}
                              width="60"
                              height="60"
                              style={{
                                objectFit: "contain",
                                background: "#111",
                                borderRadius: 6,
                                padding: 4,
                              }}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = "/images/product-placeholder.svg";
                              }}
                            />
                            <div>
                              <div className="fw-bold text-white line-clamp-1">{item.title}</div>
                              <div className="text-secondary small">{item.brand || "Gaming"}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(item.rawPrice)}</td>
                        <td>
                          <div className="qty-selector">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty - 1)}
                            >
                              -
                            </button>
                            <input type="text" value={item.qty} readOnly />
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-danger fw-bold">
                          {formatPrice(item.rawPrice * item.qty)}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            title="Remove"
                            onClick={() => removeItem(item.id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary">
                <Link href="/products" className="btn btn-outline-secondary btn-sm">
                  ← Continue Shopping
                </Link>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={clear}>
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div
              className="p-4 rounded-3"
              style={{ background: "rgba(18, 18, 18, 0.9)", border: "1px solid #2a2a2a" }}
            >
              <h3 className="h5 fw-bold text-white mb-3">Order Summary</h3>
              <div className="d-flex justify-content-between text-secondary mb-2">
                <span>Subtotal:</span>
                <span className="text-white fw-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary mb-3">
                <span>Delivery:</span>
                <span className="badge bg-success">FREE DELIVERY</span>
              </div>
              <hr className="border-secondary" />
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fs-5 text-white">Estimated Total:</span>
                <span className="fs-4 fw-bold text-danger">{formatPrice(subtotal)}</span>
              </div>
              <Link href="/checkout" className="btn btn-danger w-100 py-2 fw-bold">
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
