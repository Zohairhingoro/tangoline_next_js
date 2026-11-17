"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    subtotal,
    isCartOpen,
    closeCart,
    updateQty,
    removeItem,
    clear,
    showToast,
  } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isCartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const proceedToCheckout = () => {
    if (items.length === 0) {
      showToast("Your cart is empty! Add products first.", "warning");
      return;
    }
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={closeCart} />
      <div
        className="offcanvas offcanvas-end offcanvas-cart show"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="cartOffcanvasLabel"
        style={{ visibility: "visible" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold text-white d-flex align-items-center gap-2" id="cartOffcanvasLabel">
            <span style={{ color: "#e50914" }}>🛒</span> Your Shopping Cart
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={closeCart}
            aria-label="Close"
          />
        </div>

        <div className="offcanvas-body p-3">
          {items.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <div style={{ fontSize: "3.5rem", marginBottom: 15, color: "#444" }}>🛒</div>
              <h6 className="text-white fw-bold">Your cart is currently empty</h6>
              <p className="small text-muted mb-4">Discover our top-rated games, consoles, and accessories.</p>
              <Link href="/games" className="btn btn-outline-danger btn-sm px-3" onClick={closeCart}>
                Browse Games
              </Link>
              <Link href="/consoles" className="btn btn-danger btn-sm px-3 ms-2" onClick={closeCart}>
                Browse Consoles
              </Link>
            </div>
          ) : (
            <div id="cart-items-container">
              {items.map((item) => (
                <div className="cart-item-row" data-id={item.id} key={item.id}>
                  <img
                    src={item.image}
                    className="cart-item-img"
                    alt={item.title}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/images/product-placeholder.svg";
                    }}
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-title">{item.title}</div>
                    <div className="cart-item-price">{formatPrice(item.rawPrice)}</div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div className="qty-selector">
                        <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                        <input type="text" value={item.qty} readOnly />
                        <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    title="Remove"
                    onClick={() => removeItem(item.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="offcanvas-footer" id="cart-footer-panel">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary">Subtotal:</span>
              <span className="fs-5 fw-bold text-white" id="cart-subtotal-amount">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small">Delivery:</span>
              <span className="badge bg-success">FREE SHIPPING</span>
            </div>
            <div className="d-grid gap-2">
              <button type="button" className="btn btn-danger py-2 fw-bold" onClick={proceedToCheckout}>
                Proceed to Checkout
              </button>
              <Link href="/cart" className="btn btn-outline-secondary btn-sm py-1 text-light" onClick={closeCart}>
                View Full Cart
              </Link>
              <button type="button" className="btn btn-dark btn-sm text-secondary border-0" onClick={clear}>
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
