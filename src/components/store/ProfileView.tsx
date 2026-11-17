"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { ProfilePageData } from "@/types";

const cardStyle = {
  background: "rgba(18, 18, 18, 0.9)",
  border: "1px solid #2a2a2a",
} as const;

function statusClass(status: string): string {
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

function displayPaymentMethod(method: string): string {
  return method
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function ProfileView({ data }: { data: ProfilePageData }) {
  const [profileValues, setProfileValues] = useState({
    fullName: data.fullName,
    phone: data.phone,
    address: data.address,
    city: data.city,
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordValues, setPasswordValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    setSavingProfile(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileValues),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.success) {
        setProfileError(result.error ?? "Unable to update your profile.");
        return;
      }
      setProfileMessage(result.message ?? "Profile information updated successfully!");
    } catch {
      setProfileError("Unable to update your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    setSavingPassword(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordValues),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.success) {
        setPasswordError(result.error ?? "Unable to change your password.");
        return;
      }
      setPasswordMessage(result.message ?? "Password changed successfully!");
      setPasswordValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setPasswordError("Unable to change your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <main className="container my-5">
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="p-4 rounded-3 mb-4" style={cardStyle}>
            <div className="text-center mb-3">
              <div style={{ fontSize: "3.5rem", color: "#e50914" }}>👤</div>
              <h2 className="h4 fw-bold text-white mb-0">
                {data.fullName || data.username}
              </h2>
              <div className="text-secondary small">@{data.username}</div>
              <div className="badge bg-danger mt-2">Verified Gamer</div>
            </div>
            <hr className="border-secondary" />
            <div className="text-secondary small mb-2">
              <strong>Email:</strong> {data.email}
            </div>
            <div className="text-secondary small mb-2">
              <strong>Member Since:</strong> {data.memberSince}
            </div>
            <div className="text-secondary small">
              <strong>Total Orders:</strong> {data.orders.length}
            </div>
          </div>

          <div className="p-4 rounded-3" style={cardStyle}>
            <h3 className="h5 fw-bold text-white mb-3">Security &amp; Password</h3>
            {passwordMessage ? (
              <div className="alert alert-success small py-2" role="alert">
                {passwordMessage}
              </div>
            ) : null}
            {passwordError ? (
              <div className="alert alert-danger small py-2" role="alert">
                {passwordError}
              </div>
            ) : null}

            <form onSubmit={changePassword}>
              <div className="mb-3">
                <label className="form-label text-light small">Current Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  required
                  value={passwordValues.currentPassword}
                  onChange={(event) =>
                    setPasswordValues((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-light small">New Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  required
                  value={passwordValues.newPassword}
                  onChange={(event) =>
                    setPasswordValues((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-light small">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  required
                  value={passwordValues.confirmPassword}
                  onChange={(event) =>
                    setPasswordValues((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <button
                type="submit"
                className="btn btn-outline-danger btn-sm w-100"
                disabled={savingPassword}
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="p-4 rounded-3 mb-4" style={cardStyle}>
            <h3 className="h5 fw-bold text-white mb-3">Profile Information</h3>
            {profileMessage ? (
              <div className="alert alert-success small py-2" role="alert">
                {profileMessage}
              </div>
            ) : null}
            {profileError ? (
              <div className="alert alert-danger small py-2" role="alert">
                {profileError}
              </div>
            ) : null}

            <form onSubmit={saveProfile}>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profileValues.fullName}
                    onChange={(event) =>
                      setProfileValues((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small">Phone Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profileValues.phone}
                    onChange={(event) =>
                      setProfileValues((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label text-light small">City</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profileValues.city}
                    onChange={(event) =>
                      setProfileValues((prev) => ({
                        ...prev,
                        city: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-light small">
                    Default Delivery Address
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    value={profileValues.address}
                    onChange={(event) =>
                      setProfileValues((prev) => ({
                        ...prev,
                        address: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-danger btn-sm mt-3 px-4"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="p-4 rounded-3" style={cardStyle}>
            <h3 className="h5 fw-bold text-white mb-3">Your Purchase History</h3>
            {data.orders.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                <p className="mb-2">You haven&apos;t placed any orders yet.</p>
                <Link href="/products" className="btn btn-outline-danger btn-sm">
                  Explore Store
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table text-white align-middle mb-0">
                  <thead>
                    <tr className="border-secondary text-secondary small">
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((order) => (
                      <tr className="border-secondary" key={order.id}>
                        <td className="fw-bold text-danger">#{order.orderNumber}</td>
                        <td className="small text-secondary">{order.createdAt}</td>
                        <td>{order.itemCount} item(s)</td>
                        <td className="fw-bold text-white">{formatPrice(order.total)}</td>
                        <td className="small text-secondary">
                          {displayPaymentMethod(order.paymentMethod)}
                        </td>
                        <td>
                          <span className={`badge ${statusClass(order.status)}`}>
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
      </div>
    </main>
  );
}
