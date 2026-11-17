# Tangoline Migration Progress

Tracking the migration of the raw-PHP Tangoline e-commerce application to Next.js.

**Original repository (reference only, never modified):** <https://github.com/Zohairhingoro/tangoline>
**New repository:** <https://github.com/Zohairhingoro/tangoline_next_js>

---

## Current Status

- **Current phase:** Phase 3 — Storefront UI ✅ complete → starting Phase 4
- **Latest commit:** `33c973b` — `feat: build faithful storefront UI and routes`
- **Testing status:** `npm run lint`, `npx tsc --noEmit`, `prisma validate`,
  `prisma generate`, and `npm run build` all pass. No live MySQL server in the build
  environment, so DB-backed routes are dynamic and will be exercised once `DATABASE_URL`
  points at a real database.

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

## Phase 4 — Storefront Functionality ⬜

- [x] Search and brand filtering
- [x] Shopping cart client state (localStorage) — DB sync still pending
- [ ] Cart → `cart_items` DB sync (`/api/cart`)
- [ ] Checkout with geolocation-assisted address fill and `TNG-XXXXX` order numbers
- [ ] DOCX download tracking (`downloads` table)
- [ ] Contact form (`/api/contact`)
- [ ] Commit and push

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

- The original app is a hybrid localStorage + MySQL cart. Phase 3 reproduces the localStorage
  behaviour; `/api/cart` DB sync is still to be added in Phase 4.
- Original DOCX files live in `fc/`; they are copied to `storage/fc/`. The new
  `/api/download/[id]` route serves existing files and generates missing ones on demand;
  download tracking is still to be added in Phase 4.
- `database/database.sql` (original) is preserved at `prisma/legacy/database.sql` for reference.
- MySQL is not guaranteed to be running in the build environment; database-backed pages will be
  dynamic (no build-time DB access).
