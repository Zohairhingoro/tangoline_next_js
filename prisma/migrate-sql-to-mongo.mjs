/**
 * Import the legacy Tangoline MySQL dump into MongoDB Atlas.
 *
 * Usage:
 *   $env:DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/tangoline_db"
 *   node prisma/migrate-sql-to-mongo.mjs
 *
 * The script keeps the original integer IDs as `_id`, maps legacy column names
 * 1:1, and seeds `sequences` so new records continue at the correct ID. It
 * upserts by default; pass --replace to delete existing rows first.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

const DUMP = path.join(process.cwd(), "prisma", "legacy", "database.sql");
const REPLACE = process.argv.includes("--replace");
const url = process.env.DATABASE_URL;

if (!url || !/^mongodb(\+srv)?:\/\//.test(url)) {
  console.error("Set DATABASE_URL to a mongodb:// or mongodb+srv:// connection string.");
  process.exit(1);
}

const DATE_COLUMNS = new Set([
  "created_at",
  "updated_at",
  "visit_date",
  "visited_at",
  "login_time",
  "downloaded_at",
]);
const BOOL_COLUMNS = new Set(["is_read", "is_featured"]);
const now = () => new Date();
const LEGACY_DEFAULTS = {
  admins: { created_at: now },
  users: {
    created_at: now,
    updated_at: now,
    full_name: "",
    phone: "",
    city: "",
    address: null,
  },
  categories: { created_at: now, description: null, image: "" },
  products: {
    created_at: now,
    updated_at: now,
    brand: "Gaming",
    platform: "PlayStation 5",
    original_price: null,
    short_description: "",
    specifications: null,
    system_requirements: null,
    image: "",
    docx_file: "",
    stock_status: "in_stock",
    is_featured: false,
    views_count: 0,
  },
  orders: {
    created_at: now,
    updated_at: now,
    postal_code: "",
    payment_method: "cash_on_delivery",
    shipping_fee: 0,
    subtotal: 0,
    total_amount: 0,
    notes: null,
  },
  order_items: {
    product_price: 0,
    quantity: 1,
    subtotal: 0,
    product_image: "",
  },
  cart_items: { quantity: 1, created_at: now, updated_at: now },
  downloads: { session_id: "", ip_address: "", downloaded_at: now },
  website_visits: { ip_hash: "", user_agent: "", visited_at: now },
  login_logs: {
    ip_address: "",
    user_agent: "",
    login_time: now,
  },
  contact_messages: { subject: "", is_read: false, created_at: now },
};

const NUMBER_COLUMNS = new Set([
  "id",
  "user_id",
  "product_id",
  "order_id",
  "category_id",
  "quantity",
  "views_count",
  "price",
  "original_price",
  "subtotal",
  "shipping_fee",
  "total_amount",
  "product_price",
]);

/** Split a MySQL VALUES list into rows, respecting quotes and escapes. */
function splitRows(text) {
  const rows = [];
  let current = "";
  let quote = null;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (char === "\\") {
        current += char + (text[i + 1] ?? "");
        i += 1;
      } else if (char === quote) {
        current += char;
        quote = null;
      } else {
        current += char;
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
    } else if (char === "(") {
      depth += 1;
      current += char;
    } else if (char === ")") {
      depth -= 1;
      current += char;
    } else if (char === "," && depth === 0) {
      rows.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) rows.push(current.trim());
  return rows;
}

/** Split one row into values, respecting quotes and escapes. */
function splitValues(text) {
  const values = [];
  let current = "";
  let quote = null;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (char === "\\") {
        const next = text[i + 1] ?? "";
        const map = { n: "\n", r: "\r", t: "\t", "0": "\0" };
        current += map[next] ?? next;
        i += 1;
      } else if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
    } else if (char === "(") {
      depth += 1;
      if (depth > 1) current += char;
    } else if (char === ")") {
      depth -= 1;
      if (depth > 0) current += char;
    } else if (char === "," && depth === 1) {
      values.push(current.trim());
      current = "";
    } else if (depth > 0) {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function convertValue(raw, column) {
  if (raw === "NULL") return null;
  const isQuoted = raw.startsWith("'") || raw.startsWith('"');
  const value = isQuoted ? raw.slice(1, -1) : raw;
  if (DATE_COLUMNS.has(column)) {
    const iso = value.replace(" ", "T") + (value.length === 10 ? "T00:00:00Z" : "Z");
    const date = new Date(iso.replace("TT", "T"));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (BOOL_COLUMNS.has(column)) return value === "1" || value === "true";
  if (NUMBER_COLUMNS.has(column)) {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? 0 : numeric;
  }
  return value;
}

function parseDump(sql) {
  const tables = new Map();
  const insertRe =
    /INSERT\s+INTO\s+`([^`]+)`\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?);\s*(?=\n|$)/g;
  let match;
  while ((match = insertRe.exec(sql)) !== null) {
    const table = match[1];
    const columns = match[2].split(",").map((c) => c.trim().replace(/^`|`$/g, ""));
    if (!tables.has(table)) tables.set(table, []);
    for (const row of splitRows(match[3])) {
      const values = splitValues(row);
      if (values.length !== columns.length) {
        throw new Error(
          `Column/value mismatch in ${table}: ${columns.length} columns, ${values.length} values`,
        );
      }
      const doc = {};
      columns.forEach((column, index) => {
        doc[column === "id" ? "_id" : column] = convertValue(values[index], column);
      });
      // The legacy dump omits columns that had SQL DEFAULT values. MongoDB has no
      // defaults for directly inserted documents, so supply the same values here.
      for (const [column, fallback] of Object.entries(LEGACY_DEFAULTS[table] ?? {})) {
        if (!(column in doc)) {
          doc[column] = typeof fallback === "function" ? fallback() : fallback;
        }
      }
      tables.get(table).push(doc);
    }
  }
  return tables;
}

const sql = await readFile(DUMP, "utf8");
const tables = parseDump(sql);

if (process.argv.includes("--dry-run")) {
  for (const [name, docs] of tables) {
    console.log(`${name.padEnd(18)} ${String(docs.length).padStart(4)} rows`);
    if (process.argv.includes("--sample") && docs.length) {
      console.log("   ", JSON.stringify(docs[0], null, 2).replace(/\n/g, "\n    "));
    }
  }
  console.log(`Total: ${[...tables.values()].reduce((n, docs) => n + docs.length, 0)} documents`);
  process.exit(0);
}

const client = new MongoClient(url);

try {
  await client.connect();
  const db = client.db();
  console.log(`Connected to ${db.databaseName}`);

  const collections = [...tables.keys()];
  if (REPLACE) {
    for (const name of collections) {
      await db.collection(name).deleteMany({});
    }
    await db.collection("sequences").deleteMany({});
    console.log("Existing Tangoline rows deleted (--replace).");
  }

  let total = 0;
  for (const [name, docs] of tables) {
    const collection = db.collection(name);
    if (docs.length) {
      await collection.bulkWrite(
        docs.map((doc) => ({
          replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
        })),
        { ordered: true },
      );
    }
    const importedMaxId = docs.reduce((max, doc) => Math.max(max, doc._id ?? 0), 0);
    const lastRow = await collection.findOne({}, { sort: { _id: -1 }, projection: { _id: 1 } });
    const maxId = Math.max(importedMaxId, Number(lastRow?._id ?? 0));
    await db.collection("sequences").updateOne(
      { _id: name },
      { $set: { value: maxId } },
      { upsert: true },
    );
    total += docs.length;
    console.log(`  ${name.padEnd(18)} ${String(docs.length).padStart(4)} rows (next id ${maxId + 1})`);
  }
  console.log(`Imported ${total} documents across ${collections.length} collections.`);
} finally {
  await client.close();
}
