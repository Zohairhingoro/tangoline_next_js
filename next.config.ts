import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Config options here. Cache Components is disabled because DB-backed
     storefront routes must stay dynamic and never prerender without MongoDB. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
