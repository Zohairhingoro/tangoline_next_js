import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductDetailActions } from "@/components/store/ProductDetailActions";
import { SafeImage } from "@/components/store/SafeImage";
import { formatPrice } from "@/lib/utils";
import {
  getProductBySlug,
  getRelatedProducts,
  incrementProductViews,
} from "@/services/product-service";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} - Tangoline Inc.` : "Product Not Found - Tangoline Inc.",
  };
}

function categoryTarget(slug: string): string {
  if (slug === "games") return "/games";
  if (slug === "pc-parts" || slug === "pc") return "/pc-parts";
  return "/consoles";
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  await incrementProductViews(product.id);
  const related = await getRelatedProducts(product.categoryId, product.id);
  const inStock = product.stockStatus === "in_stock";
  const target = categoryTarget(product.categorySlug);

  return (
    <main className="container my-4">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb bg-transparent p-0">
          <li className="breadcrumb-item">
            <Link href="/" className="text-danger text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={target} className="text-danger text-decoration-none">
              {product.categoryName}
            </Link>
          </li>
          <li className="breadcrumb-item active text-secondary" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div
        className="row g-4 p-4 rounded-3"
        style={{ background: "rgba(18, 18, 18, 0.9)", border: "1px solid #2a2a2a" }}
      >
        <div
          className="col-12 col-lg-5 text-center d-flex align-items-center justify-content-center p-3"
          style={{
            background: "radial-gradient(circle at center, #222 0%, #0c0c0c 100%)",
            borderRadius: 10,
            minHeight: 380,
          }}
        >
          <SafeImage
            src={product.image}
            alt={product.name}
            className="img-fluid"
            style={{
              maxHeight: 340,
              objectFit: "contain",
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.8))",
            }}
          />
        </div>

        <div className="col-12 col-lg-7 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
              <span className="badge bg-danger px-3 py-2">{product.platform}</span>
              <span className="badge bg-dark border border-secondary px-3 py-2">{product.brand}</span>
              <span className={`badge ${inStock ? "bg-success" : "bg-secondary"} px-3 py-2`}>
                {inStock ? "✔ In Stock" : "Out of Stock"}
              </span>
            </div>

            <h1 className="h2 fw-bold text-white mb-2">{product.name}</h1>

            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="text-warning fs-6">★★★★★</span>
              <span className="text-secondary small">5.0 Official Genuine Product with Store Warranty</span>
            </div>

            <div className="mb-4">
              <span className="fs-2 fw-bold text-danger">{formatPrice(product.price)}</span>
              {product.originalPrice ? (
                <span className="text-muted text-decoration-line-through fs-5 ms-3">
                  {formatPrice(product.originalPrice)}
                </span>
              ) : null}
            </div>

            <div
              className="text-light mb-4"
              style={{ lineHeight: 1.7, fontSize: "1rem", whiteSpace: "pre-line" }}
            >
              {product.description}
            </div>
          </div>

          <ProductDetailActions product={product} />
        </div>
      </div>

      {product.specifications || product.systemRequirements ? (
        <div className="row g-4 mt-3">
          {product.specifications ? (
            <div className="col-12 col-md-6">
              <div
                className="p-4 rounded-3 h-100"
                style={{ background: "rgba(18, 18, 18, 0.85)", border: "1px solid #2a2a2a" }}
              >
                <h3 className="h5 fw-bold text-danger mb-3">Technical Specifications</h3>
                <pre
                  className="text-secondary mb-0"
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    fontSize: "0.93rem",
                    lineHeight: 1.7,
                  }}
                >
                  {product.specifications}
                </pre>
              </div>
            </div>
          ) : null}

          {product.systemRequirements ? (
            <div className="col-12 col-md-6">
              <div
                className="p-4 rounded-3 h-100"
                style={{ background: "rgba(18, 18, 18, 0.85)", border: "1px solid #2a2a2a" }}
              >
                <h3 className="h5 fw-bold text-danger mb-3">System Requirements &amp; Notes</h3>
                <pre
                  className="text-secondary mb-0"
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    fontSize: "0.93rem",
                    lineHeight: 1.7,
                  }}
                >
                  {product.systemRequirements}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {related.length > 0 ? (
        <div className="mt-5">
          <h3 className="h4 fw-bold text-white mb-4">Related Gaming Items</h3>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                variant={product.categorySlug.includes("pc") ? "pc" : "default"}
              />
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
