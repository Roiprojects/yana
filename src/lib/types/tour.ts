export type TourScope = "domestic" | "international";
export type TourType = "group" | "customized";
export type GroupSubtype = "standard" | "kitchen_staff";
export type ContentStatus = "draft" | "published";
export type ReviewStatus = "pending" | "in_review" | "verified";
export type EnquiryType = "general" | "customized";
export type EnquiryStatus = "new" | "contacted" | "closed";

/** Row shape of the `tour_packages` table (inlined from the old Supabase types). */
export type TourPackagesRow = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  destination_id: string | null;
  scope: TourScope;
  tour_type: TourType;
  group_subtype: GroupSubtype | null;
  duration_days: number | null;
  duration_nights: number | null;
  overview: string | null;
  highlights: string[] | null;
  accommodation: string | null;
  meals_info: string | null;
  transport_info: string | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
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
  review_status: ReviewStatus;
  status: ContentStatus;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ItineraryDay = {
  day_number: number;
  title: string | null;
  description: string | null;
  meals: string | null;
  stay: string | null;
  image_url?: string | null;
};

/** Fields needed to render a package card in listings. */
export type PackageListItem = Pick<
  TourPackagesRow,
  | "id"
  | "title"
  | "slug"
  | "scope"
  | "tour_type"
  | "duration_days"
  | "duration_nights"
  | "price_amount"
  | "price_currency"
  | "hero_image_url"
  | "overview"
> & {
  category_name?: string | null;
  destination_name?: string | null;
};

/** Full package for the detail page. */
export type PackageDetail = TourPackagesRow & {
  itinerary: ItineraryDay[];
  category_name?: string | null;
  theme_name?: string | null;
  destination_name?: string | null;
};
