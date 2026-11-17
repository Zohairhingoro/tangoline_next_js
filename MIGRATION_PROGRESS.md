# Tangoline Migration Progress

Tracking the migration of the raw-PHP Tangoline e-commerce application to Next.js.

**Original repository (reference only, never modified):** <https://github.com/Zohairhingoro/tangoline>
**New repository:** <https://github.com/Zohairhingoro/tangoline_next_js>

---

## Current Status

- **Current phase:** Phase 4 — Storefront Functionality ✅ complete → starting Phase 5
- **Latest commit:** `f1a8d31` — `feat: implement storefront cart, checkout and contact flows`
- **Testing status:** `npm run lint`, `npx tsc --noEmit`, `npm run build`, and
  `npx prisma validate` all pass (Prisma config requires a `DATABASE_URL` to be present,
  but no live MySQL connection is needed for validation/build). DB-backed flows will be
  exercised end-to-end once `DATABASE_URL` points at a real database.

---

## Phase 1 — Repository Setup ✅

- [x] Verify Git, Node.js, npm, and GitHub CLI availability
- [x] Clone original PHP repository as a read-only reference
- [x] Analyze original codebase (structure, schema, CSS, JS, auth, 40 products)
- [x] Create `tangoline_next_js` GitHub repository
- [x] Scaffold Next.js (App Router, TypeScript, Tailwind CSS, ESLint, `src/`)
- [x] Copy original assets (logos, character art, product images, DOCX files, legacy SQL)
- [x] Configure Git remote and identity
- [x] Create `.env.example`, README, and this progress file
- [x] Commit and push initial setup (`3a8e72d`)

## Phase 2 — Database and Architecture ✅

- [x] Prisma 7 schema mirroring all 11 legacy tables (enums, indexes, relations, `@map`)
- [x] Lazy Prisma client singleton with MariaDB/MySQL driver adapter
- [x] Environment validation (`zod`) and `.env.example`
- [x] Safe import/migration guide (`docs/DATABASE.md`) — no destructive migrations
- [x] Secure signed-cookie sessions, bcrypt hashing (legacy `$2y$` compatible), CSRF origin check
- [x] Visitor/login analytics helpers and DOCX generation service
- [x] Bootstrap 5.0.2 CSS retained for pixel-identical layout, original `site.css` imported
- [x] `prisma validate`, `prisma generate`, `tsc`, and `next build` all pass
- [x] Commit and push (`753bc70`)

## Phase 3 — Storefront UI ✅

- [x] Global dark theme (`site.css` → Tailwind/globals), Quicksand font
- [x] Header/navigation and footer with original markup
- [x] Homepage hero (characters, glowing `GAMER`, featured section)
- [x] Category hub and Games/Consoles/PC Parts pages
- [x] Product cards and product detail page (specs, requirements, related items)
- [x] Cart drawer, Quick View modal, toast notifications
- [x] Client cart store (`tangoline_cart`) with localStorage persistence
- [x] Search and brand/type filtering (server query + original client-side filter behavior)
- [x] Basic `/api/download/[id]` route serving legacy/generated DOCX files
- [x] `lint`, `tsc`, and `build` pass; all storefront routes are dynamic
- [x] Commit and push (`33c973b`)

## Phase 4 — Storefront Functionality ✅

- [x] Search and brand/type filtering (server-side queries, original client filter classes)
- [x] Shopping cart client state (`tangoline_cart` localStorage) with server sync
- [x] `GET/POST /api/cart` with `get/add/update/remove/clear/sync` actions, cart-session
      cookie, same-origin checks, and zod validation
- [x] Cart page (`/cart`) reproducing the original table, quantity controls, and summary
- [x] About Us page (`/about-us`)
- [x] Checkout (`/checkout`) guarded by `requireCustomer()` with prefilled shipping fields,
      payment method selection, and geolocation-assisted address fill
- [x] Order creation with exact legacy `TNG-<hex><random>` numbers, DB-validated prices,
      `order_items` snapshots, and cart clearing in one transaction
- [x] `/api/contact` + contact page storing validated messages in `contact_messages`
- [x] DOCX download tracking in `downloads` with on-demand generation and `docx_file` update
- [x] `lint`, `tsc`, `build`, `prisma validate` all pass; every new route is dynamic
- [x] Commit and push (`f1a8d31`)

## Phase 5 — Customer System ⬜

- [ ] Registration, login, logout (bcrypt/argon2 hashing)
- [ ] Profile management, change password
- [ ] Order history with item snapshots
- [ ] Commit and push

## Phase 6 — Admin Panel ⬜

- [ ] Admin authentication and route protection
- [ ] Dashboard with KPI cards and Chart.js/Recharts visitor chart
- [ ] Product CRUD + image uploads + auto DOCX generation
- [ ] Category CRUD with product-count protection
- [ ] Order management / status updates
- [ ] User management + auth activity log
- [ ] Commit and push

## Phase 7 — Analytics and Remaining Features ⬜

- [ ] Visitor analytics with date-range and per-page stats
- [ ] Download analytics with attribution
- [ ] Contact messages inbox
- [ ] DOCX generation parity
- [ ] Commit and push

## Phase 8 — Final Testing ⬜

- [ ] Test all routes, forms, DB operations, auth, admin permissions
- [ ] Test responsive layouts, image uploads, checkout, DOCX downloads
- [ ] Fix bugs, update documentation
- [ ] Final commit and push

---

## Known Issues / Technical Notes

- The original app is a hybrid localStorage + MySQL cart. The Next.js version keeps
  localStorage authoritative in the browser and mirrors it into `cart_items` through
  `/api/cart`. On load, a non-empty DB cart wins (matching the original `cart-action.php`);
  otherwise the local cart is pushed to the server.
- Original DOCX files live in `fc/`; they are copied to `storage/fc/`. The new
  `/api/download/[id]` route serves existing files, generates missing ones on demand,
  updates `products.docx_file`, and records a `downloads` row (log failure never blocks).
- Checkout re-reads every product price from MySQL before creating an order; client-supplied
  prices are never trusted. Login/register/profile routes arrive in Phase 5, so `/checkout`
  currently redirects unauthenticated visitors to `/login` (not yet implemented).
- `database/database.sql` (original) is preserved at `prisma/legacy/database.sql` for reference.
- MySQL is not guaranteed to be running in the build environment; database-backed pages will be
  dynamic (no build-time DB access).
