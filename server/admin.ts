import { query } from "./db.js";

// ── Enquiries ────────────────────────────────────────────────────────────────
export type EnquiryRow = {
  id: string;
  type: "general" | "customized";
  name: string;
  phone: string;
  email: string | null;
  destination_interest: string | null;
  travellers: number | null;
  travel_date: string | null;
  budget_range: string | null;
  hotel_category: string | null;
  scope: "domestic" | "international" | null;
  message: string | null;
  status: "new" | "contacted" | "closed";
  source: string | null;
  created_at: string;
};

export async function listEnquiries(status?: string): Promise<EnquiryRow[]> {
  const params: unknown[] = [];
  let where = "";
  if (status && ["new", "contacted", "closed"].includes(status)) {
    params.push(status);
    where = `where status = $1`;
  }
  const rows = await query<EnquiryRow>(
    `select id, type, name, phone, email, destination_interest, travellers,
            travel_date, budget_range, hotel_category, scope, message, status,
            source, created_at
       from enquiries ${where}
      order by created_at desc
      limit 200`,
    params,
  );
  return rows ?? [];
}

export type EnquiryCounts = {
  total: number;
  new: number;
  contacted: number;
  closed: number;
};

export async function enquiryCounts(): Promise<EnquiryCounts> {
  const rows = await query<{ status: string; n: string }>(
    `select status, count(*)::int n from enquiries group by status`,
  );
  const c: EnquiryCounts = { total: 0, new: 0, contacted: 0, closed: 0 };
  for (const r of rows ?? []) {
    const n = Number(r.n);
    c.total += n;
    if (r.status === "new") c.new = n;
    else if (r.status === "contacted") c.contacted = n;
    else if (r.status === "closed") c.closed = n;
  }
  return c;
}

export async function setEnquiryStatus(
  id: string,
  status: "new" | "contacted" | "closed",
): Promise<{ ok: boolean }> {
  if (!["new", "contacted", "closed"].includes(status)) return { ok: false };
  const rows = await query(
    `update enquiries set status = $1 where id = $2 returning id`,
    [status, id],
  );
  return { ok: Boolean(rows && rows.length > 0) };
}

// ── Packages (admin view) ────────────────────────────────────────────────────
export type AdminPackageRow = {
  id: string;
  title: string;
  slug: string;
  scope: "domestic" | "international";
  tour_type: "group" | "customized";
  price_amount: string | number | null;
  is_active: boolean;
  is_featured: boolean;
  status: "draft" | "published";
  sort_order: number;
};

export async function listAdminPackages(): Promise<AdminPackageRow[]> {
  const rows = await query<AdminPackageRow>(
    `select id, title, slug, scope, tour_type, price_amount, is_active,
            is_featured, status, sort_order
       from tour_packages
      order by sort_order asc`,
  );
  return rows ?? [];
}

export type EditablePackage = {
  id: string;
  title: string;
  slug: string;
  scope: "domestic" | "international";
  tour_type: "group" | "customized";
  category_name: string | null;
  destination_name: string | null;
  country: string | null;
  duration_days: number | null;
  duration_nights: number | null;
  overview: string | null;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  price_amount: string | number | null;
  taxes_info: string | null;
  hero_image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  status: "draft" | "published";
};

export async function getEditablePackage(
  id: string,
): Promise<EditablePackage | null> {
  const rows = await query<EditablePackage>(
    `select id, title, slug, scope, tour_type, category_name, theme_name, destination_name,
            country, duration_days, duration_nights, overview, highlights,
            inclusions, exclusions, price_amount, taxes_info, hero_image_url,
            source_pdf, is_featured, is_active, status
       from tour_packages where id = $1 limit 1`,
    [id],
  );
  return rows?.[0] ?? null;
}

export async function packageCounts(): Promise<{
  total: number;
  published: number;
  featured: number;
}> {
  const rows = await query<{
    total: string;
    published: string;
    featured: string;
  }>(
    `select count(*)::int total,
            count(*) filter (where status='published' and is_active)::int published,
            count(*) filter (where is_featured)::int featured
       from tour_packages`,
  );
  const r = rows?.[0];
  return {
    total: Number(r?.total ?? 0),
    published: Number(r?.published ?? 0),
    featured: Number(r?.featured ?? 0),
  };
}

export async function togglePackageActive(
  id: string,
  active: boolean,
): Promise<{ ok: boolean }> {
  const rows = await query(
    `update tour_packages set is_active = $1, updated_at = now() where id = $2 returning id`,
    [active, id],
  );
  return { ok: Boolean(rows && rows.length > 0) };
}

export async function togglePackageFeatured(
  id: string,
  featured: boolean,
): Promise<{ ok: boolean }> {
  const rows = await query(
    `update tour_packages set is_featured = $1, updated_at = now() where id = $2 returning id`,
    [featured, id],
  );
  return { ok: Boolean(rows && rows.length > 0) };
}

export type SavePackageResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function savePackage(
  id: string | null,
  raw: unknown,
): Promise<SavePackageResult> {
  const v = raw as {
    title?: string;
    slug?: string;
    scope?: string;
    tour_type?: string;
    category_name?: string;
    theme_name?: string;
    destination_name?: string;
    country?: string;
    duration_days?: number | null;
    duration_nights?: number | null;
    overview?: string;
    highlights?: string[];
    inclusions?: string[];
    exclusions?: string[];
    price_amount?: number | null;
    taxes_info?: string;
    hero_image_url?: string;
    source_pdf?: string;
    is_featured?: boolean;
    is_active?: boolean;
    status?: string;
    itinerary?: unknown[];
  };

  const slug = (v.slug ?? "").toLowerCase().trim();
  const scope = v.scope === "domestic" ? "domestic" : "international";
  const tour_type = v.tour_type === "group" ? "group" : "customized";
  const status = v.status === "draft" ? "draft" : "published";

  // Uniqueness check on slug (excluding self).
  const clash = await query<{ id: string }>(
    `select id from tour_packages where slug = $1 and ($2::uuid is null or id <> $2)`,
    [slug, id],
  );
  if (clash && clash.length > 0) {
    return {
      ok: false,
      error: "That slug is already in use.",
      fieldErrors: { slug: "Already in use" },
    };
  }

  const params: unknown[] = [
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
    JSON.stringify(v.itinerary ?? []),
  ];

  if (id) {
    const rows = await query(
      `update tour_packages set
         title=$1, slug=$2, scope=$3, tour_type=$4, category_name=$5, theme_name=$6,
         destination_name=$7, country=$8, duration_days=$9, duration_nights=$10,
         overview=$11, highlights=$12::jsonb, inclusions=$13::jsonb,
         exclusions=$14::jsonb, price_amount=$15, taxes_info=$16,
         hero_image_url=$17, source_pdf=$18, is_featured=$19, is_active=$20, status=$21,
         itinerary=$22::jsonb,
         updated_at=now()
       where id=$23 returning id`,
      [...params, id],
    );
    if (!rows || rows.length === 0)
      return { ok: false, error: "Package not found." };
  } else {
    const rows = await query(
      `insert into tour_packages
        (title, slug, scope, tour_type, category_name, destination_name, country,
         duration_days, duration_nights, overview, highlights, inclusions, exclusions,
         price_amount, taxes_info, hero_image_url, is_featured, is_active, status,
         itinerary, review_status, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,
         $14,$15,$16,$17,$18,$19,$20::jsonb,'verified',
         (select coalesce(max(sort_order),0)+10 from tour_packages))
       returning id`,
      params,
    );
    if (!rows || rows.length === 0)
      return { ok: false, error: "Could not create package." };
  }

  return { ok: true, slug };
}

export async function deletePackage(id: string): Promise<boolean> {
  const rows = await query(
    `delete from tour_packages where id = $1 returning id`,
    [id],
  );
  return Boolean(rows && rows.length > 0);
}

// ── Destinations ─────────────────────────────────────────────────────────────
export type AdminDestinationRow = {
  id: string;
  name: string;
  slug: string;
  scope: "domestic" | "international";
  country: string | null;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export async function listAdminDestinations(): Promise<AdminDestinationRow[]> {
  const rows = await query<AdminDestinationRow>(
    `select id, name, slug, scope, country, description, image_url, is_featured, is_active, sort_order
       from destinations
      order by sort_order asc`,
  );
  return rows ?? [];
}

// ── Services ─────────────────────────────────────────────────────────────────
export type AdminServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function listAdminServices(): Promise<AdminServiceRow[]> {
  const rows = await query<AdminServiceRow>(
    `select id, name, slug, description, is_active, sort_order
       from services
      order by sort_order asc`,
  );
  return rows ?? [];
}

// ── Testimonials ──────────────────────────────────────────────────────────────
export type AdminTestimonialRow = {
  id: string;
  customer_name: string;
  location: string | null;
  photo_url: string | null;
  rating: number;
  review: string;
  is_active: boolean;
  sort_order: number;
};

export async function listAdminTestimonials(): Promise<AdminTestimonialRow[]> {
  const rows = await query<AdminTestimonialRow>(
    `select id, customer_name, location, photo_url, rating, review, is_active, sort_order
       from testimonials
      order by sort_order asc`,
  );
  return rows ?? [];
}

// ── Gallery ──────────────────────────────────────────────────────────────────
export type AdminGalleryRow = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

export async function listAdminGallery(): Promise<AdminGalleryRow[]> {
  const rows = await query<AdminGalleryRow>(
    `select id, title, category, image_url, is_active, sort_order
       from gallery
      order by sort_order asc`,
  );
  return rows ?? [];
}

// ── FAQs ─────────────────────────────────────────────────────────────────────
export type AdminFaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
};

export async function listAdminFaqs(): Promise<AdminFaqRow[]> {
  const rows = await query<AdminFaqRow>(
    `select id, question, answer, category, is_active, sort_order
       from faqs
      order by sort_order asc`,
  );
  return rows ?? [];
}

// ── Contact Info / Offices ───────────────────────────────────────────────────
export type AdminOfficeRow = {
  id: string;
  office_name: string;
  address: string | null;
  city: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  hours: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function listAdminOffices(): Promise<AdminOfficeRow[]> {
  const rows = await query<AdminOfficeRow>(
    `select id, office_name, address, city, pincode, phone, email, hours, is_active, sort_order
       from contact_info
      order by sort_order asc`,
  );
  return rows ?? [];
}

// ── Hero Slides ─────────────────────────────────────────────────────────────
export type AdminHeroRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_primary_text: string | null;
  cta_primary_link: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function listAdminHeroSlides(): Promise<AdminHeroRow[]> {
  const rows = await query<AdminHeroRow>(
    `select id, title, subtitle, image_url, video_url, mobile_video_url, cta_primary_text, cta_primary_link, is_active, sort_order
       from hero_slides
      order by sort_order asc`,
  );
  return rows ?? [];
}

// ── Curated Themes ────────────────────────────────────────────────────────────
export type AdminThemeRow = {
  id: string;
  title: string;
  tag: string;
  blurb: string;
  href: string;
  image_url: string;
  scope: "all" | "domestic" | "international";
  is_active: boolean;
  sort_order: number;
};

export async function listAdminThemes(): Promise<AdminThemeRow[]> {
  const rows = await query<AdminThemeRow>(
    `select id, title, tag, blurb, href, image_url, scope, is_active, sort_order
       from curated_themes
      order by sort_order asc`,
  );
  return rows ?? [];
}

export async function listPublicThemes(): Promise<AdminThemeRow[]> {
  const rows = await query<AdminThemeRow>(
    `select id, title, tag, blurb, href, image_url, scope, is_active, sort_order
       from curated_themes
      where is_active = true
      order by sort_order asc`,
  );
  return rows ?? [];
}

export async function saveThemeAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const title = str(body.title);
  const tag = str(body.tag);
  const blurb = str(body.blurb);
  const href = str(body.href) || "/packages";
  const image_url = str(body.image_url);
  const scope = str(body.scope) || "all";

  if (id) {
    await query(
      `update curated_themes set title=$1, tag=$2, blurb=$3, href=$4, image_url=$5, scope=$6 where id=$7`,
      [title, tag, blurb, href, image_url, scope, id],
    );
  } else {
    await query(
      `insert into curated_themes (title, tag, blurb, href, image_url, scope) values ($1, $2, $3, $4, $5, $6)`,
      [title, tag, blurb, href, image_url, scope],
    );
  }
  return { ok: true };
}

// ── Public Fetchers ─────────────────────────────────────────────────────────
export async function listPublicDestinations(): Promise<AdminDestinationRow[]> {
  const rows = await query<AdminDestinationRow>(
    `select id, name, slug, scope, country, description, image_url, is_featured, is_active, sort_order
       from destinations
      where is_active = true
      order by sort_order asc`,
  );
  return rows ?? [];
}

export async function listPublicTestimonials(): Promise<AdminTestimonialRow[]> {
  const rows = await query<AdminTestimonialRow>(
    `select id, customer_name, location, photo_url, rating, review, is_active, sort_order
       from testimonials
      where is_active = true
      order by sort_order asc`,
  );
  return rows ?? [];
}

export async function listPublicFaqs(): Promise<AdminFaqRow[]> {
  const rows = await query<AdminFaqRow>(
    `select id, question, answer, category, is_active, sort_order
       from faqs
      where is_active = true
      order by sort_order asc`,
  );
  return rows ?? [];
}

export async function listPublicServices(): Promise<AdminServiceRow[]> {
  const rows = await query<AdminServiceRow>(
    `select id, name, slug, description, is_active, sort_order
       from services
      where is_active = true
      order by sort_order asc`,
  );
  return rows ?? [];
}

export async function listPublicGallery(): Promise<AdminGalleryRow[]> {
  const rows = await query<AdminGalleryRow>(
    `select id, title, category, image_url, is_active, sort_order
       from gallery
      where is_active = true
      order by sort_order asc`,
  );
  return rows ?? [];
}

export async function listPublicOffices(): Promise<AdminOfficeRow[]> {
  const rows = await query<AdminOfficeRow>(
    `select id, office_name, address, city, pincode, phone, email, hours, is_active, sort_order
       from contact_info
      order by sort_order asc`,
  );
  return rows ?? [];
}

// ── Site Settings (key/value) ────────────────────────────────────────────────
const SETTING_KEYS = ["site", "about", "seo"] as const;

export async function listSiteSettings(): Promise<Record<string, unknown>> {
  const rows = await query<{ key: string; value: unknown }>(
    `select key, value from site_settings`,
  );
  const out: Record<string, unknown> = {};
  for (const r of rows ?? []) out[r.key] = r.value;
  return out;
}

export async function saveSiteSetting(
  key: string,
  value: unknown,
): Promise<{ ok: boolean }> {
  if (!(SETTING_KEYS as readonly string[]).includes(key)) return { ok: false };
  await query(
    `insert into site_settings (key, value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (key) do update
       set value = excluded.value, updated_at = now()`,
    [key, JSON.stringify(value ?? {})],
  );
  return { ok: true };
}

// ── Generic CRUD (table whitelist enforced) ────────────────────────────────
const ALLOWED_TABLES = [
  "tour_packages",
  "destinations",
  "services",
  "testimonials",
  "gallery",
  "faqs",
  "contact_info",
  "hero_slides",
  "curated_themes",
] as const;

export function assertTable(table: string): void {
  if (!(ALLOWED_TABLES as readonly string[]).includes(table)) {
    throw new Error("Invalid table");
  }
}

export async function toggleItemActive(
  table: string,
  id: string,
  currentStatus: boolean,
): Promise<{ ok: boolean }> {
  assertTable(table);
  await query(`update ${table} set is_active = $1 where id = $2`, [
    !currentStatus,
    id,
  ]);
  return { ok: true };
}

export async function deleteItem(
  table: string,
  id: string,
): Promise<{ ok: boolean }> {
  assertTable(table);
  await query(`delete from ${table} where id = $1`, [id]);
  return { ok: true };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function bool(v: unknown): boolean {
  return v === "on" || v === true;
}

export async function saveDestinationAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const name = str(body.name);
  const slug = str(body.slug) || slugify(name);
  const scope = str(body.scope) || "international";
  const country = str(body.country);
  const description = str(body.description);
  const image_url = str(body.image_url);
  const is_featured = bool(body.is_featured);

  if (id) {
    await query(
      `update destinations set name=$1, slug=$2, scope=$3, country=$4, description=$5, image_url=$6, is_featured=$7 where id=$8`,
      [name, slug, scope, country, description, image_url, is_featured, id],
    );
  } else {
    await query(
      `insert into destinations (name, slug, scope, country, description, image_url, is_featured) values ($1, $2, $3, $4, $5, $6, $7)`,
      [name, slug, scope, country, description, image_url, is_featured],
    );
  }
  return { ok: true };
}

export async function saveServiceAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const name = str(body.name);
  const slug = str(body.slug) || slugify(name);
  const description = str(body.description);

  if (id) {
    await query(
      `update services set name=$1, slug=$2, description=$3 where id=$4`,
      [name, slug, description, id],
    );
  } else {
    await query(
      `insert into services (name, slug, description) values ($1, $2, $3)`,
      [name, slug, description],
    );
  }
  return { ok: true };
}

export async function saveTestimonialAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const customer_name = str(body.customer_name);
  const location = str(body.location);
  const review = str(body.review);
  const rating = Number(body.rating ?? 5);
  const photo_url = str(body.photo_url);

  if (id) {
    await query(
      `update testimonials set customer_name=$1, location=$2, review=$3, rating=$4, photo_url=$5 where id=$6`,
      [customer_name, location, review, rating, photo_url, id],
    );
  } else {
    await query(
      `insert into testimonials (customer_name, location, review, rating, photo_url) values ($1, $2, $3, $4, $5)`,
      [customer_name, location, review, rating, photo_url],
    );
  }
  return { ok: true };
}

export async function saveFaqAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const question = str(body.question);
  const answer = str(body.answer);
  const category = str(body.category) || "General";

  if (id) {
    await query(
      `update faqs set question=$1, answer=$2, category=$3 where id=$4`,
      [question, answer, category, id],
    );
  } else {
    await query(
      `insert into faqs (question, answer, category) values ($1, $2, $3)`,
      [question, answer, category],
    );
  }
  return { ok: true };
}

export async function saveOfficeAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const office_name = str(body.office_name);
  const address = str(body.address);
  const city = str(body.city);
  const pincode = str(body.pincode);
  const phone = str(body.phone);
  const email = str(body.email);

  if (id) {
    await query(
      `update contact_info set office_name=$1, address=$2, city=$3, pincode=$4, phone=$5, email=$6 where id=$7`,
      [office_name, address, city, pincode, phone, email, id],
    );
  } else {
    await query(
      `insert into contact_info (office_name, address, city, pincode, phone, email) values ($1, $2, $3, $4, $5, $6)`,
      [office_name, address, city, pincode, phone, email],
    );
  }
  return { ok: true };
}

export async function saveGalleryAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const title = str(body.title);
  const category = str(body.category) || "General";
  const image_url = str(body.image_url);

  if (id) {
    await query(
      `update gallery set title=$1, category=$2, image_url=$3 where id=$4`,
      [title, category, image_url, id],
    );
  } else {
    await query(
      `insert into gallery (title, category, image_url) values ($1, $2, $3)`,
      [title, category, image_url],
    );
  }
  return { ok: true };
}

export async function savePackageAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const title = str(body.title);
  const slug = str(body.slug) || slugify(title);
  const scope = str(body.scope) || "international";
  const tour_type = str(body.tour_type) || "customized";
  const price_amount = body.price_amount ? Number(body.price_amount) : null;
  const duration_days = body.duration_days ? Number(body.duration_days) : null;
  const duration_nights = body.duration_nights
    ? Number(body.duration_nights)
    : null;
  const destination_name = str(body.destination_name);
  const overview = str(body.overview);
  const hero_image_url = str(body.hero_image_url);
  const is_featured = bool(body.is_featured);
  const is_active = body.is_active !== "off" && body.is_active !== false;

  if (id) {
    await query(
      `update tour_packages set title=$1, slug=$2, scope=$3, tour_type=$4, price_amount=$5,
          duration_days=$6, duration_nights=$7, destination_name=$8,
          overview=$9, hero_image_url=$10, is_featured=$11, is_active=$12, updated_at=now()
        where id=$13`,
      [
        title,
        slug,
        scope,
        tour_type,
        price_amount,
        duration_days,
        duration_nights,
        destination_name,
        overview,
        hero_image_url,
        is_featured,
        is_active,
        id,
      ],
    );
  } else {
    await query(
      `insert into tour_packages (title, slug, scope, tour_type, price_amount, duration_days, duration_nights,
         destination_name, overview, hero_image_url, is_featured, is_active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        title,
        slug,
        scope,
        tour_type,
        price_amount,
        duration_days,
        duration_nights,
        destination_name,
        overview,
        hero_image_url,
        is_featured,
        is_active,
      ],
    );
  }
  return { ok: true };
}

export async function saveHeroSlideAction(body: Record<string, unknown>) {
  const id = str(body.id) || null;
  const title = str(body.title);
  const subtitle = str(body.subtitle);
  const image_url = str(body.image_url);
  const video_url = str(body.video_url);
  const mobile_video_url = str(body.mobile_video_url);
  const cta_primary_text = str(body.cta_primary_text) || "Explore packages";
  const cta_primary_link = str(body.cta_primary_link) || "/packages";

  if (id) {
    await query(
      `update hero_slides set title=$1, subtitle=$2, image_url=$3, video_url=$4, mobile_video_url=$5, cta_primary_text=$6, cta_primary_link=$7 where id=$8`,
      [title, subtitle, image_url, video_url, mobile_video_url, cta_primary_text, cta_primary_link, id],
    );
  } else {
    await query(
      `insert into hero_slides (title, subtitle, image_url, video_url, mobile_video_url, cta_primary_text, cta_primary_link) values ($1, $2, $3, $4, $5, $6, $7)`,
      [title, subtitle, image_url, video_url, mobile_video_url, cta_primary_text, cta_primary_link],
    );
  }
  return { ok: true };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
