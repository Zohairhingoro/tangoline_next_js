import type { Metadata } from "next";
import Link from "next/link";
import type { UserStatus } from "@prisma/client";
import { formatDate, formatDateTime, formatNumber } from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "User Management - Tangoline Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const status = (params.status ?? "").trim();
  const validStatus = status === "active" || status === "disabled";
  // The original page binds raw GET values into SQL, so unknown statuses match
  // no rows rather than showing every user.
  const noRows = Boolean(status) && status !== "all" && !validStatus;

  const users = noRows
    ? []
    : await prisma.user.findMany({
        where: {
          ...(search
            ? {
                OR: [
                  { username: { contains: search } },
                  { email: { contains: search } },
                  { fullName: { contains: search } },
                  { phone: { contains: search } },
                ],
              }
            : {}),
          ...(validStatus ? { status: status as UserStatus } : {}),
        },
        include: {
          _count: { select: { orders: true } },
          loginLogs: {
            where: { status: "success" },
            orderBy: { loginTime: "desc" },
            take: 1,
            select: { loginTime: true },
          },
        },
        orderBy: { id: "desc" },
      });

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">Registered Customers</h1>
          <p className="text-secondary small mb-0">
            Search registered gamers, manage accounts, and monitor customer activity
          </p>
        </div>
        <div>
          <Link href="/admin/users/activity" className="btn btn-outline-danger btn-sm">
            🛡️ View Login Logs
          </Link>
        </div>
      </div>

      <div className="admin-card mb-4">
        <form method="GET" action="/admin/users" className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              name="q"
              className="form-control form-control-sm"
              placeholder="Search by username, email, full name, phone..."
              defaultValue={search}
            />
          </div>
          <div className="col-12 col-md-3">
            <select name="status" className="form-select form-select-sm" defaultValue={status || "all"}>
              <option value="all">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div className="col-12 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-danger btn-sm flex-grow-1">
              Search
            </button>
            {search || status ? (
              <Link href="/admin/users" className="btn btn-outline-secondary btn-sm">
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
                <th>User</th>
                <th>Email</th>
                <th>Phone / City</th>
                <th>Orders</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-secondary">
                    No customer accounts match your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="fw-bold text-white">
                        {user.fullName || user.username}
                      </div>
                      <div className="text-secondary small">@{user.username}</div>
                    </td>
                    <td className="text-secondary">{user.email}</td>
                    <td className="text-secondary small">
                      {user.phone || "—"}
                      <br />
                      {user.city || ""}
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {formatNumber(user._count.orders)} orders
                      </span>
                    </td>
                    <td className="text-secondary small">
                      {user.loginLogs[0]
                        ? formatDateTime(user.loginLogs[0].loginTime)
                        : "Never"}
                    </td>
                    <td>
                      <span
                        className={`badge ${user.status === "active" ? "bg-success" : "bg-danger"}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="text-secondary small">{formatDate(user.createdAt)}</td>
                    <td className="text-end">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="btn btn-sm btn-outline-info me-1"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="btn btn-sm btn-outline-warning"
                      >
                        Edit
                      </Link>
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
