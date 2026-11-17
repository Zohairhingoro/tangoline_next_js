import type { Metadata } from "next";
import { CollectionView } from "@/components/store/CollectionView";
import { getProductsByCategory } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PC Parts & Hardware - Tangoline Inc.",
};

type SearchParams = Promise<{ q?: string; type?: string }>;

const filterLabel = (text: string) => (
  <span className="fw-bold text-white px-2">{text}</span>
);

export default async function PcPartsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const type = (params.type ?? "").trim();
  const products = await getProductsByCategory("pc-parts", {
    search,
    typeFilter: type,
    categorySlugs: ["pc-parts", "pc"],
    categoryId: 3,
  });

  return (
    <CollectionView
      title="PC Gaming & Custom Parts Collection"
      subtitle="High-end processors, flagship graphics cards, fast memory, modular PSUs & premium cooling"
      searchPlaceholder="Search PC hardware & specs..."
      allLabel="ALL PC PARTS"
      basePath="/pc-parts"
      search={search}
      activeFilter={type}
      products={products}
      emptyText="No PC parts found matching your criteria."
      emptyButton="View All PC Parts"
      filterClassName="brand-filter-container flex-wrap gap-2 mb-4"
      variant="pc"
      brandOptions={[
        { filter: "cpu", label: filterLabel("⚙️ CPUs") },
        { filter: "gpu", label: filterLabel("🎮 GPUs") },
        { filter: "motherboard", label: filterLabel("🔌 Motherboards") },
        { filter: "ram-ssd", label: filterLabel("⚡ RAM & SSDs") },
        { filter: "case-cooling", label: filterLabel("❄️ Cases & Cooling") },
        { filter: "peripheral", label: filterLabel("🖥️ Displays & Peripherals") },
      ]}
    />
  );
}
