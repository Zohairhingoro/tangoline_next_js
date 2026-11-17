import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure your MongoDB Atlas connection.",
    );
  }
  if (!/^mongodb(\+srv)?:\/\//.test(url)) {
    throw new Error(
      "DATABASE_URL must be a mongodb:// or mongodb+srv:// connection string.",
    );
  }
  // MongoDB uses Prisma's built-in connector with DATABASE_URL from the environment.
  return new PrismaClient();
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
