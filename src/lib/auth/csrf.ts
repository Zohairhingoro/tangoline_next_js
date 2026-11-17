/**
 * Origin check for mutating route handlers. Combined with SameSite=Lax cookies
 * and JSON/form content-type restrictions this provides CSRF protection without
 * an extra token round-trip (Next.js Server Actions are protected natively).
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser clients (curl, etc.)

  try {
    const originUrl = new URL(origin);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return originUrl.host === host;
  } catch {
    return false;
  }
}
