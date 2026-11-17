"use client";

import { useState } from "react";
import type { SessionUser } from "@/types";

export function ContactForm({ user }: { user: SessionUser | null }) {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          subject: String(data.get("subject") ?? "General Inquiry").trim() || "General Inquiry",
          message: String(data.get("message") ?? "").trim(),
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to send your message. Please try again.");
        return;
      }

      setSuccess(
        result.message ??
          "Thank you! Your message has been sent to Tangoline Inc. We will respond promptly.",
      );
      form.reset();
    } catch {
      setError("Unable to send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-card">
      <h2 className="text-center mb-4 fw-bold" style={{ color: "#e50914" }}>
        Get In Touch
      </h2>
      <p className="text-secondary text-center mb-4">
        Have questions about an upcoming game release, console availability, or existing orders?
        Leave us a message below.
      </p>

      {success ? (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      <form onSubmit={submitMessage}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label text-light fw-bold">
            Full Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            placeholder="John Doe"
            required
            defaultValue={user?.name ?? ""}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label text-light fw-bold">
            Email Address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="name@example.com"
            required
            defaultValue={user?.email ?? ""}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="form-label text-light fw-bold">
            Message
          </label>
          <textarea
            className="form-control"
            id="message"
            name="message"
            rows={4}
            placeholder="How can we assist you with our gaming products?"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-danger w-100 py-2 fw-bold"
          style={{ fontSize: "1.05rem" }}
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
