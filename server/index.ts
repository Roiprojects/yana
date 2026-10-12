import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import multer from "multer";
import { fileURLToPath } from "node:url";
import { enquiryFormSchema } from "../src/lib/schemas/enquiry.js";
import {
  requireAdmin,
  verifyCredentials,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "./auth.js";
import {
  listPackages,
  getPackageBySlug,
  type PackageFilters,
} from "./packages.js";
import * as admin from "./admin.js";
import { query, hasDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("trust proxy", 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

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
      console.error("[api]", err);
      res.status(500).json({ ok: false, error: "Internal server error." });
    });
  };

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
    if (!verifyCredentials(email, password)) {
      res.status(401).json({ ok: false, error: "Invalid email or password." });
      return;
    }
    const token = await createSessionToken(email.toLowerCase());
    setSessionCookie(req, res, token);
    res.json({ ok: true });
  }),
);

app.post("/api/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get(
  "/api/auth/me",
  wrap(async (req, res) => {
    const { SESSION_COOKIE, readCookie, verifySessionToken } =
      await import("./auth.js");
    const email = await verifySessionToken(readCookie(req, SESSION_COOKIE));
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
  const PORT = Number(process.env.PORT || 4000);
  app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
  });
}

export default app;
