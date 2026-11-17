import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required — copy .env.example to .env"),
  SESSION_SECRET: z
    .string()
    .min(16, "SESSION_SECRET must be at least 16 characters"),
  NEXT_PUBLIC_BASE_URL: z.string().optional(),
  DOCX_STORAGE_DIR: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Server-side environment validation. Called lazily so the build never needs a
 * real database connection — only runtime routes that touch the DB require it.
 */
export function getEnv(): Env {
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    DOCX_STORAGE_DIR: process.env.DOCX_STORAGE_DIR,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`,
    );
  }

  return parsed.data;
}
