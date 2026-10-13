/** Pure type definitions for admin/content modules. No server-only imports. */

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

export type EditablePackage = {
  id: string;
  title: string;
  slug: string;
  scope: "domestic" | "international";
  tour_type: "group" | "customized";
  category_name: string | null;
  theme_name?: string | null;
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
  source_pdf?: string | null;
  is_featured: boolean;
  is_active: boolean;
  status: "draft" | "published";
};

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

export type AdminServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url?: string | null;
  is_active: boolean;
  sort_order: number;
};

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

export type AdminGalleryRow = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

export type AdminFaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
};

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

export type AdminHeroRow = {
  id: string;
  title: string;
  subtitle: string | null;
  video_url?: string | null;
  mobile_video_url?: string | null;
  image_url: string;
  cta_primary_text: string | null;
  cta_primary_link: string | null;
  is_active: boolean;
  sort_order: number;
};

export type AdminDepartureRow = {
  id: string;
  title: string;
  package_slug: string | null;
  departure_date: string;
  return_date: string | null;
  boarding_point: string | null;
  price: string | null;
  seats_available: string | null;
  status: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};
