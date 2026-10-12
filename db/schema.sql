-- Yana Travels — PostgreSQL schema (client's roiclients Postgres, PG14).
-- Plain Postgres (not Supabase): no auth.users FKs, no RLS. Authorization is enforced
-- in the application layer. Idempotent — safe to re-run.

-- Tour packages (denormalised: category/destination kept as text; list fields as jsonb).
create table if not exists tour_packages (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text unique not null,
  scope             text not null check (scope in ('domestic','international')),
  tour_type         text not null check (tour_type in ('group','customized')),
  group_subtype     text check (group_subtype in ('standard','kitchen_staff')),
  category_name     text,
  destination_name  text,
  country           text,
  duration_days     int,
  duration_nights   int,
  overview          text,
  highlights        jsonb not null default '[]'::jsonb,
  itinerary         jsonb not null default '[]'::jsonb,
  inclusions        jsonb not null default '[]'::jsonb,
  exclusions        jsonb not null default '[]'::jsonb,
  price_amount      numeric,
  price_currency    text not null default 'INR',
  taxes_info        text,
  hero_image_url    text,
  is_featured       boolean not null default false,
  source_pdf        text,
  source_pages      text,
  review_status     text not null default 'verified'
                    check (review_status in ('pending','in_review','verified')),
  status            text not null default 'published'
                    check (status in ('draft','published')),
  is_active         boolean not null default true,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_packages_scope_type on tour_packages (scope, tour_type);
create index if not exists idx_packages_visibility  on tour_packages (status, is_active, review_status);
create index if not exists idx_packages_featured    on tour_packages (is_featured);

-- Services (confirmed list).
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  status      text not null default 'published'
);

-- Contact / offices (no bank details, ever).
create table if not exists contact_info (
  id          uuid primary key default gen_random_uuid(),
  office_name text not null,
  address     text,
  city        text,
  pincode     text,
  phone       text,
  email       text,
  hours       text,
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

-- Enquiries (public inserts from the site; staff read/manage).
create table if not exists enquiries (
  id                   uuid primary key default gen_random_uuid(),
  type                 text not null check (type in ('general','customized')),
  name                 text not null,
  phone                text not null,
  email                text,
  destination_interest text,
  package_slug         text,
  travellers           int,
  travel_date          date,
  budget_range         text,
  hotel_category       text,
  scope                text check (scope in ('domestic','international')),
  message              text,
  status               text not null default 'new'
                       check (status in ('new','contacted','closed')),
  source               text,
  created_at           timestamptz not null default now()
);

create index if not exists idx_enquiries_status on enquiries (status, created_at desc);

-- Hero slides / quotes
create table if not exists hero_slides (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  subtitle          text,
  image_url         text not null,
  video_url         text,
  mobile_video_url  text,
  cta_primary_text  text default 'Explore packages',
  cta_primary_link  text default '/packages',
  cta_secondary_text text default 'Plan a custom trip',
  sort_order        int not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Destinations
create table if not exists destinations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  scope       text not null check (scope in ('domestic','international')),
  country     text,
  state       text,
  description text,
  image_url   text,
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Testimonials
create table if not exists testimonials (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  location      text,
  photo_url     text,
  rating        int not null default 5,
  review        text not null,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- Gallery
create table if not exists gallery (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text default 'General',
  image_url   text not null,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- FAQs
create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  category   text default 'General',
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Categories
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  icon_name   text,
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

-- General Site Settings (Key-Value configuration)
create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

