// Safe, idempotent production migration: applies db/schema.sql only
// (CREATE ... IF NOT EXISTS — never drops or overwrites data), then verifies
// every expected table exists. Does NOT seed (seeding would overwrite admin edits).
// Run on the server:  npm run migrate   (uses DATABASE_URL from the environment)
import "dotenv/config";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

let mode = (process.env.DB_SSL || "").toLowerCase();
if (!mode) mode = /sslmode=([a-z-]+)/i.exec(url)?.[1]?.toLowerCase() || "";
if (!mode) mode = process.env.NODE_ENV === "production" ? "verify" : "disable";
const ssl =
  mode === "disable" || mode === "false" || mode === "off"
    ? false
    : mode === "require" || mode === "prefer" || mode === "no-verify"
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: true, ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") } : {}) };

const client = new pg.Client({
  connectionString: url.replace(/([?&])sslmode=[^&]*&?/i, "$1").replace(/[?&]$/, ""),
  ssl,
  connectionTimeoutMillis: 10_000,
});

const EXPECTED = [
  "tour_packages", "services", "contact_info", "enquiries", "hero_slides",
  "destinations", "testimonials", "gallery", "faqs", "categories", "site_settings",
  "curated_themes",
];

try {
  await client.connect();
  const { rows: [info] } = await client.query("select current_database() db, current_user usr");
  console.log(`connected: database=${info.db} user=${info.usr} ssl=${mode}`);
  await client.query(fs.readFileSync(path.join(dir, "schema.sql"), "utf8"));
  console.log("schema applied (idempotent)");
  const { rows } = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public'",
  );
  const have = new Set(rows.map((r) => r.table_name));
  const missing = EXPECTED.filter((t) => !have.has(t));
  for (const t of EXPECTED.filter((t) => have.has(t))) {
    const { rows: [c] } = await client.query(`select count(*)::int n from ${t}`);
    console.log(`  ${t}: ${c.n} rows`);
  }
  // Seed initial curated themes if table is empty
  const { rows: [themeCount] } = await client.query("select count(*)::int n from curated_themes");
  if (themeCount.n === 0) {
    const initialThemes = [
      { title: "Mountains & the North", tag: "Alpine Serenity", blurb: "Himalayan valleys, high passes, and pristine alpine calm.", href: "/group-tours/domestic", image_url: "/themes/theme-mountains.jpg", scope: "domestic", sort_order: 10 },
      { title: "Beaches & Islands", tag: "Coastal Bliss", blurb: "Sun, turquoise waters, and slow tropical island mornings.", href: "/packages", image_url: "/themes/theme-beaches.jpg", scope: "international", sort_order: 20 },
      { title: "Heritage & Pilgrimage", tag: "Sacred & Timeless", blurb: "Timeless monuments, grand architecture, and journeys of the spirit.", href: "/group-tours/domestic", image_url: "/themes/theme-heritage.jpg", scope: "domestic", sort_order: 30 },
      { title: "International Escapes", tag: "Global Horizons", blurb: "Iconic world cities, skylines, and horizons beyond India.", href: "/group-tours/international", image_url: "/themes/theme-international.jpg", scope: "international", sort_order: 40 },
    ];
    for (const t of initialThemes) {
      await client.query(
        "insert into curated_themes (title, tag, blurb, href, image_url, scope, sort_order) values ($1, $2, $3, $4, $5, $6, $7)",
        [t.title, t.tag, t.blurb, t.href, t.image_url, t.scope, t.sort_order],
      );
    }
    console.log("  curated_themes seeded: 4 initial themes");
  }
  if (missing.length) {
    console.error("missing tables:", missing.join(", "));
    process.exitCode = 1;
  } else console.log("all tables present");
} catch (err) {
  console.error("migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
