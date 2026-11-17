import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add New Product - Tangoline Admin",
};

export default async function AdminProductCreatePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  if (categories.length === 0) {
    redirect("/admin/categories?error=Create a category before adding products.");
  }

  return <ProductForm mode="create" categories={categories} />;
}
