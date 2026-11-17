import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserEditForm } from "@/components/admin/UserEditForm";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit User - Tangoline Admin",
};

export default async function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    redirect("/admin/users?error=User not found.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) redirect("/admin/users?error=User not found.");

  return (
    <UserEditForm
      initial={{
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        city: user.city,
        status: user.status,
      }}
    />
  );
}
