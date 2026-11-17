# Database Setup & Safe Migration

The Next.js application is designed to run against the **existing** `tangoline_db` MySQL database
created by the original PHP application. No schema changes are required: `prisma/schema.prisma`
maps all 11 legacy tables and columns with `@@map` / `@map`, including enums and indexes.

> **Never import the legacy SQL into a database that already holds live data.** The original
> `database.sql` contains `DROP TABLE IF EXISTS` statements.

---

## 1. Environment

```bash
cp .env.example .env
```

Set:

```
DATABASE_URL="mysql://root:your-password@localhost:3306/tangoline_db"
SESSION_SECRET="<long random string>"
```

The MySQL user needs `SELECT, INSERT, UPDATE, DELETE` on `tangoline_db`. For schema sync
operations it also needs `CREATE, ALTER, DROP`.

---

## 2. Fresh database (no existing data)

Import the original schema and seed data **once**, then generate the Prisma client:

```bash
mysql -u root -p < prisma/legacy/database.sql
npx prisma generate
```

This restores the exact original structure: 11 tables, default admin/customer accounts,
3 categories, and 40 products.

---

## 3. Existing database (preserve live data)

Do **not** import the legacy SQL. Instead verify the Prisma schema matches the live database:

```bash
npx prisma db pull          # introspect current structure
npx prisma validate         # confirm the contract is valid
npx prisma generate         # regenerate the typed client
```

If the live database was created from the original `database.sql`, `prisma db pull` will report
no drift. If drift is detected, review it carefully before deciding on any `db push`.

---

## 4. Useful commands

| Command | Purpose |
|---|---|
| `npm run db:generate` | Regenerate the Prisma client after schema edits |
| `npm run db:validate` | Validate `prisma/schema.prisma` |
| `npm run db:pull` | Introspect the live database into the schema (read-only) |
| `npm run db:push` | **Only for fresh/empty databases** — sync schema without migrations |

---

## 5. Notes

- Passwords in the seed data are legacy bcrypt hashes (`$2y$`). The auth layer normalises the
  prefix to `$2a$` for verification, so existing accounts keep working unchanged.
- The legacy `fc/` DOCX files were copied to `storage/fc/`. They are served through a tracked
  download route (`/api/download/[id]`) rather than directly from `public/`.
- Some seeded products reference `-details.docx` paths that were never present in the original
  repository. The download route generates the document on demand in that case.
