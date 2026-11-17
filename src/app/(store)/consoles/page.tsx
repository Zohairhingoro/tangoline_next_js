import type { Metadata } from "next";
import {
  BrandLogoOption,
  CollectionView,
} from "@/components/store/CollectionView";
import { getProductsByCategory } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consoles - Tangoline Inc.",
};

type SearchParams = Promise<{ q?: string; brand?: string }>;

export default async function ConsolesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const brand = (params.brand ?? "").trim();
  const products = await getProductsByCategory("consoles", {
    search,
    brand,
    categorySlugs: ["consoles"],
    categoryId: 2,
  });

  return (
    <CollectionView
      title="Consoles & Hardware Collection"
      subtitle="Official next-generation systems, pro controllers, and accessories"
      searchPlaceholder="Search hardware..."
      allLabel="ALL CONSOLES"
      basePath="/consoles"
      search={search}
      activeFilter={brand}
      products={products}
      emptyText="No consoles found matching your criteria."
      emptyButton="View All Consoles"
      brandOptions={[
        BrandLogoOption({ filter: "ps", src: "/images/logos/playstation-logo.svg", alt: "PlayStation", height: 28 }),
        BrandLogoOption({ filter: "xbox", src: "/images/logos/xbox-logo.svg", alt: "Xbox", height: 32 }),
        BrandLogoOption({ filter: "nin", src: "/nintendo logo.png", alt: "Nintendo", height: 30 }),
      ]}
    />
  );
}
