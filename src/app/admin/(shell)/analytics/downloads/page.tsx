import type { Metadata } from "next";
import Link from "next/link";
import { DownloadChart } from "@/components/admin/DownloadChart";
import {
  formatDateTimeSeconds,
  formatNumber,
} from "@/lib/admin-format";
import { getDownloadAnalytics } from "@/services/admin-analytics-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Download Analytics - Tangoline Admin",
};

export default async function AdminDownloadAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const data = await getDownloadAnalytics(search, params.from, params.to);

  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  const defaultFromText = [
    defaultFrom.getFullYear(),
    String(defaultFrom.getMonth() + 1).padStart(2, "0"),
    String(defaultFrom.getDate()).padStart(2, "0"),
  ].join("-");
  const defaultToText = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0"),
  ].join("-");
  const hasFilters = Boolean(search) || data.dateFrom !== defaultFromText || data.dateTo !== defaultToText;

  const stats = [
    {
      label: "Downloads Today",
      value: data.todayDownloads,
      className: "text-danger",
    },
    { label: "Last 7 Days", value: data.last7Downloads, className: "text-white" },
    {
      label: "Total All Time",
      value: data.totalDownloads,
      className: "text-info",
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">
            Product Specification Downloads
          </h1>
          <p className="text-secondary small mb-0">
            Track all Word document (.docx) download events across the storefront
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div className="col-12 col-sm-4" key={stat.label}>
            <div className="admin-card text-center">
              <div className={`stat-number ${stat.className}`}>
                {formatNumber(stat.value)}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="admin-card h-100">
            <h2 className="h5 fw-bold text-white mb-3">
              Daily Downloads — Last 14 Days
            </h2>
            <div style={{ height: "280px" }}>
              <DownloadChart data={data.chartData} />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="admin-card h-100">
            <h2 className="h5 fw-bold text-white mb-3">
              Top Downloaded Products
            </h2>
            <div className="table-responsive">
              <table className="table table-dark-custom table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="text-white fw-bold small">{product.name}</td>
                      <td className="text-secondary small">{product.brand}</td>
                      <td className="text-end text-danger fw-bold">
                        {formatNumber(product.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card mb-4">
        <form
          method="GET"
          action="/admin/analytics/downloads"
          className="row g-2 align-items-center"
        >
          <div className="col-12 col-md-3">
            <input
              type="text"
              name="q"
              className="form-control form-control-sm"
              placeholder="Product name, IP, user..."
              defaultValue={search}
            />
          </div>
          <div className="col-12 col-md-3">
            <input
              type="date"
              name="from"
              className="form-control form-control-sm"
              defaultValue={data.dateFrom}
            />
          </div>
          <div className="col-12 col-md-3">
            <input
              type="date"
              name="to"
              className="form-control form-control-sm"
              defaultValue={data.dateTo}
            />
          </div>
          <div className="col-12 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-danger btn-sm flex-grow-1">
              Filter Logs
            </button>
            {hasFilters ? (
              <Link
                href="/admin/analytics/downloads"
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
                <th>Product Name</th>
                <th>Brand</th>
                <th>Customer</th>
                <th>IP Address</th>
                <th className="text-end">Downloaded At</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-secondary">
                    No download events in this date range.
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-white fw-bold">
                      {log.product?.name ?? "Unknown Product"}
                    </td>
                    <td className="text-secondary">{log.product?.brand ?? "—"}</td>
                    <td className="text-secondary small">
                      {log.user ? (
                        <span className="text-light">@{log.user.username}</span>
                      ) : (
                        <span className="badge bg-secondary">Guest</span>
                      )}
                    </td>
                    <td className="text-secondary small font-monospace">
                      {log.ipAddress}
                    </td>
                    <td className="text-end text-secondary small">
                      {formatDateTimeSeconds(log.downloadedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-top border-secondary">
          <small className="text-secondary">
            Showing up to 200 download events in the selected range. Use filters to
            narrow results.
          </small>
        </div>
      </div>
    </>
  );
}
