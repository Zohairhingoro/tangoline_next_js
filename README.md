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
    admin/              # Admin panel routes
    api/                # Route handlers (auth, cart, checkout, downloads, etc.)
  components/
    store/              # Header, Footer, ProductCard, QuickView, CartDrawer, filters, toasts
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

All storefront routes are server-rendered on demand so the build never needs a live MySQL
connection. The original `site.css` and Bootstrap 5.0.2 are loaded alongside Tailwind to
preserve the exact dark/red Quicksand design.

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
Login/register/profile pages are planned for Phase 5.

---

*Built for Tangoline Inc. — migrated from Raw PHP · MySQL PDO · Bootstrap 5.*
