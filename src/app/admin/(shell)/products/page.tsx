import type { Metadata } from "next";
import Link from "next/link";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { formatPrice, imagePath } from "@/lib/utils";
import { prisma } from "@/lib/db/prisma";
import { listAdminProducts } from "@/services/admin-products-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products Management - Tangoline Admin",
};

function categoryBadge(name: string): { badge: string; icon: string } {
  const lower = name.toLowerCase();
  if (lower.includes("game")) return { badge: "bg-primary", icon: "🎮" };
  if (lower.includes("console")) return { badge: "bg-info text-dark", icon: "🕹️" };
  if (lower.includes("pc")) return { badge: "bg-danger", icon: "⚙️" };
  return { badge: "bg-secondary", icon: "📁" };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category_id?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const categoryId = Number(params.category_id ?? 0) || 0;

  const [products, categories] = await Promise.all([
    listAdminProducts(search, categoryId),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">Products Catalog</h1>
          <p className="text-secondary small mb-0">
            Create, edit, and manage store gaming inventory &amp; Word specs documents
          </p>
        </div>
        <div>
          <Link href="/admin/products/create" className="btn btn-danger btn-sm px-3">
            <span>+</span> Add New Product
          </Link>
        </div>
      </div>

      <div className="admin-card mb-4">
        <form method="GET" action="/admin/products" className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <input
              type="text"
              name="q"
              className="form-control form-control-sm"
              placeholder="Search by name, brand, platform..."
              defaultValue={search}
            />
          </div>
          <div className="col-12 col-md-4">
            <select name="category_id" className="form-select form-select-sm" defaultValue={categoryId}>
              <option value="0">All Categories</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-danger btn-sm flex-grow-1">
              Filter
            </button>
            {search || categoryId > 0 ? (
              <Link href="/admin/products" className="btn btn-outline-secondary btn-sm">
                Reset
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-dark-custom align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Platform / Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Word Specs</th>
                <th className="text-end" style={{ width: "160px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-secondary">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const badge = categoryBadge(product.category.name);
                  return (
                    <tr key={product.id}>
                      <td>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePath(product.image)}
                          width="48"
                          height="48"
                          style={{
                            objectFit: "contain",
                            background: "#111",
                            borderRadius: "6px",
                            padding: "3px",
                          }}
                          alt=""
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-white">{product.name}</div>
                        <div className="text-secondary small">Slug: {product.slug}</div>
                        {product.isFeatured ? (
                          <span className="badge bg-danger mt-1">★ Featured</span>
                        ) : null}
                      </td>
                      <td>
                        <span className={`badge ${badge.badge}`}>
                          {badge.icon} {product.category.name}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{product.platform}</span>
                        <div className="text-secondary small mt-1">{product.brand}</div>
                      </td>
                      <td className="text-danger fw-bold">
                        {formatPrice(Number(product.price))}
                      </td>
                      <td>
                        <span
                          className={`badge ${product.stockStatus === "in_stock" ? "bg-success" : "bg-danger"}`}
                        >
                          {product.stockStatus === "in_stock" ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`/api/download/${product.id}`}
                          className="btn btn-outline-info btn-sm py-0 px-2"
                          title="Download current Word spec file"
                        >
                          📄 .docx
                        </a>
                      </td>
                      <td className="text-end">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="btn btn-sm btn-outline-warning me-1"
                        >
                          Edit
                        </Link>
                        <AdminActionButton
                          endpoint={`/api/admin/products/${product.id}`}
                          method="DELETE"
                          label="Delete"
                          className="btn btn-sm btn-outline-danger"
                          confirm="Are you sure you want to delete this product? Associated .docx file will also be cleaned."
                          redirectTo="/admin/products"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
