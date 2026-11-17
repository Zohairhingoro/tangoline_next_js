"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useStore } from "@/components/store/StoreProvider";

export function Footer() {
  const { showToast } = useStore();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="footer-brand-title">
              <img
                src="/logo.png"
                width="36"
                alt="Tangoline Logo"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/images/product-placeholder.svg";
                }}
              />
              <span>Tangoline, Inc.</span>
            </div>
            <p className="footer-tagline">
              Unlock your inner gamer with Pakistan&apos;s premier gaming hub. Providing authentic gaming consoles, blockbuster game titles, pro controllers, and accessories with official warranty.
            </p>
            <div className="d-flex align-items-center gap-3 text-secondary small">
              <span><strong style={{ color: "#e50914" }}>✔</strong> 100% Genuine</span>
              <span><strong style={{ color: "#e50914" }}>✔</strong> Fast Nationwide Delivery</span>
            </div>
          </div>

          <div className="col-6 col-md-6 col-lg-2">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">All Products</Link></li>
              <li><Link href="/games">Video Games</Link></li>
              <li><Link href="/consoles">Gaming Consoles</Link></li>
              <li><Link href="/pc-parts">PC Parts &amp; Hardware</Link></li>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/contact-us">Contact Us</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-6 col-lg-3">
            <h4 className="footer-heading">Store Contact</h4>
            <div className="footer-contact-item">
              <span className="icon">📍</span>
              <span>
                <a
                  href="https://www.google.com/maps/place/Aptech+Computer+Education+I.I.Chundrigar+Center/@24.8515375,67.0167656,15z"
                  target="_blank"
                  rel="noreferrer"
                >
                  5th floor, Saima Tower near Aptech Ins, I.I Chundrigar Rd, Karachi.
                </a>
              </span>
            </div>
            <div className="footer-contact-item">
              <span className="icon">✉️</span>
              <span><a href="mailto:tangoline.Inc@gmail.com">tangoline.Inc@gmail.com</a></span>
            </div>
            <div className="footer-contact-item">
              <span className="icon">📞</span>
              <span><a href="tel:+923123456789">+92 312 3456789</a></span>
            </div>
            <div className="footer-contact-item">
              <span className="icon">🕒</span>
              <span>Mon - Sat: 10:00 AM - 9:00 PM</span>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h4 className="footer-heading">Newsletter</h4>
            <p className="small text-secondary mb-3">Subscribe for exclusive discount drops &amp; upcoming game release alerts.</p>
            <form
              className="footer-newsletter-form"
              onSubmit={(event) => {
                event.preventDefault();
                showToast("Subscribed to newsletter successfully!", "success");
                event.currentTarget.reset();
              }}
            >
              <input type="email" placeholder="Enter your email" required aria-label="Email address" />
              <button type="submit">Subscribe</button>
            </form>
            <div className="footer-social-links">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Twitter / X">𝕏</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Facebook">f</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Instagram">📷</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="YouTube">▶</a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Discord">🎮</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="row align-items-center">
            <div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0">
              <p className="mb-0">
                &copy; 2024–2026 Tangoline, Inc. All rights reserved.{" "}
                <span className="d-block d-sm-inline ms-sm-2 text-secondary">
                  Made by <strong className="text-white">Zohair Hingoro</strong>
                </span>
              </p>
            </div>
            <div className="col-12 col-md-6 text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end gap-3">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Support</a>
                <Link href="/admin/login" className="text-muted small" title="Admin Portal">Admin</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
