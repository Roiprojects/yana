var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  AuthConfigError: () => AuthConfigError,
  SESSION_COOKIE: () => SESSION_COOKIE,
  clearSessionCookie: () => clearSessionCookie,
  createSessionToken: () => createSessionToken,
  readCookie: () => readCookie,
  requireAdmin: () => requireAdmin,
  setSessionCookie: () => setSessionCookie,
  verifyCredentials: () => verifyCredentials,
  verifySessionToken: () => verifySessionToken
});
import crypto from "node:crypto";
function authEnv(name, fallbackDefault) {
  const v = clean(process.env[name]);
  if (v) return v;
  return fallbackDefault;
}
function hmac(data) {
  const secret = authEnv(
    "AUTH_SECRET",
    "yana_admin_production_auth_secret_stable_key_2026_yana_travels_min_32_chars"
  );
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
function verifyCredentials(email, password) {
  const e = authEnv("ADMIN_EMAIL", "admin@yanatravels.com");
  const p = authEnv("ADMIN_PASSWORD", "admin123");
  if (!email || !password) return false;
  return safeEqual(email.trim().toLowerCase(), e.trim().toLowerCase()) && safeEqual(password, p);
}
async function createSessionToken(email) {
  const payload = Buffer.from(
    JSON.stringify({ sub: email.trim().toLowerCase(), exp: Date.now() + MAX_AGE_SECONDS * 1e3 })
  ).toString("base64url");
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}
async function verifySessionToken(token) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  let expected;
  try {
    expected = hmac(payload);
  } catch {
    return null;
  }
  if (!safeEqual(sig, expected)) return null;
  try {
    const json = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    if (!json.exp || json.exp < Date.now()) return null;
    return json.sub ?? null;
  } catch {
    return null;
  }
}
function readCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return void 0;
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return void 0;
}
function setSessionCookie(req, res, token) {
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
    path: "/",
    maxAge: MAX_AGE_SECONDS * 1e3
  });
}
function clearSessionCookie(res) {
  const isHttps = process.env.NODE_ENV === "production";
  res.clearCookie(SESSION_COOKIE, {
    path: "/",
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps
  });
}
async function requireAdmin(req, res, next) {
  const cookieToken = readCookie(req, SESSION_COOKIE);
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : void 0;
  const token = cookieToken || bearerToken;
  const email = await verifySessionToken(token);
  if (!email) {
    res.status(401).json({ ok: false, error: "Not authorised." });
    return;
  }
  res.locals.adminEmail = email;
  next();
}
var SESSION_COOKIE, MAX_AGE_SECONDS, clean, AuthConfigError;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    SESSION_COOKIE = "yana_admin";
    MAX_AGE_SECONDS = 60 * 60 * 8;
    clean = (v) => (v ?? "").trim().replace(/^["']|["']$/g, "");
    AuthConfigError = class extends Error {
      constructor(missing) {
        super(`Auth configuration missing: ${missing}`);
        this.name = "AuthConfigError";
      }
    };
  }
});

// server/index.ts
import dotenv2 from "dotenv";
import express from "express";
import cors from "cors";
import path2 from "node:path";
import fs from "node:fs/promises";
import { existsSync as existsSync2 } from "node:fs";
import multer from "multer";
import { fileURLToPath } from "node:url";

// src/lib/schemas/enquiry.ts
import { z } from "zod";
var baseEnquirySchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(7, "Please enter a valid phone number").max(20, "Phone number looks too long"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  // Empty optional number: treat "" as undefined so an empty field stays valid.
  travellers: z.preprocess(
    (v) => v === "" || v === null || v === void 0 ? void 0 : v,
    z.coerce.number().int().min(1, "At least 1 traveller").max(100).optional()
  ),
  travelDate: z.string().optional(),
  message: z.string().max(2e3).optional()
});
var generalEnquirySchema = baseEnquirySchema.extend({
  type: z.literal("general").default("general"),
  destinationInterest: z.string().optional()
});
var customizedEnquirySchema = baseEnquirySchema.extend({
  type: z.literal("customized").default("customized"),
  scope: z.enum(["domestic", "international"]).optional(),
  budgetRange: z.string().optional(),
  hotelCategory: z.string().optional()
});
var enquiryFormSchema = baseEnquirySchema.extend({
  type: z.enum(["general", "customized"]).default("general"),
  destinationInterest: z.string().optional(),
  scope: z.enum(["domestic", "international"]).optional(),
  budgetRange: z.string().optional(),
  hotelCategory: z.string().optional()
});

// server/index.ts
init_auth();

// server/db.ts
import dotenv from "dotenv";
import path from "node:path";
import { existsSync } from "node:fs";
import { Pool } from "pg";

// server/logger.ts
function emit(level, event, fields = {}) {
  const line = JSON.stringify({ ts: (/* @__PURE__ */ new Date()).toISOString(), level, event, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
var log = {
  info: (event, fields) => emit("info", event, fields),
  warn: (event, fields) => emit("warn", event, fields),
  error: (event, fields) => emit("error", event, fields)
};

// server/db.ts
for (const p of [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.hosting"),
  path.resolve(process.cwd(), ".env.production"),
  path.resolve(process.cwd(), "..", ".env")
]) {
  if (existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();
var DatabaseUnavailableError = class extends Error {
  constructor(message = "Database unavailable") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
};
function sslConfig(url = "") {
  let mode = (process.env.DB_SSL || process.env.PGSSL || "").toLowerCase();
  if (!mode) {
    const m = /[?&]sslmode=([a-z-]+)/i.exec(url);
    if (m) mode = m[1].toLowerCase();
  }
  const isLoopback = url.includes("127.0.0.1") || url.includes("localhost") || !url && (process.env.DB_HOST === "127.0.0.1" || process.env.DB_HOST === "localhost" || !process.env.DB_HOST);
  if (!mode) {
    mode = isLoopback ? "disable" : process.env.NODE_ENV === "production" ? "prefer" : "disable";
  }
  if (mode === "disable" || mode === "false" || mode === "off") return false;
  if (mode === "require" || mode === "prefer" || mode === "no-verify") {
    return { rejectUnauthorized: false };
  }
  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, "\n");
  return ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: false };
}
function stripSslParams(url) {
  return url.replace(/([?&])sslmode=[^&]*&?/i, "$1").replace(/([?&])ssl=[^&]*&?/i, "$1").replace(/[?&]$/, "");
}
function createPool() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRESQL_URL;
  let poolConfig;
  if (connectionString) {
    let finalUrl = connectionString;
    const hostOverride = process.env.DB_HOST_OVERRIDE || process.env.DB_HOST;
    if (hostOverride === "localhost" || hostOverride === "127.0.0.1") {
      finalUrl = finalUrl.replace(/@([^:/]+)(:\d+)?\//, `@${hostOverride}$2/`);
    }
    poolConfig = {
      connectionString: stripSslParams(finalUrl),
      ssl: sslConfig(finalUrl),
      max: parseInt(process.env.DB_POOL_MAX || "20", 10),
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 1e4
    };
  } else {
    const host = process.env.DB_HOST || process.env.PGHOST || "127.0.0.1";
    const database = process.env.DB_NAME || process.env.PGDATABASE || "yanat710";
    const user = process.env.DB_USER || process.env.PGUSER || "yanat710";
    const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || "5UwsNVK0RI0DGVsC4BOmR9cLP";
    const port = parseInt(process.env.DB_PORT || process.env.PGPORT || "5432", 10);
    poolConfig = {
      host,
      port,
      database,
      user,
      password,
      ssl: sslConfig(),
      max: parseInt(process.env.DB_POOL_MAX || "20", 10),
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 1e4
    };
  }
  const p = new Pool(poolConfig);
  p.on("error", (err) => {
    log.error("db.pool_error", { category: "database", message: err.message });
  });
  return p;
}
var pool = globalThis.__pgPoolInstance ?? createPool();
if (process.env.NODE_ENV !== "production" && pool) {
  globalThis.__pgPoolInstance = pool;
}
function hasDb() {
  return Boolean(
    process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRESQL_URL || process.env.DB_NAME && process.env.DB_USER || pool
  );
}
async function query(text, params = []) {
  if (!pool) return null;
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (err) {
    log.error("db.query_failed", { category: "database", message: err.message });
    return null;
  }
}
async function queryStrict(text, params = []) {
  if (!pool) throw new DatabaseUnavailableError("Database is not configured");
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (err) {
    const e = err;
    if (!e.code || /^(08|57P|53)/.test(e.code) || /ECONN|ETIMEDOUT|ENOTFOUND|timeout/i.test(e.message)) {
      throw new DatabaseUnavailableError(e.message);
    }
    throw err;
  }
}
async function testDatabaseConnection() {
  if (!pool) return { success: false, error: "not_configured" };
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT current_database() as database, now() as server_time, version();"
      );
      const row = res.rows[0];
      return {
        success: true,
        database: row.database,
        serverTime: row.server_time,
        version: row.version,
        latencyMs: Date.now() - start
      };
    } finally {
      client.release();
    }
  } catch (err) {
    log.error("db.ping_failed", { category: "database", message: err.message });
    return {
      success: false,
      error: err.message
    };
  }
}
async function pingDb() {
  const test = await testDatabaseConnection();
  return { ok: test.success, latencyMs: test.latencyMs, error: test.error };
}
async function closeDb() {
  if (pool) {
    await pool.end().catch(() => {
    });
    globalThis.__pgPoolInstance = void 0;
  }
}

// server/packages.ts
import { createRequire } from "node:module";
var require2 = createRequire(import.meta.url);
var generatedRaw = require2("../src/lib/data/packages.generated.json");
function num(v) {
  if (v === null) return null;
  return typeof v === "number" ? v : Number(v);
}
var curatedPackageImages = /* @__PURE__ */ new Set([
  "andaman-family-4n5d",
  "best-of-europe-12n13d",
  "england-europe-15n16d",
  "bali-6n7d",
  "china-8n9d",
  "nepal-muktinath-7n8d",
  "singapore-malaysia-6n7d",
  "singapore-malaysia-thailand-10n11d",
  "sri-lanka-ramayana-6n7d",
  "chardham-helicopter-5n6d",
  "leh-ladakh-kargil-6n7d",
  "odisha-3n4d",
  "kerala-backwaters-munnar-5n6d",
  "kashmir-paradise-5n6d",
  "royal-rajasthan-forts-6n7d",
  "south-india-temple-heritage-5n6d",
  "himachal-shimla-manali-5n6d",
  "vietnam-5n6d"
]);
function packageImage(slug, fallback) {
  return curatedPackageImages.has(slug) ? `/packages/${slug}.jpg` : fallback;
}
function dbRowToListItem(r) {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    scope: r.scope,
    tour_type: r.tour_type,
    duration_days: r.duration_days,
    duration_nights: r.duration_nights,
    price_amount: num(r.price_amount),
    price_currency: r.price_currency,
    hero_image_url: packageImage(r.slug, r.hero_image_url),
    overview: r.overview,
    category_name: r.category_name,
    destination_name: r.destination_name
  };
}
async function listPackages(filters = {}) {
  const where = [
    "status = 'published'",
    "is_active = true",
    "review_status = 'verified'"
  ];
  const params = [];
  if (filters.scope) {
    params.push(filters.scope);
    where.push(`scope = $${params.length}`);
  }
  if (filters.tourType) {
    params.push(filters.tourType);
    where.push(`tour_type = $${params.length}`);
  }
  if (filters.groupSubtype) {
    params.push(filters.groupSubtype);
    where.push(`group_subtype = $${params.length}`);
  }
  if (filters.featured) where.push("is_featured = true");
  const rows = await query(
    `select id, title, slug, scope, tour_type, duration_days, duration_nights,
            price_amount, price_currency, hero_image_url, overview,
            category_name, destination_name
       from tour_packages
      where ${where.join(" and ")}
      order by sort_order asc`,
    params
  );
  if (rows) {
    return { items: rows.map(dbRowToListItem), sample: false };
  }
  return { items: [], sample: false };
}
async function getPackageBySlug(slug) {
  const rows = await query(
    `select id, title, slug, scope, tour_type, group_subtype, category_name,
            destination_name, country, duration_days, duration_nights, overview,
            highlights, itinerary, inclusions, exclusions, price_amount,
            price_currency, taxes_info, hero_image_url, is_featured,
            source_pdf, source_pages
       from tour_packages
      where slug = $1 and status = 'published' and is_active = true
        and review_status = 'verified'
      limit 1`,
    [slug]
  );
  const r = rows?.[0];
  if (r) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      category_id: null,
      destination_id: null,
      scope: r.scope,
      tour_type: r.tour_type,
      group_subtype: r.group_subtype,
      duration_days: r.duration_days,
      duration_nights: r.duration_nights,
      overview: r.overview,
      highlights: r.highlights ?? [],
      accommodation: null,
      meals_info: null,
      transport_info: null,
      inclusions: r.inclusions ?? [],
      exclusions: r.exclusions ?? [],
      price_amount: num(r.price_amount),
      price_currency: r.price_currency,
      taxes_info: r.taxes_info,
      pickup_location: null,
      drop_location: null,
      documents_required: null,
      visa_info: null,
      cancellation_policy: null,
      terms: null,
      hero_image_url: packageImage(r.slug, r.hero_image_url),
      is_featured: r.is_featured,
      source_pdf: r.source_pdf,
      source_pages: r.source_pages,
      review_status: "verified",
      status: "published",
      is_active: true,
      sort_order: 0,
      created_at: now,
      updated_at: now,
      category_name: r.category_name,
      destination_name: r.destination_name,
      itinerary: r.itinerary ?? []
    };
  }
  return null;
}

// server/admin.ts
async function listEnquiries(status) {
  const params = [];
  let where = "";
  if (status && ["new", "contacted", "closed"].includes(status)) {
    params.push(status);
    where = `where status = $1`;
  }
  const rows = await queryStrict(
    `select id, type, name, phone, email, destination_interest, travellers,
            travel_date, budget_range, hotel_category, scope, message, status,
            source, created_at
       from enquiries ${where}
      order by created_at desc
      limit 200`,
    params
  );
  return rows ?? [];
}
async function enquiryCounts() {
  const rows = await queryStrict(
    `select status, count(*)::int n from enquiries group by status`
  );
  const c = { total: 0, new: 0, contacted: 0, closed: 0 };
  for (const r of rows ?? []) {
    const n = Number(r.n);
    c.total += n;
    if (r.status === "new") c.new = n;
    else if (r.status === "contacted") c.contacted = n;
    else if (r.status === "closed") c.closed = n;
  }
  return c;
}
async function setEnquiryStatus(id, status) {
  if (!["new", "contacted", "closed"].includes(status)) return { ok: false };
  const rows = await queryStrict(
    `update enquiries set status = $1 where id = $2 returning id`,
    [status, id]
  );
  return { ok: Boolean(rows && rows.length > 0) };
}
async function listAdminPackages() {
  const rows = await queryStrict(
    `select id, title, slug, scope, tour_type, price_amount, is_active,
            is_featured, status, sort_order
       from tour_packages
      order by sort_order asc`
  );
  return rows ?? [];
}
async function getEditablePackage(id) {
  const rows = await queryStrict(
    `select id, title, slug, scope, tour_type, category_name, theme_name, destination_name,
            country, duration_days, duration_nights, overview, highlights,
            inclusions, exclusions, price_amount, taxes_info, hero_image_url,
            source_pdf, is_featured, is_active, status
       from tour_packages where id = $1 limit 1`,
    [id]
  );
  return rows?.[0] ?? null;
}
async function packageCounts() {
  const rows = await queryStrict(
    `select count(*)::int total,
            count(*) filter (where status='published' and is_active)::int published,
            count(*) filter (where is_featured)::int featured
       from tour_packages`
  );
  const r = rows?.[0];
  return {
    total: Number(r?.total ?? 0),
    published: Number(r?.published ?? 0),
    featured: Number(r?.featured ?? 0)
  };
}
async function togglePackageActive(id, active) {
  const rows = await queryStrict(
    `update tour_packages set is_active = $1, updated_at = now() where id = $2 returning id`,
    [active, id]
  );
  return { ok: Boolean(rows && rows.length > 0) };
}
async function togglePackageFeatured(id, featured) {
  const rows = await queryStrict(
    `update tour_packages set is_featured = $1, updated_at = now() where id = $2 returning id`,
    [featured, id]
  );
  return { ok: Boolean(rows && rows.length > 0) };
}
async function savePackage(id, raw) {
  const v = raw;
  const slug = (v.slug ?? "").toLowerCase().trim();
  const scope = v.scope === "domestic" ? "domestic" : "international";
  const tour_type = v.tour_type === "group" ? "group" : "customized";
  const status = v.status === "draft" ? "draft" : "published";
  const clash = await queryStrict(
    `select id from tour_packages where slug = $1 and ($2::uuid is null or id <> $2)`,
    [slug, id]
  );
  if (clash && clash.length > 0) {
    return {
      ok: false,
      error: "That slug is already in use.",
      fieldErrors: { slug: "Already in use" }
    };
  }
  const params = [
    v.title,
    slug,
    scope,
    tour_type,
    v.category_name || null,
    v.theme_name || null,
    v.destination_name || null,
    v.country || null,
    v.duration_days ?? null,
    v.duration_nights ?? null,
    v.overview || null,
    JSON.stringify(v.highlights ?? []),
    JSON.stringify(v.inclusions ?? []),
    JSON.stringify(v.exclusions ?? []),
    v.price_amount ?? null,
    v.taxes_info || null,
    v.hero_image_url || null,
    v.source_pdf || null,
    v.is_featured === true,
    v.is_active !== false,
    status,
    JSON.stringify(v.itinerary ?? [])
  ];
  if (id) {
    const rows = await queryStrict(
      `update tour_packages set
         title=$1, slug=$2, scope=$3, tour_type=$4, category_name=$5, theme_name=$6,
         destination_name=$7, country=$8, duration_days=$9, duration_nights=$10,
         overview=$11, highlights=$12::jsonb, inclusions=$13::jsonb,
         exclusions=$14::jsonb, price_amount=$15, taxes_info=$16,
         hero_image_url=$17, source_pdf=$18, is_featured=$19, is_active=$20, status=$21,
         itinerary=$22::jsonb,
         updated_at=now()
       where id=$23 returning id`,
      [...params, id]
    );
    if (!rows || rows.length === 0)
      return { ok: false, error: "Package not found." };
  } else {
    const rows = await queryStrict(
      `insert into tour_packages
        (title, slug, scope, tour_type, category_name, theme_name, destination_name, country,
         duration_days, duration_nights, overview, highlights, inclusions, exclusions,
         price_amount, taxes_info, hero_image_url, source_pdf, is_featured, is_active, status,
         itinerary, review_status, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,
         $15,$16,$17,$18,$19,$20,$21,$22::jsonb,'verified',
         (select coalesce(max(sort_order),0)+10 from tour_packages))
       returning id`,
      params
    );
    if (!rows || rows.length === 0)
      return { ok: false, error: "Could not create package." };
  }
  return { ok: true, slug };
}
async function deletePackage(id) {
  const rows = await queryStrict(
    `delete from tour_packages where id = $1 returning id`,
    [id]
  );
  return Boolean(rows && rows.length > 0);
}
async function listAdminDestinations() {
  const rows = await queryStrict(
    `select id, name, slug, scope, country, description, image_url, is_featured, is_active, sort_order
       from destinations
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listAdminServices() {
  const rows = await queryStrict(
    `select id, name, slug, description, is_active, sort_order
       from services
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listAdminTestimonials() {
  const rows = await queryStrict(
    `select id, customer_name, location, photo_url, rating, review, is_active, sort_order
       from testimonials
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listAdminGallery() {
  const rows = await queryStrict(
    `select id, title, category, image_url, is_active, sort_order
       from gallery
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listAdminFaqs() {
  const rows = await queryStrict(
    `select id, question, answer, category, is_active, sort_order
       from faqs
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listAdminOffices() {
  const rows = await queryStrict(
    `select id, office_name, address, city, pincode, phone, email, hours, is_active, sort_order
       from contact_info
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listAdminHeroSlides() {
  const rows = await queryStrict(
    `select id, title, subtitle, image_url, video_url, mobile_video_url, cta_primary_text, cta_primary_link, is_active, sort_order
       from hero_slides
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listAdminThemes() {
  const rows = await queryStrict(
    `select id, title, tag, blurb, href, image_url, scope, is_active, sort_order
       from curated_themes
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listPublicThemes() {
  const rows = await queryStrict(
    `select id, title, tag, blurb, href, image_url, scope, is_active, sort_order
       from curated_themes
      where is_active = true
      order by sort_order asc`
  );
  return rows ?? [];
}
async function saveThemeAction(body) {
  const id = str(body.id) || null;
  const title = str(body.title);
  const tag = str(body.tag);
  const blurb = str(body.blurb);
  const href = str(body.href) || "/packages";
  const image_url = str(body.image_url);
  const scope = str(body.scope) || "all";
  if (id) {
    await queryStrict(
      `update curated_themes set title=$1, tag=$2, blurb=$3, href=$4, image_url=$5, scope=$6 where id=$7`,
      [title, tag, blurb, href, image_url, scope, id]
    );
  } else {
    await queryStrict(
      `insert into curated_themes (title, tag, blurb, href, image_url, scope) values ($1, $2, $3, $4, $5, $6)`,
      [title, tag, blurb, href, image_url, scope]
    );
  }
  return { ok: true };
}
async function listPublicDestinations() {
  const rows = await queryStrict(
    `select id, name, slug, scope, country, description, image_url, is_featured, is_active, sort_order
       from destinations
      where is_active = true
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listPublicTestimonials() {
  const rows = await queryStrict(
    `select id, customer_name, location, photo_url, rating, review, is_active, sort_order
       from testimonials
      where is_active = true
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listPublicFaqs() {
  const rows = await queryStrict(
    `select id, question, answer, category, is_active, sort_order
       from faqs
      where is_active = true
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listPublicServices() {
  const rows = await queryStrict(
    `select id, name, slug, description, is_active, sort_order
       from services
      where is_active = true
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listPublicGallery() {
  const rows = await queryStrict(
    `select id, title, category, image_url, is_active, sort_order
       from gallery
      where is_active = true
      order by sort_order asc`
  );
  return rows ?? [];
}
async function listPublicOffices() {
  const rows = await queryStrict(
    `select id, office_name, address, city, pincode, phone, email, hours, is_active, sort_order
       from contact_info
      order by sort_order asc`
  );
  return rows ?? [];
}
var SETTING_KEYS = ["site", "about", "seo"];
async function listSiteSettings() {
  const rows = await queryStrict(
    `select key, value from site_settings`
  );
  const out = {};
  for (const r of rows ?? []) out[r.key] = r.value;
  return out;
}
async function saveSiteSetting(key, value) {
  if (!SETTING_KEYS.includes(key)) return { ok: false };
  await queryStrict(
    `insert into site_settings (key, value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (key) do update
       set value = excluded.value, updated_at = now()`,
    [key, JSON.stringify(value ?? {})]
  );
  return { ok: true };
}
var ALLOWED_TABLES = [
  "tour_packages",
  "destinations",
  "services",
  "testimonials",
  "gallery",
  "faqs",
  "contact_info",
  "hero_slides",
  "curated_themes"
];
function assertTable(table) {
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error("Invalid table");
  }
}
async function toggleItemActive(table, id, currentStatus) {
  assertTable(table);
  await queryStrict(`update ${table} set is_active = $1 where id = $2`, [
    !currentStatus,
    id
  ]);
  return { ok: true };
}
async function deleteItem(table, id) {
  assertTable(table);
  await queryStrict(`delete from ${table} where id = $1`, [id]);
  return { ok: true };
}
function str(v) {
  return typeof v === "string" ? v.trim() : "";
}
function bool(v) {
  return v === "on" || v === true;
}
async function saveDestinationAction(body) {
  const id = str(body.id) || null;
  const name = str(body.name);
  const slug = str(body.slug) || slugify(name);
  const scope = str(body.scope) || "international";
  const country = str(body.country);
  const description = str(body.description);
  const image_url = str(body.image_url);
  const is_featured = bool(body.is_featured);
  if (id) {
    await queryStrict(
      `update destinations set name=$1, slug=$2, scope=$3, country=$4, description=$5, image_url=$6, is_featured=$7 where id=$8`,
      [name, slug, scope, country, description, image_url, is_featured, id]
    );
  } else {
    await queryStrict(
      `insert into destinations (name, slug, scope, country, description, image_url, is_featured) values ($1, $2, $3, $4, $5, $6, $7)`,
      [name, slug, scope, country, description, image_url, is_featured]
    );
  }
  return { ok: true };
}
async function saveServiceAction(body) {
  const id = str(body.id) || null;
  const name = str(body.name);
  const slug = str(body.slug) || slugify(name);
  const description = str(body.description);
  if (id) {
    await queryStrict(
      `update services set name=$1, slug=$2, description=$3 where id=$4`,
      [name, slug, description, id]
    );
  } else {
    await queryStrict(
      `insert into services (name, slug, description) values ($1, $2, $3)`,
      [name, slug, description]
    );
  }
  return { ok: true };
}
async function saveTestimonialAction(body) {
  const id = str(body.id) || null;
  const customer_name = str(body.customer_name);
  const location = str(body.location);
  const review = str(body.review);
  const rating = Number(body.rating ?? 5);
  const photo_url = str(body.photo_url);
  if (id) {
    await queryStrict(
      `update testimonials set customer_name=$1, location=$2, review=$3, rating=$4, photo_url=$5 where id=$6`,
      [customer_name, location, review, rating, photo_url, id]
    );
  } else {
    await queryStrict(
      `insert into testimonials (customer_name, location, review, rating, photo_url) values ($1, $2, $3, $4, $5)`,
      [customer_name, location, review, rating, photo_url]
    );
  }
  return { ok: true };
}
async function saveFaqAction(body) {
  const id = str(body.id) || null;
  const question = str(body.question);
  const answer = str(body.answer);
  const category = str(body.category) || "General";
  if (id) {
    await queryStrict(
      `update faqs set question=$1, answer=$2, category=$3 where id=$4`,
      [question, answer, category, id]
    );
  } else {
    await queryStrict(
      `insert into faqs (question, answer, category) values ($1, $2, $3)`,
      [question, answer, category]
    );
  }
  return { ok: true };
}
async function saveOfficeAction(body) {
  const id = str(body.id) || null;
  const office_name = str(body.office_name);
  const address = str(body.address);
  const city = str(body.city);
  const pincode = str(body.pincode);
  const phone = str(body.phone);
  const email = str(body.email);
  if (id) {
    await queryStrict(
      `update contact_info set office_name=$1, address=$2, city=$3, pincode=$4, phone=$5, email=$6 where id=$7`,
      [office_name, address, city, pincode, phone, email, id]
    );
  } else {
    await queryStrict(
      `insert into contact_info (office_name, address, city, pincode, phone, email) values ($1, $2, $3, $4, $5, $6)`,
      [office_name, address, city, pincode, phone, email]
    );
  }
  return { ok: true };
}
async function saveGalleryAction(body) {
  const id = str(body.id) || null;
  const title = str(body.title);
  const category = str(body.category) || "General";
  const image_url = str(body.image_url);
  if (id) {
    await queryStrict(
      `update gallery set title=$1, category=$2, image_url=$3 where id=$4`,
      [title, category, image_url, id]
    );
  } else {
    await queryStrict(
      `insert into gallery (title, category, image_url) values ($1, $2, $3)`,
      [title, category, image_url]
    );
  }
  return { ok: true };
}
async function saveHeroSlideAction(body) {
  const id = str(body.id) || null;
  const title = str(body.title);
  const subtitle = str(body.subtitle);
  const image_url = str(body.image_url);
  const video_url = str(body.video_url);
  const mobile_video_url = str(body.mobile_video_url);
  const cta_primary_text = str(body.cta_primary_text) || "Explore packages";
  const cta_primary_link = str(body.cta_primary_link) || "/packages";
  if (id) {
    await queryStrict(
      `update hero_slides set title=$1, subtitle=$2, image_url=$3, video_url=$4, mobile_video_url=$5, cta_primary_text=$6, cta_primary_link=$7 where id=$8`,
      [title, subtitle, image_url, video_url, mobile_video_url, cta_primary_text, cta_primary_link, id]
    );
  } else {
    await queryStrict(
      `insert into hero_slides (title, subtitle, image_url, video_url, mobile_video_url, cta_primary_text, cta_primary_link) values ($1, $2, $3, $4, $5, $6, $7)`,
      [title, subtitle, image_url, video_url, mobile_video_url, cta_primary_text, cta_primary_link]
    );
  }
  return { ok: true };
}
function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// server/index.ts
import crypto2 from "node:crypto";
var __dirname = path2.dirname(fileURLToPath(import.meta.url));
for (const p of [
  path2.resolve(process.cwd(), ".env"),
  path2.resolve(process.cwd(), ".env.hosting"),
  path2.resolve(process.cwd(), ".env.production"),
  path2.resolve(__dirname, "..", ".env"),
  path2.resolve(__dirname, "..", ".env.hosting"),
  path2.resolve(__dirname, ".env")
]) {
  if (existsSync2(p)) {
    dotenv2.config({ path: p });
    break;
  }
}
dotenv2.config();
var app = express();
var IS_PROD = process.env.NODE_ENV === "production";
var hasDbConfig = Boolean(
  process.env.DATABASE_URL || process.env.DB_NAME && process.env.DB_USER || hasDb()
);
var missingEnv = [];
if (!hasDbConfig) missingEnv.push("DATABASE_URL");
if (missingEnv.length) {
  log[IS_PROD ? "error" : "warn"]("config.missing_env", { category: "config", missing: missingEnv });
}
var trustProxy = process.env.TRUST_PROXY ?? "1";
app.set("trust proxy", /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
app.disable("x-powered-by");
app.use((req, res, next) => {
  const id = req.headers["x-request-id"] || crypto2.randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
function isAllowedOrigin(origin) {
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    const h = hostname.toLowerCase();
    if (h === "yanaindia.com" || h.endsWith(".yanaindia.com")) return true;
    if (h === "roiclients.co.in" || h.endsWith(".roiclients.co.in")) return true;
    if (h === "localhost" || h === "127.0.0.1" || h.startsWith("192.168.")) return true;
    if (process.env.ALLOWED_ORIGINS) {
      const extra = process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim().toLowerCase());
      if (extra.includes(origin.toLowerCase()) || extra.includes(h)) return true;
    }
  } catch {
    return false;
  }
  return false;
}
app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use((req, _res, next) => {
  if (!req.url.startsWith("/api/") && (req.url.startsWith("/auth/") || req.url.startsWith("/packages") || req.url.startsWith("/admin/") || req.url.startsWith("/enquiries") || req.url.startsWith("/site-settings") || req.url.startsWith("/testimonials") || req.url.startsWith("/destinations") || req.url.startsWith("/health") || req.url.startsWith("/upload"))) {
    req.url = `/api${req.url}`;
  }
  next();
});
var publicDir = path2.resolve(__dirname, "..", "public");
app.use(express.static(publicDir));
var distDir = path2.resolve(__dirname, "..", "dist");
if (existsSync2(path2.join(distDir, "index.html"))) {
  app.use(express.static(distDir));
}
var wrap = (fn) => (req, res) => {
  fn(req, res).catch((err) => {
    const e = err;
    const dbDown = e instanceof DatabaseUnavailableError;
    const cfg = e instanceof AuthConfigError;
    log.error("api.error", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.path,
      category: dbDown ? "database_unavailable" : cfg ? "config" : "unexpected",
      message: e?.message,
      stack: e?.stack
    });
    if (res.headersSent) return;
    if (cfg) {
      res.status(503).json({ ok: false, error: "Server is not fully configured. Contact the site administrator.", requestId: res.locals.requestId });
      return;
    }
    if (dbDown) {
      res.status(503).json({
        ok: false,
        error: "Database is temporarily unavailable. Please try again shortly.",
        requestId: res.locals.requestId
      });
      return;
    }
    res.status(500).json({ ok: false, error: "Internal server error.", requestId: res.locals.requestId });
  });
};
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, status: "up" });
});
app.get(
  "/api/ready",
  wrap(async (_req, res) => {
    const db = await pingDb();
    const ready = db.ok && missingEnv.length === 0;
    res.status(ready ? 200 : 503).json({
      ok: ready,
      database: db.ok ? "up" : "down",
      config: missingEnv.length === 0 ? "ok" : "incomplete"
    });
  })
);
app.get("/api/auth/login", (_req, res) => {
  res.redirect("/admin/login");
});
app.post(
  "/api/auth/login",
  wrap(async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
      res.status(400).json({ ok: false, error: "Email and password are required." });
      return;
    }
    if (!verifyCredentials(email, password)) {
      log.warn("auth.login_failed", { requestId: res.locals.requestId, category: "auth", ip: req.ip });
      res.status(401).json({ ok: false, error: "Invalid email or password." });
      return;
    }
    log.info("auth.login_success", { requestId: res.locals.requestId, category: "auth" });
    const token = await createSessionToken(email.toLowerCase());
    setSessionCookie(req, res, token);
    res.json({ ok: true, token });
  })
);
app.post("/api/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});
app.get(
  "/api/auth/me",
  wrap(async (req, res) => {
    const { SESSION_COOKIE: SESSION_COOKIE2, readCookie: readCookie2, verifySessionToken: verifySessionToken2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const cookieToken = readCookie2(req, SESSION_COOKIE2);
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : void 0;
    const email = await verifySessionToken2(cookieToken || bearerToken);
    if (!email) {
      res.status(401).json({ ok: false });
      return;
    }
    res.json({ ok: true, email });
  })
);
app.get(
  "/api/packages",
  wrap(async (req, res) => {
    const q = req.query;
    const filters = {};
    if (q.scope === "domestic" || q.scope === "international")
      filters.scope = q.scope;
    if (q.tourType === "group" || q.tourType === "customized")
      filters.tourType = q.tourType;
    if (q.groupSubtype === "standard" || q.groupSubtype === "kitchen_staff") {
      filters.groupSubtype = q.groupSubtype;
    }
    if (q.featured === "true") filters.featured = true;
    const result = await listPackages(filters);
    res.json(result);
  })
);
app.get(
  "/api/packages/:slug",
  wrap(async (req, res) => {
    const pkg = await getPackageBySlug(req.params.slug);
    if (!pkg) {
      res.status(404).json({ ok: false, error: "Package not found." });
      return;
    }
    res.json(pkg);
  })
);
app.get(
  "/api/public/services",
  wrap(async (_req, res) => {
    res.json(await listPublicServices());
  })
);
app.get(
  "/api/public/faqs",
  wrap(async (_req, res) => {
    res.json(await listPublicFaqs());
  })
);
app.get(
  "/api/public/testimonials",
  wrap(async (_req, res) => {
    res.json(await listPublicTestimonials());
  })
);
app.get(
  "/api/public/gallery",
  wrap(async (_req, res) => {
    res.json(await listPublicGallery());
  })
);
app.get(
  "/api/public/offices",
  wrap(async (_req, res) => {
    res.json(await listPublicOffices());
  })
);
app.get(
  "/api/public/destinations",
  wrap(async (_req, res) => {
    res.json(await listPublicDestinations());
  })
);
app.get(
  "/api/public/themes",
  wrap(async (_req, res) => {
    res.json(await listPublicThemes());
  })
);
app.get(
  "/api/public/settings",
  wrap(async (_req, res) => {
    res.json(await listSiteSettings());
  })
);
app.post(
  "/api/enquiries",
  wrap(async (req, res) => {
    const parsed = enquiryFormSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key])
          fieldErrors[key] = issue.message;
      }
      res.status(400).json({
        ok: false,
        error: "Please check the highlighted fields.",
        fieldErrors
      });
      return;
    }
    const v = parsed.data;
    if (!hasDb()) {
      res.status(503).json({
        ok: false,
        error: "Enquiry submission isn't available right now. Please reach us by phone or WhatsApp in the meantime."
      });
      return;
    }
    const rows = await query(
      `insert into enquiries
         (type, name, phone, email, destination_interest, travellers, travel_date,
          budget_range, hotel_category, scope, message, source)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       returning id`,
      [
        v.type,
        v.name,
        v.phone,
        v.email || null,
        v.destinationInterest || null,
        v.travellers ?? null,
        v.travelDate || null,
        v.budgetRange || null,
        v.hotelCategory || null,
        v.scope || null,
        v.message || null,
        v.type === "customized" ? "customized_enquiry" : "general_enquiry"
      ]
    );
    if (!rows) {
      res.status(503).json({
        ok: false,
        error: "We couldn't submit your enquiry right now. Please call us or try again shortly."
      });
      return;
    }
    res.json({ ok: true });
  })
);
app.get(
  "/api/admin/dashboard",
  requireAdmin,
  wrap(async (_req, res) => {
    const [enq, pkg] = await Promise.all([
      enquiryCounts(),
      packageCounts()
    ]);
    res.json({ enquiries: enq, packages: pkg });
  })
);
app.get(
  "/api/admin/packages",
  requireAdmin,
  wrap(async (_req, res) => {
    res.json({ items: await listAdminPackages() });
  })
);
app.get(
  "/api/admin/packages/:id",
  requireAdmin,
  wrap(async (req, res) => {
    const pkg = await getEditablePackage(req.params.id);
    if (!pkg) {
      res.status(404).json({ ok: false, error: "Package not found." });
      return;
    }
    res.json(pkg);
  })
);
app.post(
  "/api/admin/packages",
  requireAdmin,
  wrap(async (req, res) => {
    const id = typeof req.body?.id === "string" && req.body.id ? req.body.id : null;
    const result = await savePackage(id, req.body?.data ?? req.body);
    res.status(result.ok ? 200 : 400).json(result);
  })
);
app.post(
  "/api/admin/packages/:id/active",
  requireAdmin,
  wrap(async (req, res) => {
    const active = req.body?.active === true;
    res.json(await togglePackageActive(req.params.id, active));
  })
);
app.post(
  "/api/admin/packages/:id/featured",
  requireAdmin,
  wrap(async (req, res) => {
    const featured = req.body?.featured === true;
    res.json(await togglePackageFeatured(req.params.id, featured));
  })
);
app.delete(
  "/api/admin/packages/:id",
  requireAdmin,
  wrap(async (req, res) => {
    const ok = await deletePackage(req.params.id);
    res.status(ok ? 200 : 404).json({ ok });
  })
);
app.get(
  "/api/admin/enquiries",
  requireAdmin,
  wrap(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : void 0;
    res.json({ items: await listEnquiries(status) });
  })
);
app.post(
  "/api/admin/enquiries/:id/status",
  requireAdmin,
  wrap(async (req, res) => {
    const status = req.body?.status;
    res.json(await setEnquiryStatus(req.params.id, status));
  })
);
var MODULES = {
  destinations: {
    list: listAdminDestinations,
    save: saveDestinationAction
  },
  services: { list: listAdminServices, save: saveServiceAction },
  testimonials: {
    list: listAdminTestimonials,
    save: saveTestimonialAction
  },
  gallery: { list: listAdminGallery, save: saveGalleryAction },
  faqs: { list: listAdminFaqs, save: saveFaqAction },
  contact_info: { list: listAdminOffices, save: saveOfficeAction },
  hero_slides: {
    list: listAdminHeroSlides,
    save: saveHeroSlideAction
  },
  curated_themes: {
    list: listAdminThemes,
    save: saveThemeAction
  }
};
app.get(
  "/api/admin/:module",
  requireAdmin,
  wrap(async (req, res) => {
    const mod = MODULES[req.params.module];
    if (!mod) {
      res.status(404).json({ ok: false, error: "Unknown module." });
      return;
    }
    res.json({ items: await mod.list() });
  })
);
app.post(
  "/api/admin/:module/save",
  requireAdmin,
  wrap(async (req, res) => {
    const mod = MODULES[req.params.module];
    if (!mod) {
      res.status(404).json({ ok: false, error: "Unknown module." });
      return;
    }
    res.json(await mod.save(req.body ?? {}));
  })
);
app.post(
  "/api/admin/settings",
  requireAdmin,
  wrap(async (req, res) => {
    const result = await saveSiteSetting(req.body?.key, req.body?.value);
    res.status(result.ok ? 200 : 400).json(result);
  })
);
app.post(
  "/api/admin/:module/toggle",
  requireAdmin,
  wrap(async (req, res) => {
    assertTable(req.params.module);
    res.json(
      await toggleItemActive(
        req.params.module,
        req.body?.id,
        req.body?.active === true
      )
    );
  })
);
app.delete(
  "/api/admin/:module/:id",
  requireAdmin,
  wrap(async (req, res) => {
    assertTable(req.params.module);
    res.json(await deleteItem(req.params.module, req.params.id));
  })
);
var storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const dir = path2.join(publicDir, "uploads");
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path2.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});
var upload = multer({ storage });
app.post(
  "/api/upload",
  requireAdmin,
  upload.single("file"),
  wrap(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    res.json({ ok: true, url: `/uploads/${req.file.filename}` });
  })
);
app.use((err, _req, res, _next) => {
  const status = err?.status || err?.statusCode || 500;
  if (!res.headersSent) {
    res.status(status).json({
      ok: false,
      error: err?.message || "Internal server error."
    });
  }
});
app.use((req, res, _next) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ ok: false, error: "API route not found." });
    return;
  }
  const candidates = [
    path2.join(distDir, "index.html"),
    path2.join(publicDir, "index.html")
  ];
  for (const file of candidates) {
    if (existsSync2(file)) return res.sendFile(file);
  }
  res.status(404).send("SPA not built yet \u2014 run `npm run build` first.");
});
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || "4000";
  const server = app.listen(/^\d+$/.test(PORT) ? Number(PORT) : PORT, () => {
    log.info("server.started", {
      port: PORT,
      nodeEnv: process.env.NODE_ENV || "development",
      database: hasDb() ? "configured" : "not_configured"
    });
    void pingDb().then(
      (r) => log[r.ok ? "info" : "error"]("db.startup_check", { category: "database", ok: r.ok, latencyMs: r.latencyMs })
    );
  });
  const shutdown = (signal) => {
    log.info("server.shutdown", { signal });
    server.close(() => void closeDb().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 1e4).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on(
    "unhandledRejection",
    (r) => log.error("process.unhandled_rejection", { message: String(r?.message ?? r) })
  );
}
var index_default = app;
export {
  index_default as default
};
