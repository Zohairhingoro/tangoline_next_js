"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(data.get("username") ?? "").trim(),
          password: String(data.get("password") ?? ""),
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        redirect?: string;
      };
      if (!response.ok || !result.success) {
        setError(result.error ?? "Invalid administrator credentials.");
        return;
      }
      router.replace(result.redirect ?? "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to log in. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-box text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" width="60" alt="Tangoline Logo" className="mb-3" />
      <h2 className="h4 fw-bold text-white mb-1">
        <span style={{ color: "#e50914" }}>Tangoline</span> Administrator
      </h2>
      <p className="text-secondary small mb-4">Authorized Administrative Personnel Only</p>

      {error ? (
        <div className="alert alert-danger py-2 small text-start" role="alert">
          {error}
        </div>
      ) : null}

      <form onSubmit={login} className="text-start">
        <div className="mb-3">
          <label className="form-label text-light small fw-bold">
            Admin Username or Email
          </label>
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="admin"
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label text-light small fw-bold">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" className="btn btn-danger w-100 py-2 fw-bold" disabled={submitting}>
          {submitting ? "Authenticating..." : "Access Dashboard"}
        </button>
      </form>

      <div className="mt-4 pt-3 border-top border-secondary">
        <Link href="/" className="text-secondary small text-decoration-none">
          ← Return to Public Storefront
        </Link>
      </div>
    </div>
  );
}
