"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["Pending", "Processing", "Completed", "Cancelled"] as const;

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: String(data.get("status") ?? "") }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to update this order.");
        return;
      }
      const params = new URLSearchParams({ success: result.message ?? "Order updated." });
      router.push(`/admin/orders/${orderId}?${params.toString()}`);
      router.refresh();
    } catch {
      setError("Unable to update this order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-card mb-4">
      <h2 className="h5 fw-bold text-white mb-3">Update Order Status</h2>
      {error ? <div className="alert alert-danger py-2 small">{error}</div> : null}
      <form onSubmit={submit}>
        <input type="hidden" name="action" value="update_status" />
        <div className="mb-3">
          <label className="form-label text-light small">Current Status</label>
          <select name="status" className="form-select" defaultValue={status}>
            {STATUSES.map((value) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-danger w-100 btn-sm py-2" disabled={saving}>
          {saving ? "Updating..." : "Update Order Status"}
        </button>
      </form>
    </div>
  );
}
