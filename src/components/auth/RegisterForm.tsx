"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export function RegisterForm({ redirect }: { redirect: string }) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(data.get("username") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          password: String(data.get("password") ?? ""),
          redirect,
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        redirect?: string;
      };
      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to create account.");
        return;
      }
      try {
        localStorage.setItem(
          "tangoline_user",
          JSON.stringify({
            name: String(data.get("username") ?? ""),
            loggedIn: true,
          }),
        );
      } catch {
        // Storage may be disabled.
      }
      window.location.href = result.redirect ?? redirect;
    } catch {
      setError("Unable to create account. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <AuthBackdrop />
      <div className="signin">
        <div className="content">
          <h2>Sign Up</h2>

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
              Create an account to complete your checkout.
            </div>
          ) : null}

          <form className="form" onSubmit={register}>
            <input type="hidden" name="redirect" value={redirect} />

            <div className="inputBox">
              <input type="text" name="username" required autoComplete="username" /> <i>Username</i>
            </div>
            <div className="inputBox">
              <input type="email" name="email" required autoComplete="email" /> <i>Email</i>
            </div>
            <div className="inputBox">
              <input
                type="password"
                name="password"
                required
                autoComplete="new-password"
              />{" "}
              <i>Password</i>
            </div>
            <div className="links">
              <Link href={`/login?redirect=${encodeURIComponent(redirect)}`}>
                Already have an account? Login
              </Link>
            </div>
            <div className="inputBox">
              <input type="submit" value={submitting ? "Please wait..." : "Sign Up"} />
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
