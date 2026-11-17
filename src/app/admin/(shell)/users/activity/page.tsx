import type { Metadata } from "next";
import Link from "next/link";
import type { AccountType, LoginStatus } from "@prisma/client";
import {
  formatDateTimeSeconds,
  formatNumber,
} from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login Activity Log - Tangoline Admin",
};

export default async function AdminLoginActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const filterType = (params.type ?? "").trim();
  const filterStatus = (params.status ?? "").trim();

  // The original page binds raw GET values into the SQL WHERE clause, so any value
  // that is not actually stored in the enum column simply matches no rows. In
  // particular the "customer" option queries account_type='customer' while the DB
  // stores 'user'. Validate instead of casting so arbitrary values never reach
  // Prisma as invalid enums, and force an empty result for non-matching filters.
  const requestedType = filterType && filterType !== "all" ? filterType : null;
  const requestedStatus =
    filterStatus && filterStatus !== "all" ? filterStatus : null;

  const typeMatches =
    requestedType === null ||
    requestedType === "user" ||
    requestedType === "admin";
  const statusMatches =
    requestedStatus === null ||
    requestedStatus === "success" ||
    requestedStatus === "failed";

  const typeFilter = typeMatches ? (requestedType as AccountType | null) : null;
  const statusFilter = statusMatches
    ? (requestedStatus as LoginStatus | null)
    : null;
  const noRows = !typeMatches || !statusMatches;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [logs, totalSuccess, totalFailed, todayLogins] = await Promise.all([
    prisma.loginLog.findMany({
      where: {
        ...(noRows ? { id: 0 } : {}),
        ...(search ? { identifier: { contains: search } } : {}),
        ...(typeFilter ? { accountType: typeFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { id: "desc" },
      take: 200,
    }),
    prisma.loginLog.count({ where: { status: "success" } }),
    prisma.loginLog.count({ where: { status: "failed" } }),
    prisma.loginLog.count({ where: { loginTime: { gte: today } } }),
  ]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">
            Authentication Activity Log
          </h1>
          <p className="text-secondary small mb-0">
            Monitor all login attempts across customer and administrator accounts
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="admin-card text-center">
            <div className="stat-number text-success">
              {formatNumber(totalSuccess)}
            </div>
            <div className="stat-label">Successful Logins</div>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="admin-card text-center">
            <div className="stat-number text-danger">
              {formatNumber(totalFailed)}
            </div>
            <div className="stat-label">Failed Attempts</div>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="admin-card text-center">
            <div className="stat-number text-info">
              {formatNumber(todayLogins)}
            </div>
            <div className="stat-label">Total Events Today</div>
          </div>
        </div>
      </div>

      <div className="admin-card mb-4">
        <form
          method="GET"
          action="/admin/users/activity"
          className="row g-2 align-items-center"
        >
          <div className="col-12 col-md-4">
            <input
              type="text"
              name="q"
              className="form-control form-control-sm"
              placeholder="Search identifier / email..."
              defaultValue={search}
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              name="type"
              className="form-select form-select-sm"
              defaultValue={filterType || "all"}
            >
              <option value="all">All Account Types</option>
              <option value="customer">Customers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <select
              name="status"
              className="form-select form-select-sm"
              defaultValue={filterStatus || "all"}
            >
              <option value="all">All Results</option>
              <option value="success">Successful Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
          <div className="col-12 col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-danger btn-sm flex-grow-1">
              Filter
            </button>
            {search || filterType || filterStatus ? (
              <Link
                href="/admin/users/activity"
                className="btn btn-outline-secondary btn-sm"
              >
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
                <th>Identifier (User / Email)</th>
                <th>Account Type</th>
                <th>IP Address</th>
                <th>Result</th>
                <th className="text-end">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-secondary">
                    No login events match your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-white fw-bold">{log.identifier}</td>
                    <td>
                      <span
                        className={`badge ${log.accountType === "admin" ? "bg-danger" : "bg-secondary"}`}
                      >
                        {log.accountType.charAt(0).toUpperCase() +
                          log.accountType.slice(1)}
                      </span>
                    </td>
                    <td className="text-secondary small font-monospace">
                      {log.ipAddress}
                    </td>
                    <td>
                      <span
                        className={`badge ${log.status === "success" ? "bg-success" : "bg-danger"}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="text-end text-secondary small">
                      {formatDateTimeSeconds(log.loginTime)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-top border-secondary">
          <small className="text-secondary">
            Displaying up to 200 most recent events. Use filters to narrow results.
          </small>
        </div>
      </div>
    </>
  );
}
