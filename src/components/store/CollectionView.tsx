import Link from "next/link";
import { BrandFilter, type BrandFilterOption } from "@/components/store/BrandFilter";
import { ProductCard, brandClass, pcPartClasses } from "@/components/store/ProductCard";
import { SafeImage } from "@/components/store/SafeImage";
import type { StoreProduct } from "@/types";

type CollectionViewProps = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  allLabel: string;
  basePath: string;
  search: string;
  activeFilter: string;
  products: StoreProduct[];
  brandOptions: BrandFilterOption[];
  emptyText: string;
  emptyButton: string;
  filterClassName?: string;
  variant?: "default" | "pc";
};

export function CollectionView({
  title,
  subtitle,
  searchPlaceholder,
  allLabel,
  basePath,
  search,
  activeFilter,
  products,
  brandOptions,
  emptyText,
  emptyButton,
  filterClassName,
  variant = "default",
}: CollectionViewProps) {
  const options: BrandFilterOption[] = [
    {
      filter: "all",
      label: <span className="fw-bold text-white px-2">{allLabel}</span>,
    },
    ...brandOptions,
  ];

  return (
    <main className="container mb-5">
      <div className="row align-items-center mb-4 g-3">
        <div className="col-12 col-md-6">
          <h1 className="h3 fw-bold text-white mb-0">{title}</h1>
          <p className="text-secondary small mb-0">{subtitle}</p>
        </div>
        <div className="col-12 col-md-6">
          <form method="GET" action={basePath} className="d-flex gap-2 justify-content-md-end">
            <input
              type="text"
              name="q"
              className="form-control form-control-sm text-white bg-dark border-secondary"
              placeholder={searchPlaceholder}
              defaultValue={search}
              style={{ maxWidth: 280 }}
            />
            <button type="submit" className="btn btn-danger btn-sm px-3">Search</button>
            {search || activeFilter ? (
              <Link href={basePath} className="btn btn-outline-secondary btn-sm">Clear</Link>
            ) : null}
          </form>
        </div>
      </div>

      <BrandFilter
        options={options}
        initialActive={activeFilter || "all"}
        className={filterClassName}
      />

      {products.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-secondary fs-5">{emptyText}</p>
          <Link href={basePath} className="btn btn-outline-danger btn-sm">{emptyButton}</Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              filterClasses={
                variant === "pc"
                  ? pcPartClasses(product.name, product.brand)
                  : brandClass(product.brand)
              }
              variant={variant}
              rating="4.9"
            />
          ))}
        </div>
      )}
    </main>
  );
}

export function BrandLogoOption({
  filter,
  src,
  alt,
  height,
}: {
  filter: string;
  src: string;
  alt: string;
  height: number;
}) {
  return {
    filter,
    label: <SafeImage src={src} alt={alt} style={{ height }} />,
  } satisfies BrandFilterOption;
}
