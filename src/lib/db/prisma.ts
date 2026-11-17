import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure your MySQL connection.",
    );
  }
  // Prisma 7 uses driver adapters instead of a bundled query engine.
  // The MariaDB adapter speaks the MySQL protocol and works with MySQL too.
  const adapter = new PrismaMariaDb(url);
  return new PrismaClient({ adapter });
}

/**
 * Lazy proxy: the client is only created on first query, so the build never
 * requires a live database connection (all DB-backed pages are dynamic).
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (!globalForPrisma.prismaClient) {
      globalForPrisma.prismaClient = createClient();
    }
    const client = globalForPrisma.prismaClient;
    const value = client[property as keyof PrismaClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
