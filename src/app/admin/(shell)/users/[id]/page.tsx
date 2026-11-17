import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import {
  formatDate,
  formatDateTime,
  formatMonthYear,
} from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "User Profile - Tangoline Admin",
};

export default async function AdminUserViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    redirect("/admin/users?error=User not found.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) redirect("/admin/users?error=User not found.");

  const [orders, downloads, logins] = await Promise.all([
    prisma.order.findMany({ where: { userId: id }, orderBy: { id: "desc" }, take: 10 }),
    prisma.download.findMany({
      where: { userId: id },
      include: { product: { select: { name: true } } },
      orderBy: { id: "desc" },
      take: 8,
    }),
    prisma.loginLog.findMany({ where: { userId: id }, orderBy: { id: "desc" }, take: 8 }),
  ]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">
            {user.fullName || user.username}
            <span
              className={`badge ${user.status === "active" ? "bg-success" : "bg-danger"} ms-2`}
            >
              {user.status}
            </span>
            <span className="text-secondary small ms-2">
              Member since {formatMonthYear(user.createdAt)}
            </span>
          </h1>
        </div>
        <div>
          <Link href={`/admin/users/${id}/edit`} className="btn btn-outline-warning btn-sm me-2">
            Edit Account
          </Link>
          <Link href="/admin/users" className="btn btn-outline-secondary btn-sm">
            ← Back
          </Link>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-4">
          <div className="admin-card">
            <h2 className="h5 fw-bold text-white mb-3">Account Details</h2>
            <div className="mb-2 d-flex justify-content-between">
              <span className="text-secondary">Username:</span>
              <strong className="text-white">@{user.username}</strong>
            </div>
            <div className="mb-2 d-flex justify-content-between">
              <span className="text-secondary">Full Name:</span>
              <strong className="text-white">{user.fullName || "—"}</strong>
            </div>
            <div className="mb-2 d-flex justify-content-between">
              <span className="text-secondary">Email:</span>
              <a href={`mailto:${user.email}`} className="text-light">
                {user.email}
              </a>
            </div>
            <div className="mb-2 d-flex justify-content-between">
              <span className="text-secondary">Phone:</span>
              <span className="text-white">{user.phone || "—"}</span>
            </div>
            <div className="mb-2 d-flex justify-content-between">
              <span className="text-secondary">City:</span>
              <span className="text-white">{user.city || "—"}</span>
            </div>
            <div className="mb-3 d-flex justify-content-between">
              <span className="text-secondary">Total Orders:</span>
              <strong className="text-danger">{orders.length}</strong>
            </div>
            <hr className="border-secondary" />

            <AdminActionButton
              endpoint={`/api/admin/users/${id}/status`}
              label={user.status === "active" ? "⚠ Disable Account" : "✓ Re-enable Account"}
              className={`btn btn-sm w-100 ${user.status === "active" ? "btn-outline-warning" : "btn-outline-success"}`}
              redirectTo={`/admin/users/${id}`}
            />
            <div className="mb-2" />
            <AdminActionButton
              endpoint={`/api/admin/users/${id}`}
              method="DELETE"
              label="Delete Account Permanently"
              className="btn btn-sm btn-outline-danger w-100"
              confirm="Permanently delete this user? Their orders will remain but the account will be removed."
              redirectTo="/admin/users"
            />
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="admin-card mb-4">
            <h2 className="h5 fw-bold text-white mb-3">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-secondary small mb-0">
                This user has not placed any orders yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-custom table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th className="text-end">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-danger fw-bold"
                          >
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td>{formatPrice(Number(order.totalAmount))}</td>
                        <td>
                          <span className="badge bg-secondary">{order.status}</span>
                        </td>
                        <td className="text-end text-secondary small">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-card mb-4">
            <h2 className="h5 fw-bold text-white mb-3">Recent Spec Downloads</h2>
            {downloads.length === 0 ? (
              <p className="text-secondary small mb-0">
                No product specification documents downloaded.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-custom table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>IP Address</th>
                      <th className="text-end">Downloaded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map((download) => (
                      <tr key={download.id}>
                        <td className="text-white">
                          {download.product?.name ?? "—"}
                        </td>
                        <td className="text-secondary small">{download.ipAddress}</td>
                        <td className="text-end text-secondary small">
                          {formatDateTime(download.downloadedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-card">
            <h2 className="h5 fw-bold text-white mb-3">Recent Login History</h2>
            {logins.length === 0 ? (
              <p className="text-secondary small mb-0">
                No login events found for this account.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-custom table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th className="text-end">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logins.map((login) => (
                      <tr key={login.id}>
                        <td>{login.ipAddress}</td>
                        <td>
                          <span
                            className={`badge ${login.status === "success" ? "bg-success" : "bg-danger"}`}
                          >
                            {login.status}
                          </span>
                        </td>
                        <td className="text-end text-secondary small">
                          {formatDateTime(login.loginTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
