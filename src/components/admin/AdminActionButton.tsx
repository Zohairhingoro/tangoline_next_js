"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  endpoint: string;
  label: string;
  className?: string;
  method?: "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  confirm?: string;
  redirectTo?: string;
  /** When true the action does not produce a flash message (e.g. mark read). */
  silent?: boolean;
};

/** Generic admin mutation button: confirms, calls a Route Handler, then refreshes. */
export function AdminActionButton({
  endpoint,
  label,
  className = "btn btn-sm btn-outline-danger",
  method = "POST",
  body,
  confirm,
  redirectTo,
  silent = false,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.success) {
        if (redirectTo) {
          const params = new URLSearchParams({ error: result.error ?? "Action failed." });
          router.push(`${redirectTo}?${params.toString()}`);
        }
        return;
      }
      if (silent) {
        router.refresh();
      } else if (redirectTo) {
        const params = new URLSearchParams();
        if (result.message) params.set("success", result.message);
        const query = params.toString();
        router.push(query ? `${redirectTo}?${query}` : redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      if (redirectTo) {
        const params = new URLSearchParams({ error: "Unable to complete this action." });
        router.push(`${redirectTo}?${params.toString()}`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" className={className} onClick={run} disabled={busy}>
      {busy ? "Working..." : label}
    </button>
  );
}
