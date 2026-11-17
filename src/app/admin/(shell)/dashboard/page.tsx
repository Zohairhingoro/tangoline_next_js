import type { Metadata } from "next";
import Link from "next/link";
import { DashboardChart } from "@/components/admin/DashboardChart";
import { formatNumber, formatShortDateTime } from "@/lib/admin-format";
import { formatPrice } from "@/lib/utils";
import { getDashboardData } from "@/services/admin-dashboard-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Overview - Tangoline Admin",
};

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-2 pb-3 mb-4 border-bottom border-secondary">
        <h1 className="h3 fw-bold text-white mb-0">
          E-Commerce Intelligence Dashboard
        </h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link href="/admin/products/create" className="btn btn-danger btn-sm me-2">
            <span>+</span> Add Product
          </Link>
          <Link
            href="/admin/analytics/visitors"
            className="btn btn-outline-secondary btn-sm text-light"
          >
            View Analytics
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-number text-primary">
              {formatNumber(data.totalUsers)}
            </div>
            <div className="text-secondary small mt-1">
              +{formatNumber(data.regThisMonth)} this month
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-card">
            <div className="stat-label">Products</div>
            <div className="stat-number text-success">
              {formatNumber(data.totalProducts)}
            </div>
            <div className="text-secondary small mt-1">
              in {formatNumber(data.totalCategories)} categories
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-number text-warning">
              {formatNumber(data.totalOrders)}
            </div>
            <div className="text-secondary small mt-1">
              {formatPrice(data.totalRevenue)}
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-card">
            <div className="stat-label">Downloads</div>
            <div className="stat-number" style={{ color: "#00d2d3" }}>
              {formatNumber(data.totalDownloads)}
            </div>
            <div className="text-secondary small mt-1">
              Word specs downloaded
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-card">
            <div className="stat-label">Unique Visits</div>
            <div className="stat-number" style={{ color: "#e50914" }}>
              {formatNumber(data.totalVisits)}
            </div>
            <div className="text-secondary small mt-1">
              {formatNumber(data.todayVisits)} today
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-card">
            <div className="stat-label">30-Day Reach</div>
            <div className="stat-number text-info">
              {formatNumber(data.last30DaysVisits)}
            </div>
            <div className="text-secondary small mt-1">
              {formatNumber(data.last7DaysVisits)} last 7 days
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="admin-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold text-white mb-0">
                Website Traffic Trend (Past 7 Days)
              </h2>
              <span className="badge bg-danger">Unique Visitors</span>
            </div>
            <div style={{ height: "280px" }}>
              <DashboardChart data={data.dailyData} />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="admin-card h-100">
            <h2 className="h5 fw-bold text-white mb-3">Visitor Breakdown</h2>
            <ul className="list-group list-group-flush bg-transparent">
              <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between px-0">
                <span>Visitors Today:</span>
                <strong className="text-white">
                  {formatNumber(data.todayVisits)}
                </strong>
              </li>
              <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between px-0">
                <span>Visitors Yesterday:</span>
                <strong className="text-secondary">
                  {formatNumber(data.yesterdayVisits)}
                </strong>
              </li>
              <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between px-0">
                <span>Last 7 Days:</span>
                <strong className="text-white">
                  {formatNumber(data.last7DaysVisits)}
                </strong>
              </li>
              <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between px-0">
                <span>Last 30 Days:</span>
                <strong className="text-white">
                  {formatNumber(data.last30DaysVisits)}
                </strong>
              </li>
              <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between px-0">
                <span>This Month:</span>
                <strong className="text-danger">
                  {formatNumber(data.thisMonthVisits)}
                </strong>
              </li>
              <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between px-0">
                <span>New Users This Month:</span>
                <strong className="text-success">
                  +{formatNumber(data.regThisMonth)}
                </strong>
              </li>
            </ul>
            <div className="mt-3 text-center">
              <Link
                href="/admin/analytics/visitors"
                className="btn btn-outline-danger btn-sm w-100"
              >
                Detailed Traffic Reports →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="admin-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold text-white mb-0">
                Most Downloaded Product Specs (.docx)
              </h2>
              <Link
                href="/admin/analytics/downloads"
                className="small text-danger text-decoration-none"
              >
                View All
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-dark-custom table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th className="text-end">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mostDownloaded.map((item) => (
                    <tr key={item.id}>
                      <td className="text-white fw-bold">{item.name}</td>
                      <td className="text-secondary">{item.brand}</td>
                      <td className="text-end fw-bold text-danger">
                        {formatNumber(item.dlCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="admin-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold text-white mb-0">
                Most Viewed Storefront Products
              </h2>
              <Link
                href="/admin/products"
                className="small text-danger text-decoration-none"
              >
                View All
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-dark-custom table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Platform</th>
                    <th>Price</th>
                    <th className="text-end">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mostViewed.map((item) => (
                    <tr key={item.id}>
                      <td className="text-white fw-bold">{item.name}</td>
                      <td className="text-secondary">{item.platform}</td>
                      <td className="text-danger">
                        {formatPrice(Number(item.price))}
                      </td>
                      <td className="text-end fw-bold text-info">
                        {formatNumber(item.viewsCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="admin-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold text-white mb-0">
                Recent Customer Orders
              </h2>
              <Link
                href="/admin/orders"
                className="small text-danger text-decoration-none"
              >
                View All
              </Link>
            </div>
            {data.recentOrders.length === 0 ? (
              <p className="text-secondary small mb-0">No orders recorded yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-custom table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-danger fw-bold text-decoration-none"
                          >
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="text-white">{order.customerName}</td>
                        <td className="text-warning">
                          {formatPrice(Number(order.totalAmount))}
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="admin-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold text-white mb-0">
                Recent Authentication Activity
              </h2>
              <Link
                href="/admin/users/activity"
                className="small text-danger text-decoration-none"
              >
                View All
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-dark-custom table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-end">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLogins.map((login) => (
                    <tr key={login.id}>
                      <td className="text-white">{login.identifier}</td>
                      <td className="text-secondary">{login.accountType}</td>
                      <td>
                        <span
                          className={`badge ${login.status === "success" ? "bg-success" : "bg-danger"}`}
                        >
                          {login.status}
                        </span>
                      </td>
                      <td className="text-end text-secondary small">
                        {formatShortDateTime(login.loginTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
