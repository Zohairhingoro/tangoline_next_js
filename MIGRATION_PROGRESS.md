# Tangoline Migration Progress

Tracking the migration of the raw-PHP Tangoline e-commerce application to Next.js.

**Original repository (reference only, never modified):** <https://github.com/Zohairhingoro/tangoline>
**New repository:** <https://github.com/Zohairhingoro/tangoline_next_js>

---

## Current Status

- **Current phase:** Phase 2 — Database and Architecture ✅ complete → starting Phase 3
- **Latest commit:** _pending Phase 2 commit_
- **Testing status:** `npm run build` and `npx tsc --noEmit` pass; `prisma validate` and
  `prisma generate` succeed. No live MySQL server in the build environment, so DB-backed
  routes are dynamic and will be exercised once `DATABASE_URL` points at a real database.

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
- [ ] Commit and push

## Phase 3 — Storefront UI ⬜

- [ ] Global dark theme (`site.css` → Tailwind/globals), Quicksand font
- [ ] Header/navigation and footer with original markup
- [ ] Homepage hero + featured products
- [ ] Category hub and Games/Consoles/PC Parts pages
- [ ] Product cards and product detail page
- [ ] Cart drawer, Quick View modal
- [ ] Commit and push

## Phase 4 — Storefront Functionality ⬜

- [ ] Search and brand filtering
- [ ] Shopping cart (client + DB sync)
- [ ] Checkout with geolocation-assisted address fill and `TNG-XXXXX` order numbers
- [ ] DOCX downloads with tracking
- [ ] Contact form
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

- The original app is a hybrid localStorage + MySQL cart; the Next.js version keeps the same
  behaviour via a client cart store synced to the `cart_items` table.
- Original DOCX files live in `fc/`; they are copied to `storage/fc/` and will be served through
  a tracked download route rather than directly from `public/`.
- `database/database.sql` (original) is preserved at `prisma/legacy/database.sql` for reference.
- MySQL is not guaranteed to be running in the build environment; database-backed pages will be
  dynamic (no build-time DB access).
