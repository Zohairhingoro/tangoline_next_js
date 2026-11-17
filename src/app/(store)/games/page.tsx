import type { Metadata } from "next";
import {
  BrandLogoOption,
  CollectionView,
} from "@/components/store/CollectionView";
import { getProductsByCategory } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Games - Tangoline Inc.",
};

type SearchParams = Promise<{ q?: string; brand?: string }>;

export default async function GamesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const brand = (params.brand ?? "").trim();
  const products = await getProductsByCategory("games", {
    search,
    brand,
    categorySlugs: ["games"],
    categoryId: 1,
  });

  return (
    <CollectionView
      title="Video Games Collection"
      subtitle="Official physical releases and digital editions with warranty"
      searchPlaceholder="Search games by title..."
      allLabel="ALL GAMES"
      basePath="/games"
      search={search}
      activeFilter={brand}
      products={products}
      emptyText="No games found matching your criteria."
      emptyButton="View All Games"
      brandOptions={[
        BrandLogoOption({ filter: "xbox", src: "/images/logos/xbox-logo.svg", alt: "Xbox", height: 32 }),
        BrandLogoOption({ filter: "ps", src: "/images/logos/playstation-logo.svg", alt: "PlayStation", height: 28 }),
        BrandLogoOption({ filter: "nin", src: "/nintendo logo.png", alt: "Nintendo", height: 30 }),
      ]}
    />
  );
}
