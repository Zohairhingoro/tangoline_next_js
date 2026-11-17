"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initial: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    city: string;
    status: string;
  };
};

export function UserEditForm({ initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(data.get("username") ?? ""),
          email: String(data.get("email") ?? ""),
          fullName: String(data.get("full_name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          city: String(data.get("city") ?? ""),
          status: String(data.get("status") ?? "active"),
          newPassword: String(data.get("new_password") ?? ""),
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to update this account.");
        return;
      }
      const params = new URLSearchParams({ success: result.message ?? "User updated." });
      router.push(`/admin/users/${initial.id}?${params.toString()}`);
      router.refresh();
    } catch {
      setError("Unable to update this account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <h1 className="h3 fw-bold text-white mb-0">
          Edit: {initial.fullName || initial.username}
        </h1>
        <Link href={`/admin/users/${initial.id}`} className="btn btn-outline-secondary btn-sm">
          ← Back to Profile
        </Link>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="admin-card" style={{ maxWidth: "680px" }}>
        <form onSubmit={submit}>
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label text-light small fw-bold">Username *</label>
              <input
                type="text"
                name="username"
                className="form-control"
                defaultValue={initial.username}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label text-light small fw-bold">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                defaultValue={initial.email}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label text-light small fw-bold">Full Name</label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                defaultValue={initial.fullName}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label text-light small fw-bold">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                defaultValue={initial.phone}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label text-light small fw-bold">City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                defaultValue={initial.city}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label text-light small fw-bold">Account Status</label>
              <select name="status" className="form-select" defaultValue={initial.status}>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label text-light small fw-bold">
                New Password{" "}
                <span className="text-secondary fw-normal">
                  (leave blank to keep existing)
                </span>
              </label>
              <input
                type="password"
                name="new_password"
                className="form-control"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-warning px-4 fw-bold" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/admin/users/${initial.id}`}
              className="btn btn-outline-secondary px-4"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
