"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { imagePath } from "@/lib/utils";

export type ProductFormInitial = {
  id: number;
  name: string;
  categoryId: number;
  brand: string;
  platform: string;
  price: number;
  originalPrice: number | null;
  shortDescription: string;
  description: string;
  specifications: string | null;
  systemRequirements: string | null;
  stockStatus: "in_stock" | "out_of_stock";
  isFeatured: boolean;
  image: string;
};

type Props = {
  mode: "create" | "edit";
  categories: Array<{ id: number; name: string }>;
  initial?: ProductFormInitial;
};

export function ProductForm({ mode, categories, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === "edit";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSaving(true);

    try {
      const response = await fetch(
        isEdit && initial ? `/api/admin/products/${initial.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          body: formData,
        },
      );
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to save the product.");
        return;
      }
      const params = new URLSearchParams({ success: result.message ?? "Product saved." });
      router.push(`/admin/products?${params.toString()}`);
      router.refresh();
    } catch {
      setError("Unable to save the product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className={`d-flex justify-content-between ${isEdit ? "align-items-center" : "align-items-center"} pb-3 mb-4 border-bottom border-secondary`}
      >
        <div>
          <h1 className="h3 fw-bold text-white mb-0">
            {isEdit ? `Edit Product: ${initial?.name ?? ""}` : "Add New Product"}
          </h1>
          <p className="text-secondary small mb-0">
            {isEdit
              ? "Changes will immediately regenerate the Word document in fc/ folder"
              : "Word-compatible specification file will be automatically generated upon creation"}
          </p>
        </div>
        <Link href="/admin/products" className="btn btn-outline-secondary btn-sm">
          ← Back to Catalog
        </Link>
      </div>

      {error ? (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          />
        </div>
      ) : null}

      <form onSubmit={submit} encType="multipart/form-data">
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="admin-card mb-4">
              <h2 className="h5 fw-bold text-white mb-3">General Information</h2>
              <div className="mb-3">
                <label className="form-label text-light small fw-bold">Product Title *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Sony PlayStation 5 Pro Console White"
                  defaultValue={initial?.name ?? ""}
                  required
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">Category *</label>
                  <select name="category_id" className="form-select" required defaultValue={initial?.categoryId ?? ""}>
                    {!isEdit ? <option value="">Select Category</option> : null}
                    {categories.map((category) => (
                      <option value={category.id} key={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">
                    Brand / Manufacturer *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    className="form-control"
                    placeholder={
                      isEdit
                        ? undefined
                        : "ASUS, Corsair, MSI, NVIDIA, AMD, Intel, PlayStation, Xbox..."
                    }
                    defaultValue={initial?.brand ?? ""}
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">
                    {isEdit ? "Platform" : "Platform / Category Type"}
                  </label>
                  <input
                    type="text"
                    name="platform"
                    className="form-control"
                    placeholder={
                      isEdit
                        ? undefined
                        : "PC / AM5, PC / PCIe 4.0, PC / DDR5, PlayStation 5, Xbox Series X..."
                    }
                    defaultValue={initial?.platform ?? ""}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">Price (PKR) *</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    className="form-control"
                    placeholder={isEdit ? undefined : "15000.00"}
                    defaultValue={initial?.price ?? ""}
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">
                    {isEdit
                      ? "Original / Discount Price"
                      : "Original / Discount Price (Optional)"}
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    step="0.01"
                    className="form-control"
                    placeholder={isEdit ? undefined : "18000.00"}
                    defaultValue={initial?.originalPrice ?? ""}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small fw-bold">
                    Stock Availability
                  </label>
                  <select
                    name="stock_status"
                    className="form-select"
                    defaultValue={initial?.stockStatus ?? "in_stock"}
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label text-light small fw-bold">
                  Short Catchy Summary
                </label>
                <input
                  type="text"
                  name="short_description"
                  className="form-control"
                  placeholder={isEdit ? undefined : "Brief 1-sentence product summary"}
                  defaultValue={initial?.shortDescription ?? ""}
                />
              </div>
              <div className="mb-0">
                <label className="form-label text-light small fw-bold">
                  Full Product Description *
                </label>
                <textarea
                  name="description"
                  rows={5}
                  className="form-control"
                  placeholder={isEdit ? undefined : "Detailed product marketing description..."}
                  defaultValue={initial?.description ?? ""}
                  required
                />
              </div>
            </div>

            <div className="admin-card">
              <h2 className="h5 fw-bold text-white mb-3">
                {isEdit ? (
                  "Specifications & Requirements"
                ) : (
                  <>
                    Detailed Specs &amp; Requirements (Embedded in Word Doc)
                  </>
                )}
              </h2>
              <div className="mb-3">
                <label className="form-label text-light small fw-bold">
                  Technical Specifications
                </label>
                <textarea
                  name="specifications"
                  rows={4}
                  className="form-control"
                  placeholder={
                    isEdit
                      ? undefined
                      : "Resolution: 4K 120Hz\nStorage: 1TB NVMe SSD\nAudio: Tempest 3D Audio"
                  }
                  defaultValue={initial?.specifications ?? ""}
                />
              </div>
              <div className="mb-0">
                <label className="form-label text-light small fw-bold">
                  System Requirements &amp; Notes
                </label>
                <textarea
                  name="system_requirements"
                  rows={4}
                  className="form-control"
                  placeholder={
                    isEdit
                      ? undefined
                      : "High-speed internet connection required\nCompatible with 4K HDR displays"
                  }
                  defaultValue={initial?.systemRequirements ?? ""}
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="admin-card mb-4">
              <h2 className="h5 fw-bold text-white mb-3">
                {isEdit ? "Product Image" : "Product Media"}
              </h2>
              {isEdit ? (
                <div className="text-center p-3 mb-3 bg-dark rounded border border-secondary">
                  <img
                    src={imagePath(initial?.image)}
                    alt="Current Image"
                    style={{ maxHeight: "140px", objectFit: "contain" }}
                  />
                </div>
              ) : null}
              <div className="mb-2">
                <label className="form-label text-light small fw-bold">
                  {isEdit ? "Replace Image (Optional)" : "Upload Product Image"}
                </label>
                <input
                  type="file"
                  name="image"
                  className="form-control"
                  accept="image/png, image/jpeg, image/webp"
                />
              </div>
              {!isEdit ? (
                <div className="text-secondary small mt-1">
                  Accepts PNG, JPG, WebP. Safe upload validation applied.
                </div>
              ) : null}
            </div>

            <div className="admin-card mb-4">
              <h2 className="h5 fw-bold text-white mb-3">
                {isEdit ? "Options & Word Specs" : "Settings & Options"}
              </h2>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="is_featured"
                  id="is_featured"
                  value="1"
                  defaultChecked={initial?.isFeatured ?? false}
                />
                <label className="form-check-label text-light" htmlFor="is_featured">
                  {isEdit ? "Show in Featured Section" : "Show in Featured Homepage Section"}
                </label>
              </div>
              {isEdit ? (
                <div className="mb-3">
                  <label className="text-light small fw-bold d-block">
                    Current Document:
                  </label>
                  <a
                    href={`/api/download/${initial?.id}`}
                    className="btn btn-outline-info btn-sm"
                  >
                    📄 Download Details Document
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded bg-dark border border-secondary text-secondary small">
                  <strong className="text-white">Notice:</strong> Saving this product will
                  automatically generate its Word specification file (
                  <code>fc/product-slug-details.docx</code>) and link it to the storefront
                  &quot;Save Details&quot; download buttons.
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`btn w-100 py-3 fw-bold fs-6 ${isEdit ? "btn-warning" : "btn-danger"}`}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Product & Regenerate Docs"
                  : "Save Product & Generate Docs"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
