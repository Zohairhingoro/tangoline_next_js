"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/types";

const NAV_LINKS = [
  { key: "dashboard", label: "Dashboard", icon: "📊", href: "/admin/dashboard" },
  { key: "products", label: "Products", icon: "🎮", href: "/admin/products" },
  { key: "categories", label: "Categories", icon: "📁", href: "/admin/categories" },
  { key: "orders", label: "Orders", icon: "📦", href: "/admin/orders" },
  { key: "users", label: "Users", icon: "👥", href: "/admin/users" },
  { key: "activity", label: "Login Activity", icon: "🛡️", href: "/admin/users/activity" },
  { key: "visitors", label: "Visitor Analytics", icon: "📈", href: "/admin/analytics/visitors" },
  { key: "downloads", label: "Download Logs", icon: "⬇️", href: "/admin/analytics/downloads" },
  { key: "messages", label: "Messages", icon: "✉️", href: "/admin/messages" },
] as const;

function activeKeyFor(pathname: string): string {
  if (pathname.startsWith("/admin/products")) return "products";
  if (pathname.startsWith("/admin/categories")) return "categories";
  if (pathname.startsWith("/admin/orders")) return "orders";
  if (pathname.startsWith("/admin/users/activity")) return "activity";
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/analytics/visitors")) return "visitors";
  if (pathname.startsWith("/admin/analytics/downloads")) return "downloads";
  if (pathname.startsWith("/admin/messages")) return "messages";
  return "dashboard";
}

export function AdminShell({
  admin,
  children,
}: {
  admin: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);

  const activeKey = activeKeyFor(pathname);
  const flashType = searchParams.get("success")
    ? "success"
    : searchParams.get("error")
      ? "danger"
      : null;
  const flashMessage =
    flashType === "success" ? searchParams.get("success") : searchParams.get("error");

  useEffect(() => {
    // Clear flash query params after they have been displayed once.
    if (!flashMessage || dismissedFlash === flashMessage) return;
    const timer = window.setTimeout(() => {
      setDismissedFlash(flashMessage);
      router.replace(pathname, { scroll: false });
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [flashMessage, dismissedFlash, pathname, router]);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="admin-shell-body">
      <header className="admin-navbar d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <Link href="/admin/dashboard" className="text-decoration-none d-flex align-items-center gap-2">
            <img src="/logo.png" width="36" alt="Logo" />
            <span className="fs-5 fw-bold text-white">
              <span style={{ color: "var(--admin-red)" }}>Tangoline</span> Admin
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="btn btn-outline-secondary btn-sm ms-2 text-light"
            title="View Public Website"
          >
            🌐 Storefront ↗
          </Link>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary small d-none d-md-inline">
            Logged in as: <strong className="text-white">{admin.name || admin.username}</strong>
          </span>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={logout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      <div className="container-fluid">
        <div className="row">
          <nav className="col-md-3 col-lg-2 d-md-block admin-sidebar">
            <div className="position-sticky">
              <ul className="nav flex-column">
                {NAV_LINKS.map((link) => (
                  <li className="nav-item" key={link.key}>
                    <Link
                      href={link.href}
                      className={`admin-nav-link ${activeKey === link.key ? "active" : ""}`}
                    >
                      <span>{link.icon}</span> {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            {flashMessage && flashType ? (
              <div
                className={`alert alert-${flashType} alert-dismissible fade show`}
                role="alert"
              >
                {flashMessage}
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setDismissedFlash(flashMessage)}
                />
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>

      <footer className="mt-auto py-3 bg-dark text-secondary border-top border-secondary text-center small">
        <div className="container-fluid">
          <span>Tangoline E-Commerce Enterprise Control Panel &bull; Raw PHP &bull; MySQL PDO</span>
        </div>
      </footer>
    </div>
  );
}
