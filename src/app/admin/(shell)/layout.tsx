import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import "@/styles/admin.css";

export const dynamic = "force-dynamic";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <Suspense fallback={null}>
      <AdminShell admin={admin}>{children}</AdminShell>
    </Suspense>
  );
}
