"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRef, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { formatPrice } from "@/lib/utils";
import type { SessionUser } from "@/types";

type PaymentMethod = "cash_on_delivery" | "credit_debit_card" | "mobile_wallet";

type OrderSuccess = {
  orderNumber: string;
  formattedTotal: string;
};

export function CheckoutForm({ user }: { user: SessionUser }) {
  const { items, subtotal, clear, showToast } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccess | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cityRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  const selectPaymentMethod = (method: PaymentMethod) => setPaymentMethod(method);

  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "warning");
      return;
    }
    showToast("Detecting location...", "info");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const cityEl = cityRef.current;
        const addressEl = addressRef.current;
        if (cityEl && !cityEl.value) cityEl.value = "Karachi";
        if (addressEl && !addressEl.value) {
          addressEl.value =
            "Delivery Coords: " +
            position.coords.latitude.toFixed(4) +
            ", " +
            position.coords.longitude.toFixed(4);
        }
        showToast("Location coordinates detected.", "success");
      },
      () => {
        showToast("Unable to retrieve location automatically. Please type it in.", "warning");
      },
    );
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your shopping cart is empty.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(data.get("full_name") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim(),
          address: String(data.get("address") ?? "").trim(),
          city: String(data.get("city") ?? "").trim(),
          postalCode: String(data.get("postal_code") ?? "").trim(),
          paymentMethod,
          notes: String(data.get("notes") ?? "").trim(),
          items: items.map((item) => ({ id: item.id, qty: item.qty })),
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        orderNumber?: string;
        formattedTotal?: string;
      };

      if (!response.ok || !result.success) {
        setError(result.error ?? "Failed to process order. Please try again later.");
        return;
      }

      setOrderSuccess({
        orderNumber: result.orderNumber ?? "",
        formattedTotal: result.formattedTotal ?? formatPrice(subtotal),
      });
      clear();
    } catch {
      setError("Failed to process order. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container checkout-container">
      {orderSuccess ? (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content dark-modal text-center p-4">
              <div style={{ fontSize: "3.5rem", color: "#28a745", marginBottom: 10 }}>✔</div>
              <h3 className="fw-bold text-white mb-2">Order Confirmed!</h3>
              <p className="text-secondary small mb-3">
                Thank you for your order. Your purchase has been recorded and dispatched for
                delivery.
              </p>

              <div className="bg-dark p-3 rounded border border-secondary text-start mb-4">
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Order Number:</span>
                  <strong className="text-white">#{orderSuccess.orderNumber}</strong>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Total Paid:</span>
                  <strong className="text-danger">{orderSuccess.formattedTotal}</strong>
                </div>
                <div className="d-flex justify-content-between small text-secondary">
                  <span>Estimated Delivery:</span>
                  <strong className="text-white">2 - 3 Business Days</strong>
                </div>
              </div>

              <div className="d-grid gap-2">
                <Link href="/profile" className="btn btn-danger py-2 fw-bold">
                  View In Order History
                </Link>
                <Link href="/products" className="btn btn-outline-secondary btn-sm text-light">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}

          <form id="checkout-order-form" onSubmit={submitOrder}>
            <div className="checkout-card">
              <div className="checkout-heading">
                <span className="step-num">1</span>
                <span>Shipping Information</span>
              </div>

              <div className="location-btn-wrap">
                <button type="button" id="btn-use-location" onClick={autoDetectLocation}>
                  <span>📍</span> Auto-fill Location
                </button>
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    id="ship-name"
                    className="form-control"
                    required
                    defaultValue={user.name || user.username}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    id="ship-phone"
                    className="form-control"
                    placeholder="+92 3XX XXXXXXX"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-light small fw-bold">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    id="ship-email"
                    className="form-control"
                    required
                    defaultValue={user.email}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-light small fw-bold">Delivery Address *</label>
                  <textarea
                    name="address"
                    id="ship-address"
                    className="form-control"
                    rows={2}
                    placeholder="House/Apartment #, Street, Area"
                    required
                    ref={addressRef}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">City *</label>
                  <input
                    type="text"
                    name="city"
                    id="ship-city"
                    className="form-control"
                    placeholder="Karachi / Lahore / Islamabad"
                    required
                    defaultValue="Karachi"
                    ref={cityRef}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    id="ship-postal"
                    className="form-control"
                    placeholder="74200"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-light small fw-bold">
                    Order Notes / Delivery Instructions
                  </label>
                  <input
                    type="text"
                    name="notes"
                    className="form-control"
                    placeholder="Special delivery directions, gate codes, etc."
                  />
                </div>
              </div>
            </div>

            <div className="checkout-card">
              <div className="checkout-heading">
                <span className="step-num">2</span>
                <span>Select Payment Method</span>
              </div>

              <div
                className={`payment-option-card ${paymentMethod === "cash_on_delivery" ? "selected" : ""}`}
                id="opt-cod"
                onClick={() => selectPaymentMethod("cash_on_delivery")}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="pay-cod"
                  value="cash_on_delivery"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={() => selectPaymentMethod("cash_on_delivery")}
                />
                <label htmlFor="pay-cod" className="text-white mb-0 fw-bold ms-2 cursor-pointer">
                  Cash on Delivery (Pay upon delivery anywhere in Pakistan)
                </label>
              </div>

              <div
                className={`payment-option-card ${paymentMethod === "credit_debit_card" ? "selected" : ""}`}
                id="opt-card"
                onClick={() => selectPaymentMethod("credit_debit_card")}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="pay-card"
                  value="credit_debit_card"
                  checked={paymentMethod === "credit_debit_card"}
                  onChange={() => selectPaymentMethod("credit_debit_card")}
                />
                <label htmlFor="pay-card" className="text-white mb-0 fw-bold ms-2 cursor-pointer">
                  Credit / Debit Card (Visa, Mastercard, PayPak)
                </label>
              </div>

              {paymentMethod === "credit_debit_card" ? (
                <div id="card-fields-box" className="p-3 mb-3 rounded bg-dark border border-secondary">
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="text-light small">Card Number</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="4242 •••• •••• 4242"
                        maxLength={19}
                      />
                    </div>
                    <div className="col-6">
                      <label className="text-light small">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="12/28"
                        maxLength={5}
                      />
                    </div>
                    <div className="col-6">
                      <label className="text-light small">CVV</label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        placeholder="•••"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div
                className={`payment-option-card ${paymentMethod === "mobile_wallet" ? "selected" : ""}`}
                id="opt-wallet"
                onClick={() => selectPaymentMethod("mobile_wallet")}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="pay-wallet"
                  value="mobile_wallet"
                  checked={paymentMethod === "mobile_wallet"}
                  onChange={() => selectPaymentMethod("mobile_wallet")}
                />
                <label htmlFor="pay-wallet" className="text-white mb-0 fw-bold ms-2 cursor-pointer">
                  Mobile Wallet (JazzCash / EasyPaisa / SadaPay / Nayapay)
                </label>
              </div>

              {paymentMethod === "mobile_wallet" ? (
                <div id="wallet-fields-box" className="p-3 mb-3 rounded bg-dark border border-secondary">
                  <label className="text-light small">Mobile Account Number</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    placeholder="03XXXXXXXXX"
                  />
                </div>
              ) : null}

              <button
                type="submit"
                id="btn-submit-order"
                className="btn btn-danger w-100 py-3 fw-bold mt-3 fs-5"
                disabled={items.length === 0 || submitting}
              >
                {submitting ? "Processing Order..." : "Place Order & Complete Purchase"}
              </button>
            </div>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <div className="checkout-card">
            <div className="checkout-heading">
              <span>🛒</span>
              <span>Your Order Items ({items.length})</span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                <p className="mb-2">Your cart is currently empty.</p>
                <Link href="/products" className="btn btn-outline-danger btn-sm">
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                <div id="checkout-items-list">
                  {items.map((item) => (
                    <div className="order-summary-item" key={item.id}>
                      <img
                        src={item.image}
                        className="order-summary-img"
                        alt={item.title}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/images/product-placeholder.svg";
                        }}
                      />
                      <div className="flex-grow-1">
                        <div className="text-white fw-bold small line-clamp-1">{item.title}</div>
                        <div className="text-secondary small">
                          Qty: {item.qty} × {formatPrice(item.rawPrice)}
                        </div>
                      </div>
                      <div className="text-danger fw-bold small">
                        {formatPrice(item.rawPrice * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-top border-secondary">
                  <div className="d-flex justify-content-between text-secondary mb-2">
                    <span>Subtotal:</span>
                    <span className="text-white fw-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-secondary mb-2">
                    <span>Shipping:</span>
                    <span className="badge bg-success">FREE EXPRESS</span>
                  </div>
                  <hr className="border-secondary" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-white fs-5 fw-bold">Total Amount:</span>
                    <span className="text-danger fs-4 fw-bold">{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
