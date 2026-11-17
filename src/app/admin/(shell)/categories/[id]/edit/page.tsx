import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Category - Tangoline Admin",
};

export default async function AdminCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    redirect("/admin/categories?error=Category not found.");
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) redirect("/admin/categories?error=Category not found.");

  return (
    <CategoryForm
      mode="edit"
      initial={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
      }}
    />
  );
}
