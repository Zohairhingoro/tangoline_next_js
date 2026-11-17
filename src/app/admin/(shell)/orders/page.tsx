import type { Metadata } from "next";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import {
  displayPaymentMethod,
  formatDateTime,
  formatNumber,
} from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders Management - Tangoline Admin",
};

const ALLOWED = ["Pending", "Processing", "Completed", "Cancelled"];

function statusBadge(status: string): string {
  switch (status) {
    case "Completed":
      return "bg-success";
    case "Processing":
      return "bg-info text-dark";
    case "Cancelled":
      return "bg-secondary";
    default:
      return "bg-warning text-dark";
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const status = (params.status ?? "").trim();

  const validStatus = status && status !== "all" && ALLOWED.includes(status);
  const orders =
    status && status !== "all" && !validStatus
      ? []
      : await prisma.order.findMany({
          where: {
            ...(search
              ? {
                  OR: [
                    { orderNumber: { contains: search } },
                    { customerName: { contains: search } },
                    { customerEmail: { contains: search } },
                    { customerPhone: { contains: search } },
                  ],
                }
              : {}),
            ...(validStatus ? { status: status as OrderStatus } : {}),
          },
          include: { _count: { select: { orderItems: true } } },
          orderBy: { id: "desc" },
        });

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">Customer Orders</h1>
          <p className="text-secondary small mb-0">
            Process customer orders, update delivery statuses, and view items
          </p>
        </div>
      </div>

      <div className="admin-card mb-4">
        <form method="GET" action="/admin/orders" className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <input
              type="text"
              name="q"
              className="form-control form-control-sm"
              placeholder="Search by Order #, Name, Email, Phone..."
              defaultValue={search}
            />
          </div>
          <div className="col-12 col-md-4">
            <select name="status" className="form-select form-select-sm" defaultValue={status || "all"}>
              <option value="all">All Statuses</option>
              {ALLOWED.map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-danger btn-sm flex-grow-1">
              Filter
            </button>
            {search || status ? (
              <Link href="/admin/orders" className="btn btn-outline-secondary btn-sm">
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
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date Placed</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-secondary">
                    No customer orders recorded yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold text-danger">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-danger text-decoration-none"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-bold text-white">{order.customerName}</div>
                      <div className="text-secondary small">
                        {order.customerPhone} | {order.city}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {formatNumber(order._count.orderItems)} item(s)
                      </span>
                    </td>
                    <td className="text-white fw-bold">
                      {formatPrice(Number(order.totalAmount))}
                    </td>
                    <td className="text-secondary small">
                      {displayPaymentMethod(order.paymentMethod)}
                    </td>
                    <td>
                      <span className={`badge ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-secondary small">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="text-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="btn btn-sm btn-outline-info"
                      >
                        View / Process
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
