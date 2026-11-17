import type { Metadata } from "next";
import Link from "next/link";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { formatNumber } from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories - Tangoline Admin",
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">Product Categories</h1>
          <p className="text-secondary small mb-0">
            Organize store hardware, games, and accessories
          </p>
        </div>
        <div>
          <Link href="/admin/categories/create" className="btn btn-danger btn-sm px-3">
            <span>+</span> Add Category
          </Link>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-dark-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Associated Products</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-secondary">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="fw-bold text-white">{category.name}</td>
                    <td>
                      <code>{category.slug}</code>
                    </td>
                    <td className="text-secondary small">{category.description ?? ""}</td>
                    <td>
                      <span className="badge bg-secondary">
                        {formatNumber(category._count.products)} products
                      </span>
                    </td>
                    <td className="text-end">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="btn btn-sm btn-outline-warning me-1"
                      >
                        Edit
                      </Link>
                      <AdminActionButton
                        endpoint={`/api/admin/categories/${category.id}`}
                        method="DELETE"
                        label="Delete"
                        className="btn btn-sm btn-outline-danger"
                        confirm="Are you sure you want to delete this category?"
                        redirectTo="/admin/categories"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
