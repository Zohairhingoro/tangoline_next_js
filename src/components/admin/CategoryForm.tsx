"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  mode: "create" | "edit";
  initial?: { id: number; name: string; slug: string; description: string };
};

export function CategoryForm({ mode, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === "edit";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    setSaving(true);

    try {
      const response = await fetch(
        isEdit && initial ? `/api/admin/categories/${initial.id}` : "/api/admin/categories",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(data.get("name") ?? ""),
            description: String(data.get("description") ?? ""),
          }),
        },
      );
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to save the category.");
        return;
      }
      const params = new URLSearchParams({ success: result.message ?? "Category saved." });
      router.push(`/admin/categories?${params.toString()}`);
      router.refresh();
    } catch {
      setError("Unable to save the category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <h1 className="h3 fw-bold text-white mb-0">
          {isEdit ? `Edit Category: ${initial?.name ?? ""}` : "Add New Category"}
        </h1>
        <Link href="/admin/categories" className="btn btn-outline-secondary btn-sm">
          ← Back to Categories
        </Link>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="admin-card" style={{ maxWidth: "600px" }}>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label text-light small fw-bold">Category Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder={isEdit ? undefined : "e.g. Pro Accessories"}
              defaultValue={initial?.name ?? ""}
              required
            />
          </div>
          {isEdit ? (
            <div className="mb-3">
              <label className="form-label text-light small fw-bold">Slug (Identifier)</label>
              <input
                type="text"
                className="form-control"
                defaultValue={initial?.slug ?? ""}
                disabled
              />
            </div>
          ) : null}
          <div className="mb-4">
            <label className="form-label text-light small fw-bold">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows={3}
              placeholder={isEdit ? undefined : "Category purpose and overview..."}
              defaultValue={initial?.description ?? ""}
            />
          </div>
          <button type="submit" className={`btn px-4 ${isEdit ? "btn-warning" : "btn-danger"}`} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
          </button>
        </form>
      </div>
    </>
  );
}
