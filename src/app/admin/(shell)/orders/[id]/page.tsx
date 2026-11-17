import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { displayPaymentMethod, formatLongDateTime } from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";
import { formatPrice, imagePath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Details - Tangoline Admin",
};

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

export default async function AdminOrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    redirect("/admin/orders?error=Order not found.");
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: { orderBy: { id: "asc" } } },
  });
  if (!order) redirect("/admin/orders?error=Order not found.");

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">Order #{order.orderNumber}</h1>
          <span className={`badge ${statusBadge(order.status)} mt-1`}>
            {order.status}
          </span>
          <span className="text-secondary small ms-2">
            Placed on {formatLongDateTime(order.createdAt)}
          </span>
        </div>
        <Link href="/admin/orders" className="btn btn-outline-secondary btn-sm">
          ← Back to Orders
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="admin-card mb-4">
            <h2 className="h5 fw-bold text-white mb-3">
              Order Items Snapshot ({order.orderItems.length})
            </h2>
            <div className="table-responsive">
              <table className="table table-dark-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Image</th>
                    <th>Item Name</th>
                    <th>Price Snapshot</th>
                    <th>Qty</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePath(item.productImage)}
                          width="44"
                          height="44"
                          style={{
                            objectFit: "contain",
                            background: "#111",
                            borderRadius: "4px",
                            padding: "2px",
                          }}
                          alt=""
                        />
                      </td>
                      <td className="text-white fw-bold">{item.productName}</td>
                      <td>{formatPrice(Number(item.productPrice))}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end text-danger fw-bold">
                        {formatPrice(Number(item.subtotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary">
              <div style={{ minWidth: "240px" }}>
                <div className="d-flex justify-content-between text-secondary mb-1">
                  <span>Subtotal:</span>
                  <span className="text-white">
                    {formatPrice(Number(order.subtotal))}
                  </span>
                </div>
                <div className="d-flex justify-content-between text-secondary mb-2">
                  <span>Shipping Fee:</span>
                  <span className="badge bg-success">FREE</span>
                </div>
                <hr className="border-secondary my-2" />
                <div className="d-flex justify-content-between fs-5 fw-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-danger">
                    {formatPrice(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <OrderStatusForm orderId={order.id} status={order.status} />

          <div className="admin-card mb-4">
            <h2 className="h5 fw-bold text-white mb-3">
              Customer &amp; Shipping Details
            </h2>
            <div className="mb-2">
              <span className="text-secondary small d-block">Recipient Name:</span>
              <strong className="text-white">{order.customerName}</strong>
            </div>
            <div className="mb-2">
              <span className="text-secondary small d-block">Contact Phone:</span>
              <a href={`tel:${order.customerPhone}`} className="text-light">
                {order.customerPhone}
              </a>
            </div>
            <div className="mb-2">
              <span className="text-secondary small d-block">Email Address:</span>
              <a href={`mailto:${order.customerEmail}`} className="text-light">
                {order.customerEmail}
              </a>
            </div>
            <div className="mb-2">
              <span className="text-secondary small d-block">Destination City:</span>
              <span className="text-white">
                {order.city}{" "}
                {order.postalCode ? `(${order.postalCode})` : ""}
              </span>
            </div>
            <div className="mb-3">
              <span className="text-secondary small d-block">Full Shipping Address:</span>
              <div className="p-2 rounded bg-dark border border-secondary text-light small">
                {order.shippingAddress.split("\n").map((line, index) => (
                  <span key={index}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-0">
              <span className="text-secondary small d-block">Payment Method:</span>
              <span className="badge bg-secondary">
                {displayPaymentMethod(order.paymentMethod)}
              </span>
            </div>
            {order.notes ? (
              <div className="mt-3">
                <span className="text-secondary small d-block">
                  Special Delivery Notes:
                </span>
                <div className="text-warning small fst-italic">{order.notes}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
