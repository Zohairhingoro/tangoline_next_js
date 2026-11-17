# Tangoline Inc. — Gaming E-Commerce (Next.js Migration)

A faithful migration of the original raw-PHP Tangoline gaming e-commerce platform to a modern
Next.js application. This is a **migration, not a redesign**: the original dark/red visual design,
layout, and behaviour are preserved while the backend moves to Next.js Route Handlers, Prisma,
and MySQL.

- **Original (reference):** <https://github.com/Zohairhingoro/tangoline>
- **New application:** <https://github.com/Zohairhingoro/tangoline_next_js>

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, React, TypeScript) |
| Styling | Tailwind CSS + original `site.css` design tokens (Quicksand font) |
| Icons | Lucide React |
| Database | MySQL via Prisma ORM |
| Auth | Secure httpOnly cookie sessions, bcrypt password hashing |
| Charts | Recharts (parity with original Chart.js dashboards) |
| Documents | DOCX (Office Open XML) generation with tracked downloads |

---

## Project Structure

```
src/
  app/
    (store)/            # Public storefront routes
    (auth)/             # Login and registration (original animated backdrop)
    admin/              # Admin panel routes
    api/                # Route handlers (auth, cart, checkout, downloads, etc.)
  components/
    store/              # Header, Footer, ProductCard, QuickView, CartDrawer, filters, toasts
    auth/               # LoginForm, RegisterForm, animated AuthBackdrop
    admin/              # Admin UI components
    ui/                 # Shared primitives
  lib/
    auth/               # Session, password, authorization helpers
    db/                 # Prisma client singleton
  services/             # Business logic
  types/                # Shared TypeScript types
  hooks/                # Client hooks
prisma/
  schema.prisma         # Prisma schema (mirrors legacy MySQL schema)
  legacy/database.sql   # Original PHP schema + seed data (reference)
public/                 # Original logos, character art, product images
storage/fc/             # Original + generated DOCX specification files
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Update `DATABASE_URL` to point at your existing `tangoline_db` MySQL database and set a long,
random `SESSION_SECRET`.

### 3. Database

The migration is designed to be compatible with the existing MySQL schema. See
`prisma/legacy/database.sql` for the original schema and seed data. Safe import/migration
instructions are documented in Phase 2 of `MIGRATION_PROGRESS.md`.

```bash
npx prisma generate
```

### 4. Development server

```bash
npm run dev
```

Open <http://localhost:3000>.

### 5. Production build

```bash
npm run build
npm start
```

### Useful scripts

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript, no emit
npm run db:validate   # Validate prisma/schema.prisma
npm run db:generate   # Regenerate Prisma Client
npm run db:pull       # Introspect the live MySQL schema
```

---

## Implemented Storefront Routes

| Next.js route | Original PHP page |
|---|---|
| `/` | `index.php` |
| `/products` | `product.php` |
| `/games` | `games.php` |
| `/consoles` | `console.php` |
| `/pc-parts` | `pc-parts.php` |
| `/product/[slug]` | `product-details.php` |
| `/cart` | `cart.php` |
| `/checkout` | `checkout.php` |
| `/about-us` | `about-us.php` |
| `/contact-us` | `contact-us.php` |
| `/api/cart` | `cart-action.php` |
| `/api/checkout` | `checkout.php` (order creation) |
| `/api/contact` | `contact-us.php` (message storage) |
| `/api/download/[id]` | `download-details.php` |
| `/login` | `login.php` |
| `/register` | `register.php` |
| `/logout` | `logout.php` |
| `/profile` | `profile.php` |
| `/api/auth/login` | `login.php` (authentication) |
| `/api/auth/register` | `register.php` (registration) |
| `/api/auth/logout` | `logout.php` (session teardown) |
| `/api/profile` | `profile.php` (profile update) |
| `/api/profile/password` | `profile.php` (password change) |

All storefront routes are server-rendered on demand so the build never needs a live MySQL
connection. The original `site.css` and Bootstrap 5.0.2 are loaded alongside Tailwind to
preserve the exact dark/red Quicksand design.

## Implemented Admin Routes

| Next.js route | Original PHP page |
|---|---|
| `/admin/login` | `admin/login.php` |
| `/admin/dashboard` | `admin/dashboard.php` |
| `/admin/products` | `admin/products/index.php` |
| `/admin/products/create` | `admin/products/create.php` |
| `/admin/products/[id]/edit` | `admin/products/edit.php` |
| `/admin/categories` | `admin/categories/index.php` |
| `/admin/categories/create` | `admin/categories/create.php` |
| `/admin/categories/[id]/edit` | `admin/categories/edit.php` |
| `/admin/orders` | `admin/orders/index.php` |
| `/admin/orders/[id]` | `admin/orders/view.php` |
| `/admin/users` | `admin/users/index.php` |
| `/admin/users/[id]` | `admin/users/view.php` |
| `/admin/users/[id]/edit` | `admin/users/edit.php` |
| `/admin/users/activity` | `admin/users/activity.php` |
| `/admin/analytics/visitors` | `admin/analytics/visitors.php` |
| `/admin/analytics/downloads` | `admin/analytics/downloads.php` |
| `/admin/messages` | `admin/messages/index.php` |

Admin mutations go through same-origin-protected Route Handlers under `/api/admin/*`.
Admin pages share the standalone `admin.css` theme and are guarded server-side by the
`(shell)` route group. Product uploads are written to `public/uploads/products/` with
signature validation, and create/edit regenerate the product's `.docx` specification file.

---

## Default Credentials (from the original application)

Change these before any internet-facing deployment.

| Account | Username | Password |
|---|---|---|
| Administrator | `admin` | `admin123` |
| Sample customer | `gamer` | `gamer123` |

---

## Migration Notes

The original application used PHP sessions, a localStorage + MySQL hybrid cart, bcrypt passwords,
CSRF tokens, and generated `.docx` specification sheets. Each of these behaviours is being
reimplemented with equivalent Next.js/TypeScript patterns. Detailed status is tracked in
[`MIGRATION_PROGRESS.md`](./MIGRATION_PROGRESS.md).

Phase 4 added the transactional checkout flow. Order numbers follow the original
`TNG-<6 uppercase hex><2 digits>` format, and every line price is re-checked against MySQL
before an order is written. Cart state is mirrored into `cart_items` via an httpOnly cart-session
cookie, and all mutating API routes enforce same-origin checks and zod validation.

Phase 5 added the customer system: login, registration, logout, profile editing, password
changes, and order history. Passwords use bcrypt (legacy `$2y$` hashes are verified by
normalising the prefix), sessions are signed httpOnly cookies, and guarded pages redirect
unauthenticated visitors back after login via a sanitised `redirect` parameter. The original
animated auth backdrop and error wording are preserved.

Phase 6 delivered the full admin panel: signed admin sessions with guarded shell routes,
the KPI dashboard and traffic chart, product/category CRUD with secure image uploads and
automatic DOCX generation, order status processing, user management and login-activity log,
visitor/download analytics with Recharts, and the contact-message inbox. Flash messages,
badge colours, date formats, filters, and original confirmation wording are preserved;
only the underlying transport changed from PHP form POSTs to JSON/multipart Route Handlers.

Final testing (Phase 8) added a static review pass over all routes and mutation handlers.
Invalid admin filter values now return zero rows exactly like the original SQL instead of
reaching Prisma as invalid enums, and an obsolete order-number helper was removed. All
verification commands pass: `npm run lint`, `npx tsc --noEmit`, `npm run build`, and
`npx prisma validate`. Live DB-backed end-to-end testing remains the only outstanding item
and requires a real `DATABASE_URL`.

---

*Built for Tangoline Inc. — migrated from Raw PHP · MySQL PDO · Bootstrap 5.*
