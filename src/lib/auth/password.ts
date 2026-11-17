import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * The legacy database stores bcrypt hashes with the `$2y$` prefix (PHP).
 * bcrypt.js reads `$2a$`/`$2b$` hashes, so normalise the prefix first.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!hash) return false;
  const normalised = hash.startsWith("$2y$") ? `$2a$${hash.slice(4)}` : hash;
  try {
    return await bcrypt.compare(password, normalised);
  } catch {
    return false;
  }
}
