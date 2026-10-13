import dotenv from "dotenv";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import multer from "multer";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Robust environment file discovery across diverse hosting setups
for (const p of [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.hosting"),
  path.resolve(process.cwd(), ".env.production"),
  path.resolve(__dirname, "..", ".env"),
  path.resolve(__dirname, "..", ".env.hosting"),
  path.resolve(__dirname, ".env"),
]) {
  if (existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();

import { enquiryFormSchema } from "../src/lib/schemas/enquiry.js";
import {
  requireAdmin,
  verifyCredentials,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  SESSION_COOKIE,
  readCookie,
  verifySessionToken,
  AuthConfigError,
} from "./auth.js";
import {
  listPackages,
  getPackageBySlug,
  type PackageFilters,
} from "./packages.js";
import * as admin from "./admin.js";
import { query, hasDb, pingDb, closeDb, DatabaseUnavailableError } from "./db.js";
import { log } from "./logger.js";
import crypto from "node:crypto";

const app = express();
const IS_PROD = process.env.NODE_ENV === "production";

// ── Startup configuration validation (names only, never values) ─────────────
const hasDbConfig = Boolean(
  process.env.DATABASE_URL ||
  (process.env.DB_NAME && process.env.DB_USER) ||
  hasDb()
);
const missingEnv: string[] = [];
if (!hasDbConfig) missingEnv.push("DATABASE_URL");
if (missingEnv.length) {
  log[IS_PROD ? "error" : "warn"]("config.missing_env", { category: "config", missing: missingEnv });
}


// Trust exactly one reverse proxy hop (cPanel Apache/Passenger or Nginx) so
// req.secure reflects HTTPS. Override with TRUST_PROXY (e.g. "loopback").
const trustProxy = process.env.TRUST_PROXY ?? "1";
app.set("trust proxy", /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
app.disable("x-powered-by");

// Request ID for log correlation.
app.use((req, res, next) => {
  const id = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

// API responses must never be cached by browsers/CDNs, so admin edits show
// up for every visitor immediately.
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// CORS: dynamic origin validation allowing yanaindia.com and all subdomains,
// roiclients.co.in and all subdomains, localhost, and custom ALLOWED_ORIGINS.
function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // curl, Postman, server-to-server, same-origin
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
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

// In serverless environments (e.g. Vercel / proxy rewrites), the route might arrive without the /api prefix.
app.use((req, _res, next) => {
  if (
    !req.url.startsWith("/api/") &&
    (req.url.startsWith("/auth/") ||
      req.url.startsWith("/packages") ||
      req.url.startsWith("/admin/") ||
      req.url.startsWith("/enquiries") ||
      req.url.startsWith("/site-settings") ||
      req.url.startsWith("/testimonials") ||
      req.url.startsWith("/destinations") ||
      req.url.startsWith("/health") ||
      req.url.startsWith("/upload"))
  ) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Serve uploaded files and public assets.
const publicDir = path.resolve(__dirname, "..", "public");
app.use(express.static(publicDir));

// In production the Express server also serves the built SPA from dist/.
const distDir = path.resolve(__dirname, "..", "dist");
if (existsSync(path.join(distDir, "index.html"))) {
  app.use(express.static(distDir));
}

const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response) => {
    fn(req, res).catch((err) => {
      const e = err as Error;
      const dbDown = e instanceof DatabaseUnavailableError;
      const cfg = e instanceof AuthConfigError;
      log.error("api.error", {
        requestId: res.locals.requestId,
        method: req.method,
        path: req.path,
        category: dbDown ? "database_unavailable" : cfg ? "config" : "unexpected",
        message: e?.message,
        stack: e?.stack,
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
          requestId: res.locals.requestId,
        });
        return;
      }
      res.status(500).json({ ok: false, error: "Internal server error.", requestId: res.locals.requestId });
    });
  };

// ── Health ───────────────────────────────────────────────────────────────────
// Liveness: process is up. No DB, no secrets.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, status: "up" });
});
// Readiness: verifies DB connectivity. Reports only booleans/latency.
app.get(
  "/api/ready",
  wrap(async (_req, res) => {
    const db = await pingDb();
    const ready = db.ok && missingEnv.length === 0;
    res.status(ready ? 200 : 503).json({
      ok: ready,
      database: db.ok ? "up" : "down",
      config: missingEnv.length === 0 ? "ok" : "incomplete",
    });
  }),
);

// ── Auth ─────────────────────────────────────────────────────────────────────
// Gracefully handle GET requests to /api/auth/login by redirecting to the admin login UI
app.get("/api/auth/login", (_req, res) => {
  res.redirect("/admin/login");
});

app.post(
  "/api/auth/login",
  wrap(async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";
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
  }),
);

app.post("/api/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get(
  "/api/auth/me",
  wrap(async (req, res) => {
    const cookieToken = readCookie(req, SESSION_COOKIE);
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : undefined;
    const email = await verifySessionToken(cookieToken || bearerToken);
    if (!email) {
      res.status(401).json({ ok: false });
      return;
    }
    res.json({ ok: true, email });
  }),
);

// ── Public packages ──────────────────────────────────────────────────────────
app.get(
  "/api/packages",
  wrap(async (req, res) => {
    const q = req.query;
    const filters: PackageFilters = {};
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
  }),
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
  }),
);

// ── Public services ──────────────────────────────────────────────────────────
app.get(
  "/api/public/services",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicServices());
  }),
);

// ── Public content (single source of truth shared with the admin panel) ──────
app.get(
  "/api/public/faqs",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicFaqs());
  }),
);

app.get(
  "/api/public/testimonials",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicTestimonials());
  }),
);

app.get(
  "/api/public/gallery",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicGallery());
  }),
);

app.get(
  "/api/public/offices",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicOffices());
  }),
);

app.get(
  "/api/public/destinations",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicDestinations());
  }),
);

app.get(
  "/api/public/themes",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicThemes());
  }),
);

app.get(
  "/api/public/departures",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicDepartures());
  }),
);

app.get(
  "/api/public/hero-slides",
  wrap(async (_req, res) => {
    res.json(await admin.listPublicHeroSlides());
  }),
);

app.get(
  "/api/public/settings",
  wrap(async (_req, res) => {
    res.json(await admin.listSiteSettings());
  }),
);

// ── Enquiry submission (public) ──────────────────────────────────────────────
app.post(
  "/api/enquiries",
  wrap(async (req, res) => {
    const parsed = enquiryFormSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key])
          fieldErrors[key] = issue.message;
      }
      res.status(400).json({
        ok: false,
        error: "Please check the highlighted fields.",
        fieldErrors,
      });
      return;
    }
    const v = parsed.data;
    if (!hasDb()) {
      res.status(503).json({
        ok: false,
        error:
          "Enquiry submission isn't available right now. Please reach us by phone or WhatsApp in the meantime.",
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
        v.type === "customized" ? "customized_enquiry" : "general_enquiry",
      ],
    );
    if (!rows) {
      res.status(503).json({
        ok: false,
        error:
          "We couldn't submit your enquiry right now. Please call us or try again shortly.",
      });
      return;
    }
    res.json({ ok: true });
  }),
);

// ── Admin (all require session cookie) ───────────────────────────────────────
app.get(
  "/api/admin/dashboard",
  requireAdmin,
  wrap(async (_req, res) => {
    const [enq, pkg] = await Promise.all([
      admin.enquiryCounts(),
      admin.packageCounts(),
    ]);
    res.json({ enquiries: enq, packages: pkg });
  }),
);

app.get(
  "/api/admin/packages",
  requireAdmin,
  wrap(async (_req, res) => {
    res.json({ items: await admin.listAdminPackages() });
  }),
);

app.get(
  "/api/admin/packages/:id",
  requireAdmin,
  wrap(async (req, res) => {
    const pkg = await admin.getEditablePackage(req.params.id);
    if (!pkg) {
      res.status(404).json({ ok: false, error: "Package not found." });
      return;
    }
    res.json(pkg);
  }),
);

app.post(
  "/api/admin/packages",
  requireAdmin,
  wrap(async (req, res) => {
    const id =
      typeof req.body?.id === "string" && req.body.id ? req.body.id : null;
    const result = await admin.savePackage(id, req.body?.data ?? req.body);
    res.status(result.ok ? 200 : 400).json(result);
  }),
);

app.post(
  "/api/admin/packages/:id/active",
  requireAdmin,
  wrap(async (req, res) => {
    const active = req.body?.active === true;
    res.json(await admin.togglePackageActive(req.params.id, active));
  }),
);

app.post(
  "/api/admin/packages/:id/featured",
  requireAdmin,
  wrap(async (req, res) => {
    const featured = req.body?.featured === true;
    res.json(await admin.togglePackageFeatured(req.params.id, featured));
  }),
);

app.delete(
  "/api/admin/packages/:id",
  requireAdmin,
  wrap(async (req, res) => {
    const ok = await admin.deletePackage(req.params.id);
    res.status(ok ? 200 : 404).json({ ok });
  }),
);

app.get(
  "/api/admin/enquiries",
  requireAdmin,
  wrap(async (req, res) => {
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    res.json({ items: await admin.listEnquiries(status) });
  }),
);

app.post(
  "/api/admin/enquiries/:id/status",
  requireAdmin,
  wrap(async (req, res) => {
    const status = req.body?.status;
    res.json(await admin.setEnquiryStatus(req.params.id, status));
  }),
);

const MODULES: Record<
  string,
  {
    list: () => Promise<unknown[]>;
    save: (b: Record<string, unknown>) => Promise<{ ok: boolean }>;
  }
> = {
  destinations: {
    list: admin.listAdminDestinations,
    save: admin.saveDestinationAction,
  },
  services: { list: admin.listAdminServices, save: admin.saveServiceAction },
  testimonials: {
    list: admin.listAdminTestimonials,
    save: admin.saveTestimonialAction,
  },
  gallery: { list: admin.listAdminGallery, save: admin.saveGalleryAction },
  faqs: { list: admin.listAdminFaqs, save: admin.saveFaqAction },
  contact_info: { list: admin.listAdminOffices, save: admin.saveOfficeAction },
  hero_slides: {
    list: admin.listAdminHeroSlides,
    save: admin.saveHeroSlideAction,
  },
  curated_themes: {
    list: admin.listAdminThemes,
    save: admin.saveThemeAction,
  },
  departures: {
    list: admin.listAdminDepartures,
    save: admin.saveDepartureAction,
  },
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
  }),
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
  }),
);

app.post(
  "/api/admin/settings",
  requireAdmin,
  wrap(async (req, res) => {
    const result = await admin.saveSiteSetting(req.body?.key, req.body?.value);
    res.status(result.ok ? 200 : 400).json(result);
  }),
);

app.post(
  "/api/admin/:module/toggle",
  requireAdmin,
  wrap(async (req, res) => {
    admin.assertTable(req.params.module);
    res.json(
      await admin.toggleItemActive(
        req.params.module,
        req.body?.id,
        req.body?.active === true,
      ),
    );
  }),
);

app.delete(
  "/api/admin/:module/:id",
  requireAdmin,
  wrap(async (req, res) => {
    admin.assertTable(req.params.module);
    res.json(await admin.deleteItem(req.params.module, req.params.id));
  }),
);

// ── Upload ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const dir = path.join(publicDir, "uploads");
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({ storage });

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
  }),
);

// Global Express error handler: guarantees that API requests always return JSON, NEVER HTML error pages.
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  if (!res.headersSent) {
    res.status(status).json({
      ok: false,
      error: err?.message || "Internal server error.",
    });
  }
});

// SPA fallback: serve the built index.html for any non-API route.
app.use((req, res, _next) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ ok: false, error: "API route not found." });
    return;
  }
  const candidates = [
    path.join(distDir, "index.html"),
    path.join(publicDir, "index.html"),
  ];
  for (const file of candidates) {
    if (existsSync(file)) return res.sendFile(file);
  }
  res.status(404).send("SPA not built yet — run `npm run build` first.");
});

if (!process.env.VERCEL) {
  // PORT may be a number or (under cPanel Passenger) a socket path.
  const PORT = process.env.PORT || "4000";
  const server = app.listen(/^\d+$/.test(PORT) ? Number(PORT) : PORT, () => {
    log.info("server.started", {
      port: PORT,
      nodeEnv: process.env.NODE_ENV || "development",
      database: hasDb() ? "configured" : "not_configured",
    });
    void pingDb().then((r) =>
      log[r.ok ? "info" : "error"]("db.startup_check", { category: "database", ok: r.ok, latencyMs: r.latencyMs }),
    );
  });
  const shutdown = (signal: string) => {
    log.info("server.shutdown", { signal });
    server.close(() => void closeDb().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (r) =>
    log.error("process.unhandled_rejection", { message: String((r as Error)?.message ?? r) }),
  );
}

export default app;
