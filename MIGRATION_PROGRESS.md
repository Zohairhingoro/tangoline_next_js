# Tangoline Migration Progress

Tracking the migration of the raw-PHP Tangoline e-commerce application to Next.js.

**Original repository (reference only, never modified):** <https://github.com/Zohairhingoro/tangoline>
**New repository:** <https://github.com/Zohairhingoro/tangoline_next_js>

---

## Current Status

- **Current phase:** MongoDB Atlas rewrite — code complete, live DB verification pending.
- **Latest commit:** see `git log` (this commit contains the MongoDB rewrite).
- **Testing status:** `npm run lint`, `npx tsc --noEmit`, `npm run build`, and dummy-env
  `npx prisma validate` all pass. `npm run db:migrate-sql:dry` parses the legacy dump into
  45 documents (1 admin, 1 user, 3 categories, 40 products). A live Atlas connection string
  is still required for runtime/end-to-end testing.
- The original PHP/MySQL phases below are preserved as history. The MongoDB rewrite in Phase 9
  supersedes the MySQL-specific implementation details; storefront/admin UI parity is unchanged.

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
- [x] Commit and push (`3a8e72d`)

## Phase 2 — Database and Architecture ✅ (superseded by Phase 9)

- [x] Prisma schema mirroring all 11 legacy tables (enums, indexes, relations, `@map`)
- [x] Lazy Prisma client singleton and environment validation
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
- [x] Order creation with exact legacy `TNG-<hex><random>` numbers and DB-validated prices
- [x] `/api/contact` + contact page storing validated messages in `contact_messages`
- [x] DOCX download tracking in `downloads` with on-demand generation and `docx_file` update
- [x] `lint`, `tsc`, `build`, `prisma validate` all pass; every new route is dynamic
- [x] Commit and push (Phase 4 implementation commit in `git log`)

## Phase 5 — Customer System ✅

- [x] Standalone `(auth)` route group with the original animated grid backdrop
      (`src/styles/auth.css`, 200 spans) for login and registration
- [x] `/login` + `/api/auth/login` with bcrypt verification (legacy `$2y$` compatible),
      login-activity logging, and exact original error wording
- [x] `/register` + `/api/auth/register` with bcrypt hashing, duplicate username/email
      detection, and legacy-style error messages
- [x] `/logout` + `/api/auth/logout` clearing the httpOnly session cookie and the legacy
      `tangoline_user` localStorage key
- [x] Signed-cookie sessions set explicitly on Route Handler responses via
      `setSessionCookie()`; `safeRedirectPath()` blocks open redirects and
      `requireCustomer()` preserves the return path
- [x] `/profile` guarded page with profile info card, password-change form, profile-update
      form, and purchase-history table matching the original `profile.php`
- [x] `/api/profile` + `/api/profile/password` with server-side authorization, zod
      validation, current-password verification, and bcrypt re-hashing
- [x] `lint`, `tsc`, `build`, `prisma validate` all pass
- [x] Commit and push (`4aac872`)

## Phase 6 — Admin Panel ✅

- [x] Standalone `/admin/login` with signed admin session cookie, `/api/admin/auth/login`
      and `/api/admin/auth/logout`, plus server-side `(shell)` route protection
- [x] Exact admin shell (navbar, sidebar, footer, Quicksand theme in `admin.css`) with
      query-parameter flash messages rendered above each page
- [x] Dashboard with all six KPI cards, 7-day Recharts traffic area chart, visitor
      breakdown, top downloads/views tables, and recent orders/login activity
- [x] Product CRUD with search/category filters, secure image uploads to
      `public/uploads/products/`, slug collision suffixes, DOCX regeneration and cleanup
- [x] Category CRUD with original validation wording and product-count delete protection
- [x] Order list/status updates with exact badges, date formats, payment display, hardcoded
      `Shipping Fee: FREE`, and stored price snapshots
- [x] User list/profile/edit with status toggling, deletion, and `Authentication Activity Log`
      (including the original `customer` filter quirk)
- [x] Visitor analytics with date range, mixed red-bar/cyan-line chart, per-page stats and
      100-row visit log; download analytics with fixed 14-day cyan chart and 200-row log
- [x] Contact messages inbox with unread red borders, read/unread filters and mailto replies
- [x] `lint`, `tsc`, `build`, `prisma validate` all pass; same-origin guards on every mutation
- [x] Commit and push (`8727701`)

## Phase 7 — Analytics and Remaining Features ✅

Delivered together with Phase 6 (the original analytics/messages pages were implemented as
part of the admin panel rather than a separate phase).

- [x] Visitor analytics with date-range and per-page stats
- [x] Download analytics with attribution
- [x] Contact messages inbox
- [x] DOCX generation parity
- [x] Commit and push (`8727701`)

## Phase 8 — Final Testing ✅

- [x] Static review of every route and mutation handler: same-origin guards, admin
      session checks, integer ID parsing, explicit enum validation and original error
      wording all confirmed; invalid filters now return zero rows instead of throwing
- [x] Verified order numbers use the exact original format
      (`TNG-<6 uppercase hex><2 digits>`, 10–99) in `order-service.ts`
- [x] Verified secure image upload validation (extension/MIME/signature, 10 MB cap,
      `prod_<20 hex>.<ext>` names) and DOCX path traversal protection
- [x] Verified AdminShell flash redirects, message read/unread/delete flows, category
      delete guard, and PHP-compatible date/payment/status formatting
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build` and dummy-env `npx prisma validate`
      all pass; `git diff --check` clean; no secrets
- [x] Documentation updated
- [x] Final MySQL-version commit and push (`e4c5c8a` followed by `0f640a7`)

## Phase 9 — MongoDB Atlas Rewrite ✅ (code complete)

- [x] Replaced the MySQL datasource with `provider = "mongodb"` and inline
      `url = env("DATABASE_URL")`; removed `prisma.config.ts`
- [x] Downgraded Prisma/`@prisma/client` from 7.10.1 to 6.19.3 because Prisma 7 requires a
      driver adapter and no official MongoDB adapter exists; added the `mongodb` driver for the
      data importer
- [x] Preserved legacy integer IDs as MongoDB `_id` (`Int @id @map("_id")`), removed
      MySQL-only `@db.*` types and redundant indexes, changed `Decimal` to `Float`
- [x] Added `Sequence` model (`@@map("sequences")`) and atomic `nextId()` / `nextIds()` helpers
      to replace MySQL autoincrement
- [x] Added explicit IDs at every create site: visits, login logs, contact messages, downloads,
      users, categories, products, cart items, orders, and order items
- [x] Replaced `groupBy` analytics with JavaScript aggregation and removed cross-collection
      `$transaction` calls in cart/checkout in favour of sequential writes
- [x] Added `prisma/migrate-sql-to-mongo.mjs`: dry-run parser, per-table legacy defaults,
      preserve `_id`, upsert by default, `--replace` for a clean reimport, and sequence seeding
- [x] Updated `.env.example`, `README.md`, `docs/DATABASE.md`, and npm scripts
      (`db:migrate-sql`, `db:migrate-sql:dry`)
- [x] Verified `npm run lint`, `npx tsc --noEmit`, `npm run build`, dummy-env
      `npx prisma validate`, and `npm run db:migrate-sql:dry` all pass
- [x] Commit and push MongoDB rewrite
- [ ] Provide a real MongoDB Atlas `DATABASE_URL`, create local `.env`, run the import,
      and verify all storefront/admin routes end-to-end

---

## Known Issues / Technical Notes

- The original app is a hybrid localStorage + MySQL cart. The Next.js version keeps
  localStorage authoritative in the browser and mirrors it into `cart_items` through
  `/api/cart`. On load, a non-empty DB cart wins (matching the original `cart-action.php`);
  otherwise the local cart is pushed to the server.
- Original DOCX files live in `fc/`; they are copied to `storage/fc/`. The new
  `/api/download/[id]` route serves existing files, generates missing ones on demand,
  updates `products.docx_file`, and records a `downloads` row (log failure never blocks).
- Checkout re-reads every product price from MongoDB before creating an order; client-supplied
  prices are never trusted. Write operations run sequentially rather than inside one transaction,
  so a mid-write failure can leave partial state.
- The legacy `tangoline_user` localStorage key is still written/cleared on login/register/
  logout for parity with the original client-side UI, but the header reads the authoritative
  httpOnly session cookie on the server.
- `database/database.sql` (original) is preserved at `prisma/legacy/database.sql` for reference.
- Database-backed pages are dynamic (no build-time DB access). A missing/invalid `DATABASE_URL`
  causes the first DB-backed request to throw a clear configuration error.
- Admin flash messages travel through `?success=`/`?error=` query params instead of PHP sessions;
  `AdminShell` renders them in the same Bootstrap alert style and clears them after display.
- Product uploads validate extension, MIME and file signature (10 MB cap) and are stored under
  `public/uploads/products/` with `prod_<hex>.<ext>` names; generated DOCX files still live in
  `storage/fc/` and are served through `/api/download/[id]`.
- MongoDB's Prisma connector has no `groupBy`, so analytics distinct counts and top-download
  groupings are computed in TypeScript from the same rows to keep numbers identical to the PHP
  reports.
- The admin footer still says `Raw PHP · MySQL PDO` to preserve the original visual design.
