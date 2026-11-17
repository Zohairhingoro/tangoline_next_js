import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getSession } from "@/lib/auth/session";
import "@/styles/admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login - Tangoline Inc.",
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin/dashboard");

  return (
    <div className="admin-login-body">
      <AdminLoginForm />
    </div>
  );
}
