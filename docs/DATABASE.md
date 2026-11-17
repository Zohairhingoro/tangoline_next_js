# Database Setup & Legacy Data Import

The Next.js application is backed by **MongoDB Atlas**. The original PHP/MySQL dump at
`prisma/legacy/database.sql` is preserved for reference and can be imported into MongoDB with the
included script.

> **Never pass `--replace` against a database that already holds live data.** It deletes the
> Tangoline collections before importing. The default command upserts and is safe to re-run.

---

## 1. Create an Atlas cluster

1. Create a MongoDB Atlas cluster (the free shared tier is sufficient for local development).
2. Create a database user with read/write access to `tangoline_db`.
3. Add your current IP to **Network Access** (or use `0.0.0.0/0` only for temporary testing).
4. Copy the SRV connection string from **Connect → Connect your application**.

---

## 2. Environment

```bash
cp .env.example .env
```

Set:

```bash
DATABASE_URL="mongodb+srv://user:password@cluster0.abcde.mongodb.net/tangoline_db"
SESSION_SECRET="<long random string>"
```

`DATABASE_URL` must start with `mongodb://` or `mongodb+srv://` and should include the database
name in the path. `.env` is gitignored; never commit credentials.

---

## 3. Create collections and indexes

```bash
npm run db:generate
npx prisma db push
```

`db push` creates the collections and their indexes. Numeric IDs are preserved as MongoDB `_id`
values, so the importer must be run before creating new application records.

---

## 4. Import the legacy SQL dump

Preview the parser without connecting to MongoDB:

```bash
npm run db:migrate-sql:dry
```

Expected output:

```text
admins                1 rows
users                 1 rows
categories            3 rows
products             40 rows
Total: 45 documents
```

Then upsert the documents into MongoDB:

```bash
npm run db:migrate-sql
```

The importer:

- keeps the original integer `id` values as `_id`;
- keeps legacy column names such as `created_at`, `category_id`, and `stock_status`;
- supplies the same defaults the SQL dump relied on (timestamps, booleans, empty strings);
- seeds the `sequences` collection so new IDs continue after the imported maximum;
- is safe to re-run (existing `_id` documents are replaced with the dump values).

To start from an empty database, explicitly opt in:

```bash
npm run db:migrate-sql -- --replace
```

---

## 5. Verify

```bash
npx prisma validate
npm run db:validate
npm run dev
```

Open <http://localhost:3000>. Seed logins:

| Account | Username | Password |
|---|---|---|
| Administrator | `admin` | `admin123` |
| Sample customer | `gamer` | `gamer123` |

Legacy passwords are bcrypt hashes (`$2y$`); the auth layer normalises the prefix to `$2a$` for
verification, so existing accounts keep working unchanged.

---

## 6. Useful commands

| Command | Purpose |
|---|---|
| `npm run db:generate` | Regenerate the Prisma client after schema edits |
| `npm run db:validate` | Validate `prisma/schema.prisma` |
| `npm run db:push` | Create/update MongoDB collections and indexes |
| `npm run db:migrate-sql:dry` | Parse the legacy SQL dump without connecting |
| `npm run db:migrate-sql` | Upsert legacy rows into MongoDB |
| `npm run db:migrate-sql -- --replace` | Delete Tangoline rows, then import (destructive) |

---

## 7. Notes

- Prisma **6.19.3** is required. Prisma 7 needs a driver adapter and no official MongoDB adapter
  exists.
- `Decimal` fields were changed to `Float`; MongoDB has no native Prisma `Decimal`.
- `groupBy` is unavailable on the MongoDB connector; dashboard analytics aggregate rows in
  JavaScript.
- Cart and checkout writes are sequential rather than one cross-collection transaction.
- The legacy `fc/` DOCX files were copied to `storage/fc/`. They are served through a tracked
  download route (`/api/download/[id]`) rather than directly from `public/`.
- Some seeded products reference `-details.docx` paths that were never present in the original
  repository. The download route generates the document on demand in that case.
