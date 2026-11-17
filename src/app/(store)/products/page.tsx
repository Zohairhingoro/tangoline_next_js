import Link from "next/link";
import type { Metadata } from "next";
import { SafeImage } from "@/components/store/SafeImage";
import { getCategoriesWithCounts } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products - Tangoline Inc.",
};

const FALLBACKS = {
  games:
    "Tangoline Inc. has been selling genuine gaming discs and digital releases for over a decade. We carry a wide range of blockbuster games across Xbox, PlayStation, and Nintendo Switch.",
  consoles:
    "Tangoline Inc. provides premium game consoles and official gaming accessories with warranty coverage. Explore PlayStation 5, Xbox Series X, Nintendo Switch OLED, and pro controllers.",
  pc: "High-performance PC components, processors, graphics cards, motherboards, high-speed RAM, fast NVMe SSDs, modular PSUs, cases, and cooling systems.",
};

function Chevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
    </svg>
  );
}

export default async function ProductsPage() {
  const categories = await getCategoriesWithCounts();
  const games = categories.find((category) => category.slug === "games");
  const consoles = categories.find((category) => category.slug === "consoles");
  const pc = categories.find(
    (category) => category.slug === "pc-parts" || category.slug === "pc",
  );

  const cards = [
    {
      title: "GAMES",
      image: "/game.png",
      alt: "Video Games",
      description: games?.description || FALLBACKS.games,
      count: games?._count.products ?? 0,
      href: "/games",
    },
    {
      title: "CONSOLES",
      image: "/images/console-hub.jpg",
      alt: "Gaming Consoles & Accessories",
      description: consoles?.description || FALLBACKS.consoles,
      count: consoles?._count.products ?? 0,
      href: "/consoles",
    },
    {
      title: "PC PARTS",
      image: "/images/pc-hub.jpg",
      alt: "PC Parts & Hardware",
      description: pc?.description || FALLBACKS.pc,
      count: pc?._count.products ?? 22,
      href: "/pc-parts",
    },
  ];

  return (
    <main className="container category-section">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold" style={{ color: "#e50914" }}>
          Explore Our Products
        </h1>
        <p className="text-light fs-5">
          Browse the latest gaming titles, next-gen gaming hardware, and high-performance PC parts.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {cards.map((card) => (
          <div className="col-12 col-md-6 col-lg-4" key={card.title}>
            <div className="category-card-custom">
              <div className="category-img-container">
                <SafeImage src={card.image} alt={card.alt} />
              </div>
              <h2 className="category-title">{card.title}</h2>
              <p className="category-text">{card.description}</p>
              <Link href={card.href} className="btn-category-view">
                View Products ({card.count})
                <Chevron />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
