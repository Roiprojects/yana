import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, Globe2, MapPin, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { api } from "@/lib/api/client";
import type { AdminDepartureRow } from "@/lib/types/admin";
import type { PackageListItem } from "@/lib/types/tour";

const fallbackTours: PackageListItem[] = [
  {
    id: "upcoming-1",
    title: "Mesmerizing Kashmir Escape",
    slug: "kashmir-paradise-5n6d",
    scope: "domestic",
    tour_type: "group",
    duration_days: 6,
    duration_nights: 5,
    price_amount: 26900,
    price_currency: "INR",
    hero_image_url: "/packages/kashmir-paradise-5n6d.jpg",
    overview: "Experience heaven on earth. Shikara rides on Dal Lake, snowcaps at Gulmarg, and picturesque valleys of Pahalgam.",
  },
  {
    id: "upcoming-2",
    title: "Best of Europe 13 Days Group Tour",
    slug: "best-of-europe-12n13d",
    scope: "international",
    tour_type: "group",
    duration_days: 13,
    duration_nights: 12,
    price_amount: 280000,
    price_currency: "INR",
    hero_image_url: "/packages/best-of-europe-12n13d.jpg",
    overview: "An iconic European escorted group tour through the Alps, historic capitals, and romantic canals.",
  },
  {
    id: "upcoming-3",
    title: "Chardham Yatra by Helicopter",
    slug: "chardham-helicopter-5n6d",
    scope: "domestic",
    tour_type: "group",
    duration_days: 6,
    duration_nights: 5,
    price_amount: 245000,
    price_currency: "INR",
    hero_image_url: "/packages/chardham-helicopter-5n6d.jpg",
    overview: "Sacred darshan at Yamunotri, Gangotri, Kedarnath & Badrinath with VIP priority darshan and luxury stays.",
  },
  {
    id: "upcoming-4",
    title: "Leh · Ladakh · Kargil High Passes",
    slug: "leh-ladakh-kargil-6n7d",
    scope: "domestic",
    tour_type: "group",
    duration_days: 7,
    duration_nights: 6,
    price_amount: 35500,
    price_currency: "INR",
    hero_image_url: "/packages/leh-ladakh-kargil-6n7d.jpg",
    overview: "High passes, turquoise lakes, ancient monasteries, and majestic Nubra Valley sand dunes.",
  },
];

function DepartureCard({ departure }: { departure: AdminDepartureRow }) {
  const linkHref = departure.package_slug ? `/packages/${departure.package_slug}` : "/packages";
  const status = (departure.status || "").toLowerCase();
  const isFillingFast = status.includes("filling") || (departure.seats_available || "").toLowerCase().includes("filling");

  return (
    <Link
      to={linkHref}
      className="group relative block h-[420px] w-full overflow-hidden rounded-[2rem] bg-[#051024] shadow-[0_12px_40px_-16px_rgba(16,33,58,0.2)] transition-shadow duration-500 hover:shadow-[0_24px_50px_-16px_rgba(11,102,228,0.3)]"
    >
      {/* Background Image with slow zoom */}
      <img
        src={departure.image_url || "/themes/theme-mountains.jpg"}
        alt={departure.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
      />

      {/* Rich Dual-Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/95 opacity-85 transition-opacity duration-500 group-hover:opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-[#030914]/50 to-transparent opacity-85" />

      {/* Top Floating Badges */}
      <div className="absolute left-5 top-5 flex items-center gap-2">
        {departure.boarding_point ? (
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white shadow-lg backdrop-blur-md">
            <MapPin className="h-3 w-3 text-sky-400" />
            {departure.boarding_point}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold tracking-widest text-white shadow-lg backdrop-blur-md">
            <Globe2 className="h-3 w-3 text-primary" />
            FIXED DEPARTURE
          </span>
        )}
      </div>

      <div className="absolute right-5 top-5">
        <span className="flex items-center gap-1 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-black text-[#10213a] shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          {departure.price || "Enquire"}
        </span>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end">
        {/* Departure Date Badge */}
        <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-[#f8d77f] drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-1">
          <CalendarDays className="h-3.5 w-3.5 text-[#f8d77f]" />
          <span>{departure.departure_date}</span>
          {departure.return_date && (
            <>
              <span className="mx-1 h-1 w-1 rounded-full bg-[#f8d77f]/50" />
              <span className="text-white/85">to {departure.return_date}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-bold leading-snug text-white drop-shadow-md transition-transform duration-500 group-hover:-translate-y-1 sm:text-2xl">
          {departure.title}
        </h3>

        {/* Status / Seats Left Pill */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
              isFillingFast
                ? "bg-amber-500/90 text-white"
                : "bg-emerald-600/90 text-white"
            }`}
          >
            {departure.status || "Guaranteed Departure"}
          </span>
          {departure.seats_available && (
            <span className="text-xs text-white/80 font-medium">
              • {departure.seats_available}
            </span>
          )}
        </div>

        {/* Hover Action */}
        <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-in-out group-hover:grid-rows-[1fr] group-hover:opacity-100">
          <div className="overflow-hidden">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-primary">
              View Departure Details <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/10 transition-colors duration-500 group-hover:border-white/30" />
    </Link>
  );
}

function FallbackCard({ tour }: { tour: PackageListItem }) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: tour.price_currency || "INR",
    maximumFractionDigits: 0,
  }).format(tour.price_amount || 0);

  return (
    <Link
      to={`/packages/${tour.slug}`}
      className="group relative block h-[420px] w-full overflow-hidden rounded-[2rem] bg-[#051024] shadow-[0_12px_40px_-16px_rgba(16,33,58,0.2)] transition-shadow duration-500 hover:shadow-[0_24px_50px_-16px_rgba(11,102,228,0.3)]"
    >
      <img
        src={tour.hero_image_url || ""}
        alt={tour.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-[#030914]/40 to-transparent opacity-80" />

      <div className="absolute left-5 top-5 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] font-bold tracking-widest text-white shadow-lg backdrop-blur-md transition-colors duration-300 group-hover:bg-primary/90 group-hover:border-primary">
          {tour.scope === "international" ? <Globe2 className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
          {tour.scope.toUpperCase()}
        </span>
      </div>

      <div className="absolute right-5 top-5">
        <span className="flex items-center gap-1 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-black text-[#10213a] shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          {formattedPrice}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#f8d77f] drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-2">
          <Clock className="h-3.5 w-3.5" />
          <span>{tour.duration_nights}N / {tour.duration_days}D</span>
          <span className="mx-1.5 h-1 w-1 rounded-full bg-[#f8d77f]/50" />
          <span className="text-white/90">{tour.tour_type === "group" ? "Group Tour" : "Customized"}</span>
        </div>
        
        <h3 className="mb-2 text-2xl font-bold leading-snug text-white drop-shadow-md transition-transform duration-500 group-hover:-translate-y-2">
          {tour.title}
        </h3>
        
        <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-in-out group-hover:grid-rows-[1fr] group-hover:opacity-100">
          <div className="overflow-hidden">
            <p className="mb-5 mt-1 text-sm leading-relaxed text-white/80 line-clamp-2">
              {tour.overview}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-primary">
              View Details <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/10 transition-colors duration-500 group-hover:border-white/30" />
    </Link>
  );
}

export function UpcomingToursSection() {
  const [departures, setDepartures] = useState<AdminDepartureRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .listPublicDepartures()
      .then((items) => {
        if (!cancelled) {
          setDepartures(Array.isArray(items) ? items : []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasLiveDepartures = loaded && departures.length > 0;

  return (
    <Section className="relative bg-[linear-gradient(180deg,#faf6ed,#fffdf8)] py-16 sm:py-24">
      <Reveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="eyebrow text-[#ad7f19]">Curated Departures</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#10213a] sm:text-2xl md:text-3xl">
              Upcoming Premium Group Tours
            </h2>
          </div>
          <Link
            to="/packages"
            className="group flex items-center gap-2 rounded-full border border-border-soft bg-white px-5 py-2.5 text-sm font-bold text-[#10213a] shadow-sm transition-all hover:border-[#0b66e4]/30 hover:bg-[#0b66e4]/5 hover:text-[#0b66e4]"
          >
            Explore all dates
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {hasLiveDepartures
          ? departures.slice(0, 8).map((dep, i) => (
              <Reveal key={dep.id} delay={i * 100}>
                <DepartureCard departure={dep} />
              </Reveal>
            ))
          : fallbackTours.map((tour, i) => (
              <Reveal key={tour.id} delay={i * 100}>
                <FallbackCard tour={tour} />
              </Reveal>
            ))}
      </div>
    </Section>
  );
}
