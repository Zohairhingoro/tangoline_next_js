import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/store/Hero";
import { ProductCard } from "@/components/store/ProductCard";
import { brandClass } from "@/components/store/ProductCard";
import { getFeaturedProducts } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tangoline.Inc - Unlock Your Inner Gamer",
};

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <Hero />

      <section id="featured-products" className="featured-section">
        <div className="container text-center">
          <div className="featured-title-wrap">
            <h2 className="display-6 fw-bold mb-1" style={{ color: "#e50914" }}>
              Featured Products &amp; Next-Gen Hardware
            </h2>
            <p className="text-light mb-0 fs-6">
              Discover top-selling gaming consoles and blockbuster titles.
            </p>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 text-start">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                filterClasses={brandClass(product.brand)}
                rating="5.0"
              />
            ))}
          </div>

          <div className="text-center mt-5 d-flex justify-content-center gap-3 flex-wrap">
            <Link href="/games" className="btn btn-outline-danger px-4 py-2 fw-bold">
              Explore All Games →
            </Link>
            <Link href="/consoles" className="btn btn-danger px-4 py-2 fw-bold">
              Explore All Consoles →
            </Link>
            <Link href="/pc-parts" className="btn btn-outline-light px-4 py-2 fw-bold">
              Explore PC Parts →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
