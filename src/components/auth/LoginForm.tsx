"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export function LoginForm({ redirect }: { redirect: string }) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: String(data.get("username") ?? "").trim(),
          password: String(data.get("password") ?? ""),
          redirect,
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        redirect?: string;
        name?: string;
      };
      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to log in.");
        return;
      }
      try {
        localStorage.setItem(
          "tangoline_user",
          JSON.stringify({
            name: result.name || String(data.get("username") ?? ""),
            loggedIn: true,
          }),
        );
      } catch {
        // Storage may be disabled.
      }
      window.location.href = result.redirect ?? redirect;
    } catch {
      setError("Unable to log in. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <AuthBackdrop />
      <div className="signin">
        <div className="content">
          <h2>Login</h2>

          {error ? (
            <div className="auth-alert">{error}</div>
          ) : redirect.includes("checkout") ? (
            <div
              className="auth-alert"
              style={{
                color: "#ffc107",
                borderColor: "#ffc107",
                background: "rgba(255, 193, 7, 0.15)",
              }}
            >
              Please log in to complete your checkout.
            </div>
          ) : null}

          <form className="form" onSubmit={login}>
            <input type="hidden" name="redirect" value={redirect} />

            <div className="inputBox">
              <input type="text" name="username" required autoComplete="username" />{" "}
              <i>Username or Email</i>
            </div>
            <div className="inputBox">
              <input type="password" name="password" required autoComplete="current-password" />{" "}
              <i>Password</i>
            </div>
            <div className="links">
              <Link
                href={`/register?redirect=${encodeURIComponent(redirect)}`}
              >
                Don&apos;t have an account? Sign Up
              </Link>
            </div>
            <div className="inputBox">
              <input type="submit" value={submitting ? "Please wait..." : "Login"} />
            </div>
            <div style={{ textAlign: "center", marginTop: 15 }}>
              <Link
                href="/"
                style={{ color: "#888", fontSize: "0.85rem", textDecoration: "none" }}
              >
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
