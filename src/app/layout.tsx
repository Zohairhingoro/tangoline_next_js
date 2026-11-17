import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/site.css";

export const metadata: Metadata = {
  title: "Tangoline.Inc - Unlock Your Inner Gamer",
  description:
    "Pakistan's premier gaming hub for consoles, blockbuster games, and high-performance PC parts.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body id="intro">{children}</body>
    </html>
  );
}
