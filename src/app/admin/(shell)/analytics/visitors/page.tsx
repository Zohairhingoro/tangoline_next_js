import type { Metadata } from "next";
import { TrafficRangeChart } from "@/components/admin/TrafficRangeChart";
import { formatNumber, formatVisitTime } from "@/lib/admin-format";
import { getVisitorAnalytics } from "@/services/admin-analytics-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visitor Analytics - Tangoline Admin",
};

export default async function AdminVisitorAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const data = await getVisitorAnalytics(params.from, params.to);

  const stats = [
    { label: "Today", value: data.todayVisits, className: "text-danger" },
    { label: "Yesterday", value: data.yesterdayVisits, className: "text-secondary" },
    { label: "Last 7 Days", value: data.last7, className: "text-white" },
    { label: "Last 30 Days", value: data.last30, className: "text-info" },
    { label: "All Sessions", value: data.totalSessions, className: "text-success" },
    { label: "Page Views", value: data.totalPageviews, className: "text-warning" },
  ];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">Visitor Analytics</h1>
          <p className="text-secondary small mb-0">
            Website traffic insights, session tracking, and page-level performance
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div className="col-6 col-sm-4 col-xl-2" key={stat.label}>
            <div className="admin-card text-center">
              <div className={`stat-number ${stat.className}`}>
                {formatNumber(stat.value)}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card mb-4">
        <form
          method="GET"
          action="/admin/analytics/visitors"
          className="row g-2 align-items-center"
        >
          <div className="col-12 col-sm-4">
            <label className="form-label text-secondary small mb-1">From Date</label>
            <input
              type="date"
              name="from"
              className="form-control form-control-sm"
              defaultValue={data.dateFrom}
            />
          </div>
          <div className="col-12 col-sm-4">
            <label className="form-label text-secondary small mb-1">To Date</label>
            <input
              type="date"
              name="to"
              className="form-control form-control-sm"
              defaultValue={data.dateTo}
            />
          </div>
          <div className="col-12 col-sm-4 d-flex align-items-end">
            <button type="submit" className="btn btn-danger btn-sm px-4">
              Apply Date Range
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-bold text-white mb-0">
            Traffic Trend: {data.dateFrom} → {data.dateTo}
          </h2>
          <div className="d-flex gap-3 small">
            <span>
              <span className="badge bg-danger me-1">&nbsp;</span>Unique Sessions
            </span>
            <span>
              <span className="badge bg-info me-1">&nbsp;</span>Total Pageviews
            </span>
          </div>
        </div>
        <div style={{ height: "300px" }}>
          <TrafficRangeChart data={data.chartData} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-5">
          <div className="admin-card h-100">
            <h2 className="h5 fw-bold text-white mb-3">Top 10 Visited Pages</h2>
            <div className="table-responsive">
              <table className="table table-dark-custom table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Page URL</th>
                    <th className="text-end">Hits</th>
                    <th className="text-end">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.popularPages.map((page) => (
                    <tr key={page.pageUrl}>
                      <td
                        className="text-light small"
                        style={{
                          maxWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {page.pageUrl}
                      </td>
                      <td className="text-end text-warning fw-bold">{page.hits}</td>
                      <td className="text-end text-info">{page.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="admin-card h-100">
            <h2 className="h5 fw-bold text-white mb-3">
              Detailed Visit Log ({data.recentVisits.length} events in range)
            </h2>
            <div
              className="table-responsive"
              style={{ maxHeight: "420px", overflowY: "auto" }}
            >
              <table className="table table-dark-custom table-sm align-middle mb-0">
                <thead
                  className="sticky-top"
                  style={{ top: 0, background: "#1f1f23" }}
                >
                  <tr>
                    <th>Page</th>
                    <th>IP</th>
                    <th>Session</th>
                    <th className="text-end">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentVisits.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-secondary py-3">
                        No visits recorded in this date range.
                      </td>
                    </tr>
                  ) : (
                    data.recentVisits.map((visit) => (
                      <tr key={visit.sessionId + visit.visitedAt.toISOString()}>
                        <td
                          className="text-light small"
                          style={{
                            maxWidth: "180px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {visit.pageUrl}
                        </td>
                        <td className="text-secondary small font-monospace">
                          {visit.ipHash.slice(0, 12)}...
                        </td>
                        <td className="text-secondary small font-monospace">
                          {visit.sessionId.slice(0, 12)}...
                        </td>
                        <td className="text-end text-secondary small">
                          {formatVisitTime(visit.visitedAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
