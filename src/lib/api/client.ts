import type { PackageDetail, PackageListItem, ItineraryDay } from "@/lib/types/tour";
import type {
  PublicFaq,
  PublicGalleryItem,
  PublicOffice,
  PublicTestimonial,
  SiteSettings,
} from "@/lib/types/content";
import type {
  AdminDepartureRow,
  AdminHeroRow,
  AdminDestinationRow,
} from "@/lib/types/admin";
import { siteConfig } from "@/lib/site-config";
import generatedRaw from "@/lib/data/packages.generated.json";

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

function localList(filters: PackageListQuery): PackageListItem[] {
  return generated
    .filter((p) => (filters.scope ? p.scope === filters.scope : true))
    .filter((p) => (filters.tourType ? p.tour_type === filters.tourType : true))
    .filter((p) =>
      filters.groupSubtype ? p.group_subtype === filters.groupSubtype : true,
    )
    .filter((p) => (filters.featured ? p.is_featured : true))
    .map(genToListItem);
}

function localDetail(slug: string): PackageDetail | null {
  // Mock data for upcoming premium tours
  if (slug === "kashmir-escape") {
    return {
      id: "upcoming-1",
      title: "Mesmerizing Kashmir Escape",
      slug: "kashmir-escape",
      category_id: null,
      destination_id: null,
      scope: "domestic",
      tour_type: "group",
      group_subtype: "standard",
      duration_days: 6,
      duration_nights: 5,
      overview: "Experience the heaven on earth with our upcoming group departure. Shikara rides, Gulmarg snowcaps, and Pahalgam valleys.",
      highlights: ["Shikara ride on Dal Lake", "Gondola ride in Gulmarg", "Pahalgam Valley Tour", "Srinagar local sightseeing"],
      accommodation: "4-star premium houseboats and hotels",
      meals_info: "Breakfast and Dinner included",
      transport_info: "Premium AC Coach",
      inclusions: ["Accommodation", "Meals", "Transport", "Sightseeing"],
      exclusions: ["Flights", "Personal expenses"],
      price_amount: 24999,
      price_currency: "INR",
      taxes_info: "GST 5% extra",
      pickup_location: "Srinagar Airport",
      drop_location: "Srinagar Airport",
      documents_required: ["Valid ID proof"],
      visa_info: null,
      cancellation_policy: "Standard cancellation policy applies",
      terms: "Terms and conditions apply",
      hero_image_url: "/themes/theme-mountains.jpg",
      is_featured: true,
      source_pdf: null,
      source_pages: null,
      review_status: "verified",
      status: "published",
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_name: "Group Tours",
      destination_name: "Kashmir",
      itinerary: [
        { day_number: 1, title: "Arrival in Srinagar", description: "Welcome to Srinagar. Enjoy a Shikara ride on Dal Lake.", meals: "Dinner", stay: "Houseboat" },
        { day_number: 2, title: "Srinagar to Gulmarg", description: "Proceed to Gulmarg. Enjoy the Gondola ride.", meals: "Breakfast & Dinner", stay: "Hotel in Srinagar" },
        { day_number: 3, title: "Srinagar to Pahalgam", description: "Visit saffron fields and Awantipora ruins on the way to Pahalgam.", meals: "Breakfast & Dinner", stay: "Hotel in Pahalgam" },
        { day_number: 4, title: "Pahalgam Sightseeing", description: "Explore Betaab Valley and Aru Valley.", meals: "Breakfast & Dinner", stay: "Hotel in Pahalgam" },
        { day_number: 5, title: "Pahalgam to Srinagar", description: "Return to Srinagar and visit Mughal Gardens.", meals: "Breakfast & Dinner", stay: "Hotel in Srinagar" },
        { day_number: 6, title: "Departure", description: "Transfer to airport for your onward journey.", meals: "Breakfast", stay: null }
      ]
    };
  }
  
  if (slug === "bali-getaway") {
    return {
      id: "upcoming-2",
      title: "Enchanting Bali Getaway",
      slug: "bali-getaway",
      category_id: null,
      destination_id: null,
      scope: "international",
      tour_type: "customized",
      group_subtype: null,
      duration_days: 5,
      duration_nights: 4,
      overview: "Sun-kissed beaches, ancient temples, and vibrant culture. The perfect tropical retreat for your upcoming holidays.",
      highlights: ["Ubud Monkey Forest", "Kintamani Volcano View", "Tanah Lot Sunset", "Water Sports"],
      accommodation: "4-star private pool villa",
      meals_info: "Daily Breakfast",
      transport_info: "Private AC Vehicle",
      inclusions: ["Accommodation", "Breakfast", "Transfers", "English speaking driver"],
      exclusions: ["Flights", "Visa", "Travel Insurance"],
      price_amount: 45000,
      price_currency: "INR",
      taxes_info: "TCS & GST extra",
      pickup_location: "Bali Airport",
      drop_location: "Bali Airport",
      documents_required: ["Passport with 6 months validity"],
      visa_info: "Visa on Arrival for Indians",
      cancellation_policy: "Standard cancellation policy applies",
      terms: "Terms and conditions apply",
      hero_image_url: "/themes/theme-beaches-2.jpg",
      is_featured: true,
      source_pdf: null,
      source_pages: null,
      review_status: "verified",
      status: "published",
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_name: "Customized Packages",
      destination_name: "Bali",
      itinerary: [
        { day_number: 1, title: "Arrival in Bali", description: "Transfer to your private pool villa and relax.", meals: "None", stay: "Villa" },
        { day_number: 2, title: "Ubud & Kintamani Tour", description: "Full day tour of Ubud art villages and Kintamani volcano.", meals: "Breakfast", stay: "Villa" },
        { day_number: 3, title: "Water Sports & Tanah Lot", description: "Morning water sports followed by sunset at Tanah Lot temple.", meals: "Breakfast", stay: "Villa" },
        { day_number: 4, title: "Leisure Day", description: "Spend the day at leisure or explore local markets.", meals: "Breakfast", stay: "Villa" },
        { day_number: 5, title: "Departure", description: "Transfer to airport.", meals: "Breakfast", stay: null }
      ]
    };
  }

  if (slug === "rajasthan-heritage") {
    return {
      id: "upcoming-3",
      title: "Majestic Rajasthan Heritage",
      slug: "rajasthan-heritage",
      category_id: null,
      destination_id: null,
      scope: "domestic",
      tour_type: "group",
      group_subtype: "standard",
      duration_days: 7,
      duration_nights: 6,
      overview: "Explore the land of kings. Royal palaces, golden deserts, and a rich tapestry of Indian heritage.",
      highlights: ["Amber Fort Elephant Ride", "City Palace Udaipur", "Jaisalmer Desert Safari", "Pushkar Lake"],
      accommodation: "Heritage properties & 4-star hotels",
      meals_info: "Breakfast and Dinner",
      transport_info: "AC Luxury Coach",
      inclusions: ["Accommodation", "Meals", "Transport", "Guide"],
      exclusions: ["Flights", "Monument Fees"],
      price_amount: 32000,
      price_currency: "INR",
      taxes_info: "GST 5% extra",
      pickup_location: "Jaipur",
      drop_location: "Udaipur",
      documents_required: ["Valid ID proof"],
      visa_info: null,
      cancellation_policy: "Standard cancellation policy applies",
      terms: "Terms and conditions apply",
      hero_image_url: "/themes/theme-heritage-2.jpg",
      is_featured: true,
      source_pdf: null,
      source_pages: null,
      review_status: "verified",
      status: "published",
      is_active: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_name: "Group Tours",
      destination_name: "Rajasthan",
      itinerary: [
        { day_number: 1, title: "Arrival in Jaipur", description: "Welcome to the Pink City. Evening Chokhi Dhani visit.", meals: "Dinner", stay: "Jaipur" },
        { day_number: 2, title: "Jaipur Sightseeing", description: "Visit Amber Fort, City Palace, and Hawa Mahal.", meals: "Breakfast & Dinner", stay: "Jaipur" },
        { day_number: 3, title: "Jaipur to Jodhpur", description: "Drive to Jodhpur and visit Mehrangarh Fort.", meals: "Breakfast & Dinner", stay: "Jodhpur" },
        { day_number: 4, title: "Jodhpur to Jaisalmer", description: "Drive to Jaisalmer. Evening desert safari.", meals: "Breakfast & Dinner", stay: "Desert Camp" },
        { day_number: 5, title: "Jaisalmer to Mount Abu", description: "Drive to Mount Abu. Visit Dilwara Temples.", meals: "Breakfast & Dinner", stay: "Mount Abu" },
        { day_number: 6, title: "Mount Abu to Udaipur", description: "Drive to Udaipur. Evening boat ride on Lake Pichola.", meals: "Breakfast & Dinner", stay: "Udaipur" },
        { day_number: 7, title: "Departure", description: "Morning City Palace tour and departure.", meals: "Breakfast", stay: null }
      ]
    };
  }

  if (slug === "swiss-paris-dream") {
    return {
      id: "upcoming-4",
      title: "Swiss Paris Dream Tour",
      slug: "swiss-paris-dream",
      category_id: null,
      destination_id: null,
      scope: "international",
      tour_type: "group",
      group_subtype: "kitchen_staff",
      duration_days: 10,
      duration_nights: 9,
      overview: "An iconic European journey covering the Eiffel Tower, Swiss Alps, and the romantic canals of Venice.",
      highlights: ["Eiffel Tower Summit", "Mt. Titlis with Ice Flyer", "Venice Gondola Ride", "Rhine Falls"],
      accommodation: "4-star European hotels",
      meals_info: "All Indian meals by accompanying chef",
      transport_info: "Premium European Coach",
      inclusions: ["Visa", "Flights", "Accommodation", "All Meals", "Sightseeing"],
      exclusions: ["Optional Tours", "Personal expenses"],
      price_amount: 185000,
      price_currency: "INR",
      taxes_info: "TCS & GST extra",
      pickup_location: "Paris Airport",
      drop_location: "Rome Airport",
      documents_required: ["Valid Passport", "Schengen Visa documents"],
      visa_info: "Schengen Visa required",
      cancellation_policy: "Standard cancellation policy applies",
      terms: "Terms and conditions apply",
      hero_image_url: "/themes/theme-international.jpg",
      is_featured: true,
      source_pdf: null,
      source_pages: null,
      review_status: "verified",
      status: "published",
      is_active: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_name: "Group Tours",
      destination_name: "Europe",
      itinerary: [
        { day_number: 1, title: "Arrival in Paris", description: "Welcome to Paris. Evening Seine River cruise.", meals: "Dinner", stay: "Paris" },
        { day_number: 2, title: "Paris City Tour", description: "Eiffel Tower summit, Louvre (outside), and city drive.", meals: "Breakfast, Lunch, Dinner", stay: "Paris" },
        { day_number: 3, title: "Paris to Switzerland", description: "Drive through French countryside to Switzerland.", meals: "Breakfast, Lunch, Dinner", stay: "Central Switzerland" },
        { day_number: 4, title: "Mt. Titlis", description: "Excursion to Mt. Titlis and Lucerne city tour.", meals: "Breakfast, Lunch, Dinner", stay: "Central Switzerland" },
        { day_number: 5, title: "Jungfraujoch (Optional)", description: "Top of Europe or leisure day in Interlaken.", meals: "Breakfast, Dinner", stay: "Central Switzerland" },
        { day_number: 6, title: "Rhine Falls & Black Forest", description: "Visit the stunning Rhine Falls and German Black Forest.", meals: "Breakfast, Lunch, Dinner", stay: "Zurich Area" },
        { day_number: 7, title: "Switzerland to Innsbruck", description: "Drive to Austria and visit Swarovski Crystal Worlds.", meals: "Breakfast, Lunch, Dinner", stay: "Innsbruck" },
        { day_number: 8, title: "Innsbruck to Venice", description: "Drive to Italy. Enjoy Venice island tour.", meals: "Breakfast, Lunch, Dinner", stay: "Padova Area" },
        { day_number: 9, title: "Rome & Vatican", description: "Colosseum outside view and Vatican City.", meals: "Breakfast, Lunch, Dinner", stay: "Rome" },
        { day_number: 10, title: "Departure", description: "Transfer to airport for flight back home.", meals: "Breakfast", stay: null }
      ]
    };
  }

  const g = generated.find((p) => p.slug === slug);
  if (!g) return null;
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
    sort_order: 0,
    created_at: now,
    updated_at: now,
    category_name: g.category_name,
    destination_name: g.destination_name,
    itinerary: g.itinerary,
  };
}

/**
 * Typed fetch client for the Express API with fallback for static hosting.
 */
async function parse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (res.status === 404) {
      throw new Error(
        "API endpoint not found (404). Please ensure the Node.js backend server is running on port 4000.",
      );
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        `Backend service is unavailable (HTTP ${res.status}). The Node.js server is stopped or unreachable.`,
      );
    }
    throw new Error(
      `Backend service returned HTML (${res.status}). Ensure the Express backend process is active on port 4000.`,
    );
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    throw new Error("Failed to parse JSON response");
  }
  if (!res.ok || body === null || body === undefined) {
    const err = (body as { error?: string })?.error;
    throw new Error(err || `Request failed (${res.status})`);
  }
  return body as T;
}

function qs(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
  );
}

export type PackageListQuery = {
  scope?: "domestic" | "international";
  tourType?: "group" | "customized";
  groupSubtype?: "standard" | "kitchen_staff";
  featured?: boolean;
};

export type ListPackagesResult = {
  items: PackageListItem[];
  sample: boolean;
};

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "yana_admin_token";

function getStoredToken(): string | null {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted iframe/browser modes
  }
}

/** Clear message when the host returned HTML instead of the Node API. */
function backendDown(res: Response): Error | null {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return null;
  return new Error(
    `Admin API is not reachable (HTTP ${res.status}). The Node.js server is not running on this host.`,
  );
}

/**
 * Resilient fetch wrapper:
 * - Automatically sends credentials (cookies) on both same-origin and cross-subdomain requests.
 * - Automatically attaches Authorization: Bearer <token> for browsers restricting cross-site cookies.
 * - Supports VITE_API_URL if frontend and API are hosted on different subdomains/domains.
 */
async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = input.startsWith("http") ? input : `${API_BASE}${input}`;
  const headers = new Headers(init.headers || {});
  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
}

export const api = {
  // ── Auth (dual cookie + bearer token for cross-subdomain resilience) ───────
  async login(email: string, password: string): Promise<{ ok: boolean; token?: string }> {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const down = backendDown(res);
    if (down) throw down;
    const data = await parse<{ ok: boolean; token?: string }>(res);
    if (data.token) setStoredToken(data.token);
    return data;
  },
  async logout(): Promise<{ ok: boolean }> {
    setStoredToken(null);
    try {
      const res = await apiFetch("/api/auth/logout", { method: "POST" });
      return parse(res);
    } catch {
      return { ok: true };
    }
  },
  async me(): Promise<{ ok: boolean; email?: string }> {
    const res = await apiFetch("/api/auth/me");
    return parse(res);
  },

  // ── Public packages ──────────────────────────────────────────────────────────
  async listPackages(
    filters: PackageListQuery = {},
  ): Promise<ListPackagesResult> {
    try {
      const res = await apiFetch(
        `/api/packages${qs({
          scope: filters.scope,
          tourType: filters.tourType,
          groupSubtype: filters.groupSubtype,
          featured: filters.featured,
        })}`,
      );
      return await parse<ListPackagesResult>(res);
    } catch {
      return {
        items: [],
        sample: false,
      };
    }
  },
  async getPackage(slug: string): Promise<PackageDetail> {
    const res = await apiFetch(`/api/packages/${encodeURIComponent(slug)}`);
    return await parse<PackageDetail>(res);
  },

  // ── Public content ──────────────────────────────────────────────────────────
  async listPublicServices(): Promise<unknown[]> {
    try {
      const res = await apiFetch("/api/public/services");
      return await parse(res);
    } catch {
      return [];
    }
  },
  async listPublicFaqs(): Promise<PublicFaq[]> {
    try {
      const res = await apiFetch("/api/public/faqs");
      return await parse(res);
    } catch {
      return [];
    }
  },
  async listPublicThemes(): Promise<unknown[]> {
    try {
      const res = await apiFetch("/api/public/themes");
      return await parse(res);
    } catch {
      return [];
    }
  },
  async listPublicDestinations(): Promise<AdminDestinationRow[]> {
    try {
      const res = await apiFetch("/api/public/destinations");
      return await parse(res);
    } catch {
      return [];
    }
  },
  async listPublicDepartures(): Promise<AdminDepartureRow[]> {
    try {
      const res = await apiFetch("/api/public/departures");
      return await parse(res);
    } catch {
      return [];
    }
  },
  async listPublicHeroSlides(): Promise<AdminHeroRow[]> {
    try {
      const res = await apiFetch("/api/public/hero-slides");
      return await parse(res);
    } catch {
      return [];
    }
  },
  async listPublicTestimonials(): Promise<PublicTestimonial[]> {
    try {
      const res = await apiFetch("/api/public/testimonials");
      return await parse(res);
    } catch {
      return [];
    }
  },
  async listPublicGallery(): Promise<PublicGalleryItem[]> {
    try {
      const res = await apiFetch("/api/public/gallery");
      return await parse(res);
    } catch {
      return [];
    }
  },
  async listPublicOffices(): Promise<PublicOffice[]> {
    try {
      const res = await apiFetch("/api/public/offices");
      return await parse(res);
    } catch {
      return siteConfig.offices.map((o, idx) => ({
        id: `fallback-${idx}`,
        office_name: o.name,
        address: o.address,
        city: null,
        pincode: null,
        phone: siteConfig.phone,
        email: siteConfig.email,
        hours: "Mon – Sat: 9:30 AM – 6:30 PM",
        is_active: true,
        sort_order: idx,
      }));
    }
  },
  async getPublicSettings(): Promise<SiteSettings> {
    try {
      const res = await apiFetch("/api/public/settings");
      return await parse(res);
    } catch {
      return {
        site: {
          phone: siteConfig.phone,
          email: siteConfig.email,
          whatsapp: siteConfig.whatsapp,
          tagline: siteConfig.tagline,
          founded: siteConfig.founded,
          social: siteConfig.social,
        },
        about: {},
        seo: {},
      };
    }
  },
  async saveSettings(
    key: string,
    value: Record<string, unknown>,
  ): Promise<{ ok: boolean }> {
    const res = await apiFetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    return parse(res);
  },

  // ── Enquiry (public) ────────────────────────────────────────────────────────
  async submitEnquiry(body: Record<string, unknown>): Promise<{
    ok: boolean;
    error?: string;
    fieldErrors?: Record<string, string>;
  }> {
    let res: Response;
    try {
      res = await apiFetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      return {
        ok: false,
        error:
          "We couldn't reach the server right now. Please try again shortly.",
      };
    }
    return parse<{
      ok: boolean;
      error?: string;
      fieldErrors?: Record<string, string>;
    }>(res).catch(() => ({ ok: false }));
  },

  // ── Admin: dashboard ────────────────────────────────────────────────────────
  async dashboard(): Promise<{
    enquiries: {
      total: number;
      new: number;
      contacted: number;
      closed: number;
    };
    packages: { total: number; published: number; featured: number };
  }> {
    const res = await apiFetch("/api/admin/dashboard");
    return parse(res);
  },

  // ── Admin: packages ─────────────────────────────────────────────────────────
  async adminPackages(): Promise<{ items: unknown[] }> {
    const res = await apiFetch("/api/admin/packages");
    return parse(res);
  },
  async adminPackage(id: string): Promise<unknown> {
    const res = await apiFetch(`/api/admin/packages/${encodeURIComponent(id)}`);
    return parse(res);
  },
  async savePackage(
    id: string | null,
    data: Record<string, unknown>,
  ): Promise<{
    ok: boolean;
    error?: string;
    fieldErrors?: Record<string, string>;
    slug?: string;
  }> {
    const res = await apiFetch("/api/admin/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data }),
    });
    return parse(res);
  },
  async togglePackageActive(
    id: string,
    active: boolean,
  ): Promise<{ ok: boolean }> {
    const res = await apiFetch(
      `/api/admin/packages/${encodeURIComponent(id)}/active`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      },
    );
    return parse(res);
  },
  async togglePackageFeatured(
    id: string,
    featured: boolean,
  ): Promise<{ ok: boolean }> {
    const res = await apiFetch(
      `/api/admin/packages/${encodeURIComponent(id)}/featured`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      },
    );
    return parse(res);
  },
  async deletePackage(id: string): Promise<{ ok: boolean }> {
    const res = await apiFetch(`/api/admin/packages/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return parse(res);
  },

  // ── Admin: enquiries ────────────────────────────────────────────────────────
  async adminEnquiries(status?: string): Promise<{ items: unknown[] }> {
    const res = await apiFetch(`/api/admin/enquiries${qs({ status })}`);
    return parse(res);
  },
  async setEnquiryStatus(id: string, status: string): Promise<{ ok: boolean }> {
    const res = await apiFetch(
      `/api/admin/enquiries/${encodeURIComponent(id)}/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    return parse(res);
  },

  // ── Admin: generic content modules (keyed by DB table name) ───────────────
  async listModule(module: string): Promise<{ items: unknown[] }> {
    const res = await apiFetch(`/api/admin/${encodeURIComponent(module)}`);
    return parse(res);
  },
  async saveModule(
    module: string,
    body: Record<string, unknown>,
  ): Promise<{ ok: boolean; error?: string }> {
    const res = await apiFetch(`/api/admin/${encodeURIComponent(module)}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parse(res);
  },
  async toggleModule(
    module: string,
    id: string,
    active: boolean,
  ): Promise<{ ok: boolean }> {
    const res = await apiFetch(`/api/admin/${encodeURIComponent(module)}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    return parse(res);
  },
  async deleteModule(module: string, id: string): Promise<{ ok: boolean }> {
    const res = await apiFetch(
      `/api/admin/${encodeURIComponent(module)}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
    return parse(res);
  },

  // ── Upload ──────────────────────────────────────────────────────────────────
  async upload(
    formData: FormData,
  ): Promise<{ ok: boolean; url?: string; error?: string }> {
    const res = await apiFetch("/api/upload", { method: "POST", body: formData });
    return parse(res);
  },
};

