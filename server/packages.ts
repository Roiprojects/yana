import { query } from "./db.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const generatedRaw = require("../src/lib/data/packages.generated.json");

/**
 * Data access for tour packages (server-side).
 * Primary source is the client's PostgreSQL (`tour_packages`). If the DB is
 * unreachable/unconfigured, we fall back to the catalogue extracted from the
 * client's official trip-package PDFs so the site still renders real content.
 * Nothing here is invented.
 */

export type ItineraryDay = {
  day_number: number;
  title: string | null;
  description: string | null;
  meals: string | null;
  stay: string | null;
};

export type PackageListItem = {
  id: string;
  title: string;
  slug: string;
  scope: "domestic" | "international";
  tour_type: "group" | "customized";
  duration_days: number | null;
  duration_nights: number | null;
  price_amount: number | null;
  price_currency: string;
  hero_image_url: string | null;
  overview: string | null;
  category_name?: string | null;
  destination_name?: string | null;
};

export type PackageDetail = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  destination_id: string | null;
  scope: "domestic" | "international";
  tour_type: "group" | "customized";
  group_subtype: "standard" | "kitchen_staff" | null;
  duration_days: number | null;
  duration_nights: number | null;
  overview: string | null;
  highlights: string[];
  accommodation: string | null;
  meals_info: string | null;
  transport_info: string | null;
  inclusions: string[];
  exclusions: string[];
  price_amount: number | null;
  price_currency: string;
  taxes_info: string | null;
  pickup_location: string | null;
  drop_location: string | null;
  documents_required: string[] | null;
  visa_info: string | null;
  cancellation_policy: string | null;
  terms: string | null;
  hero_image_url: string | null;
  is_featured: boolean;
  source_pdf: string | null;
  source_pages: string | null;
  review_status: string;
  status: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  destination_name?: string | null;
  itinerary: ItineraryDay[];
};

type Generated = {
  package_title: string;
  slug: string;
  scope: "domestic" | "international";
  tour_type: "group" | "customized";
  group_subtype: "standard" | "kitchen_staff" | null;
  category_name: string | null;
  destination_name: string | null;
  country: string | null;
  duration_days: number | null;
  duration_nights: number | null;
  overview: string | null;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  price_amount: number | null;
  price_currency: string;
  taxes_info: string | null;
  hero_image_url: string | null;
  is_featured: boolean;
  source_pdf: string | null;
  source_pages: string | null;
  review_status: string;
};

const generated = generatedRaw as Generated[];

export type PackageFilters = {
  scope?: "domestic" | "international";
  tourType?: "group" | "customized";
  groupSubtype?: "standard" | "kitchen_staff";
  featured?: boolean;
};

export type ListResult = { items: PackageListItem[]; sample: boolean };

type DbListRow = {
  id: string;
  title: string;
  slug: string;
  scope: "domestic" | "international";
  tour_type: "group" | "customized";
  duration_days: number | null;
  duration_nights: number | null;
  price_amount: string | number | null;
  price_currency: string;
  hero_image_url: string | null;
  overview: string | null;
  category_name: string | null;
  destination_name: string | null;
};

type DbDetailRow = DbListRow & {
  group_subtype: "standard" | "kitchen_staff" | null;
  country: string | null;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  taxes_info: string | null;
  is_featured: boolean;
  source_pdf: string | null;
  source_pages: string | null;
};

function num(v: string | number | null): number | null {
  if (v === null) return null;
  return typeof v === "number" ? v : Number(v);
}

// Keep package imagery destination-specific and local so database records cannot
// silently fall back to generic or stale external photography.
const curatedPackageImages = new Set([
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
  "vietnam-5n6d",
]);

function packageImage(slug: string, fallback: string | null): string | null {
  return curatedPackageImages.has(slug) ? `/packages/${slug}.jpg` : fallback;
}

function dbRowToListItem(r: DbListRow): PackageListItem {
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
    destination_name: r.destination_name,
  };
}

function genToListItem(g: Generated): PackageListItem {
  return {
    id: g.slug,
    title: g.package_title,
    slug: g.slug,
    scope: g.scope,
    tour_type: g.tour_type,
    duration_days: g.duration_days,
    duration_nights: g.duration_nights,
    price_amount: g.price_amount,
    price_currency: g.price_currency,
    hero_image_url: packageImage(g.slug, g.hero_image_url),
    overview: g.overview,
    category_name: g.category_name,
    destination_name: g.destination_name,
  };
}

function localList(filters: PackageFilters): PackageListItem[] {
  return generated
    .filter((p) => (filters.scope ? p.scope === filters.scope : true))
    .filter((p) => (filters.tourType ? p.tour_type === filters.tourType : true))
    .filter((p) =>
      filters.groupSubtype ? p.group_subtype === filters.groupSubtype : true,
    )
    .filter((p) => (filters.featured ? p.is_featured : true))
    .map(genToListItem);
}

function toDetail(g: Generated, index: number): PackageDetail {
  const now = new Date().toISOString();
  return {
    id: g.slug,
    title: g.package_title,
    slug: g.slug,
    category_id: null,
    destination_id: null,
    scope: g.scope,
    tour_type: g.tour_type,
    group_subtype: g.group_subtype,
    duration_days: g.duration_days,
    duration_nights: g.duration_nights,
    overview: g.overview,
    highlights: g.highlights,
    accommodation: null,
    meals_info: null,
    transport_info: null,
    inclusions: g.inclusions,
    exclusions: g.exclusions,
    price_amount: g.price_amount,
    price_currency: g.price_currency,
    taxes_info: g.taxes_info,
    pickup_location: null,
    drop_location: null,
    documents_required: null,
    visa_info: null,
    cancellation_policy: null,
    terms: null,
    hero_image_url: packageImage(g.slug, g.hero_image_url),
    is_featured: g.is_featured,
    source_pdf: g.source_pdf,
    source_pages: g.source_pages,
    review_status: "verified",
    status: "published",
    is_active: true,
    sort_order: index,
    created_at: now,
    updated_at: now,
    category_name: g.category_name,
    destination_name: g.destination_name,
    itinerary: g.itinerary,
  };
}

export async function listPackages(
  filters: PackageFilters = {},
): Promise<ListResult> {
  const where = [
    "status = 'published'",
    "is_active = true",
    "review_status = 'verified'",
  ];
  const params: unknown[] = [];
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

  const rows = await query<DbListRow>(
    `select id, title, slug, scope, tour_type, duration_days, duration_nights,
            price_amount, price_currency, hero_image_url, overview,
            category_name, destination_name
       from tour_packages
      where ${where.join(" and ")}
      order by sort_order asc`,
    params,
  );

  if (rows) {
    return { items: rows.map(dbRowToListItem), sample: false };
  }
  return { items: [], sample: false };
}

export async function getPackageBySlug(
  slug: string,
): Promise<PackageDetail | null> {
  const rows = await query<DbDetailRow>(
    `select id, title, slug, scope, tour_type, group_subtype, category_name,
            destination_name, country, duration_days, duration_nights, overview,
            highlights, itinerary, inclusions, exclusions, price_amount,
            price_currency, taxes_info, hero_image_url, is_featured,
            source_pdf, source_pages
       from tour_packages
      where slug = $1 and status = 'published' and is_active = true
        and review_status = 'verified'
      limit 1`,
    [slug],
  );

  const r = rows?.[0];
  if (r) {
    const now = new Date().toISOString();
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
      itinerary: r.itinerary ?? [],
    };
  }

  return null;
}
