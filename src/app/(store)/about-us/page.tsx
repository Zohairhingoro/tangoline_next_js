import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us - Tangoline Inc.",
};

export default function AboutUsPage() {
  return (
    <main
      className="container-about text-center mb-5"
      style={{
        color: "white",
        padding: "60px 20px",
        maxWidth: 900,
        margin: "0 auto 40px",
      }}
    >
      <h1
        className="section-title"
        style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: 30, color: "#e50914" }}
      >
        About Us
      </h1>
      <p
        className="section-content"
        style={{ fontSize: "1.15rem", lineHeight: 1.8, color: "#e0e0e0", marginBottom: 24 }}
      >
        Welcome to Tangoline, your trusted partner in the world of innovative gaming products! We
        are committed to offering high-quality and reliable solutions to meet the needs of our
        gaming community. Our team of passionate professionals works tirelessly to ensure every
        console, game title, and accessory is backed by standard excellence and authentic warranty.
      </p>
      <p
        className="section-content"
        style={{ fontSize: "1.15rem", lineHeight: 1.8, color: "#e0e0e0", marginBottom: 24 }}
      >
        Whether you are an aspiring esports player, a casual gaming enthusiast, or a collector
        looking for the latest limited edition releases, we aim to provide the perfect products
        tailored to your gaming passion. With over a decade of industry experience, we bring forth a
        unique blend of passion, cutting-edge hardware, and customer-first service.
      </p>
    </main>
  );
}
