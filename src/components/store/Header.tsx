"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/store/StoreProvider";
import type { SessionUser } from "@/types";

const links = [
  { href: "/", label: "Home", key: "home" },
  { href: "/products", label: "Products", key: "products" },
  { href: "/about-us", label: "About Us", key: "about" },
  { href: "/contact-us", label: "Contact us", key: "contact" },
];

export function Header({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const { count, openCart } = useStore();

  const activeKey =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/about")
        ? "about"
        : pathname.startsWith("/contact")
          ? "contact"
          : "products";

  return (
    <div className="container">
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom border-secondary">
        <Link href="/" className="d-flex align-items-center mb-3 mb-md-0 text-decoration-none">
          <img
            src="/logo.png"
            width="70"
            className="logo"
            alt="Tangoline Inc Logo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/images/product-placeholder.svg";
            }}
          />
        </Link>

        <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
          {links.map((link) => {
            const active = activeKey === link.key;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link px-3 nl ${active ? "active" : ""}`}
                  style={active ? { color: "#e50914 !important" } : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="col-md-4 text-end d-flex align-items-center justify-content-end" id="nav-auth-container">
          <button
            type="button"
            className="btn-nav-cart me-2"
            onClick={openCart}
            title="View Cart"
          >
            <span>🛒</span> Cart{" "}
            <span
              className="cart-badge cart-count-badge"
              style={{ display: count > 0 ? "inline-block" : "none" }}
            >
              {count}
            </span>
          </button>
          {user ? (
            <>
              <Link
                href="/profile"
                className="btn btn-outline-light me-2 btn-sm d-inline-flex align-items-center gap-1"
              >
                <span>👤</span> {user.name || user.username}
              </Link>
              <Link href="/logout" className="btn btn-outline-danger btn-sm">
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline-danger me-2 btn-sm">
                Login
              </Link>
              <Link href="/register" className="btn btn-danger btn-sm">
                Sign-up
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
