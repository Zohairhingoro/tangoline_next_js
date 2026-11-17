import type { Metadata } from "next";
import Link from "next/link";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { formatDateTime, formatNumber } from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Messages - Tangoline Admin",
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; read?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const filterRead = (params.read ?? "all").trim();

  const [messages, totalUnread, totalMessages] = await Promise.all([
    prisma.contactMessage.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { subject: { contains: search } },
                { message: { contains: search } },
              ],
            }
          : {}),
        ...(filterRead === "unread"
          ? { isRead: false }
          : filterRead === "read"
            ? { isRead: true }
            : {}),
      },
      orderBy: { id: "desc" },
    }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.count(),
  ]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
        <div>
          <h1 className="h3 fw-bold text-white mb-0">
            Customer Messages
            {totalUnread > 0 ? (
              <span className="badge bg-danger ms-2">
                {formatNumber(totalUnread)} unread
              </span>
            ) : null}
          </h1>
          <p className="text-secondary small mb-0">
            Contact form submissions — {formatNumber(totalMessages)} total inquiries
          </p>
        </div>
      </div>

      <div className="admin-card mb-4">
        <form
          method="GET"
          action="/admin/messages"
          className="row g-2 align-items-center"
        >
          <div className="col-12 col-md-6">
            <input
              type="text"
              name="q"
              className="form-control form-control-sm"
              placeholder="Search by name, email, subject, or message..."
              defaultValue={search}
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              name="read"
              className="form-select form-select-sm"
              defaultValue={filterRead || "all"}
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
          <div className="col-12 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-danger btn-sm flex-grow-1">
              Filter
            </button>
            {search || filterRead !== "all" ? (
              <Link href="/admin/messages" className="btn btn-outline-secondary btn-sm">
                Reset
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      {messages.length === 0 ? (
        <div className="admin-card text-center py-5">
          <div className="fs-1 mb-3">✉️</div>
          <p className="text-secondary">No messages found matching your filters.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {messages.map((message) => (
            <div
              className={`admin-card ${message.isRead ? "" : "border-danger"}`}
              style={message.isRead ? undefined : { borderColor: "#e50914 !important" }}
              key={message.id}
            >
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className={`badge ${message.isRead ? "bg-secondary" : "bg-danger"}`}
                    >
                      {message.isRead ? "Read" : "New"}
                    </span>
                    <span className="fw-bold text-white fs-6">{message.name}</span>
                    <span className="text-secondary small">
                      —{" "}
                      <a href={`mailto:${message.email}`} className="text-secondary">
                        {message.email}
                      </a>
                    </span>
                  </div>
                  <div className="fw-bold text-light mb-2">
                    Subject: {message.subject || "(No Subject)"}
                  </div>
                  <div
                    className="text-secondary"
                    style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, maxWidth: "720px" }}
                  >
                    {message.message}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-secondary small mb-3">
                    {formatDateTime(message.createdAt)}
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <a
                      href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || "Your Inquiry")}`}
                      className="btn btn-sm btn-outline-success"
                    >
                      ↩ Reply via Email
                    </a>
                    <AdminActionButton
                      endpoint={`/api/admin/messages/${message.id}`}
                      method="PATCH"
                      body={{ action: message.isRead ? "mark_unread" : "mark_read" }}
                      label={message.isRead ? "↩ Mark Unread" : "✓ Mark Read"}
                      className="btn btn-sm btn-outline-info w-100"
                      silent
                    />
                    <AdminActionButton
                      endpoint={`/api/admin/messages/${message.id}`}
                      method="DELETE"
                      label="✕ Delete"
                      className="btn btn-sm btn-outline-danger w-100"
                      confirm="Delete this message? This is permanent."
                      redirectTo="/admin/messages"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
