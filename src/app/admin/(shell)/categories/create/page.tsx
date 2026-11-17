import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = {
  title: "Add Category - Tangoline Admin",
};

export default function AdminCategoryCreatePage() {
  return <CategoryForm mode="create" />;
}
