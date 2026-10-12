import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Compass,
  Palmtree,
  Landmark,
  Globe2,
  LucideIcon,
  MapPin,
  ChevronDown,
  Users2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

export interface ThemeCollection {
  title: string;
  tag: string;
  blurb: string;
  href: string;
  icon: LucideIcon;
  images: string[];
  scope: "all" | "domestic" | "international";
}

export const curatedThemesData: ThemeCollection[] = [
  {
    title: "Mountains & the North",
    tag: "Alpine Serenity",
    blurb: "Himalayan valleys, high passes, and pristine alpine calm.",
    href: "/group-tours/domestic",
    icon: Compass,
    images: [
      "/themes/theme-mountains.jpg",
      "/themes/theme-mountains-2.jpg",
    ],
    scope: "domestic",
  },
  {
    title: "Beaches & Islands",
    tag: "Coastal Bliss",
    blurb: "Sun, turquoise waters, and slow tropical island mornings.",
    href: "/packages",
    icon: Palmtree,
    images: [
      "/themes/theme-beaches.jpg",
      "/themes/theme-beaches-2.jpg",
    ],
    scope: "international",
  },
  {
    title: "Heritage & Pilgrimage",
    tag: "Sacred & Timeless",
    blurb: "Timeless monuments, grand architecture, and journeys of the spirit.",
    href: "/group-tours/domestic",
    icon: Landmark,
    images: [
      "/themes/theme-heritage.jpg",
      "/themes/theme-heritage-2.jpg",
    ],
    scope: "domestic",
  },
  {
    title: "International Escapes",
    tag: "Global Horizons",
    blurb: "Iconic world cities, skylines, and horizons beyond India.",
    href: "/group-tours/international",
    icon: Globe2,
    images: [
      "/themes/theme-international.jpg",
      "/themes/theme-international-2.jpg",
    ],
    scope: "international",
  },
];

function ThemeCarouselCard({
  collection,
  index,
}: {
  collection: ThemeCollection;
  index: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDelayRef = useRef<NodeJS.Timeout | null>(null);
  const Icon = collection.icon;

  // Preload secondary images for seamless transition
  useEffect(() => {
    collection.images.slice(1).forEach((imgSrc) => {
      const img = new Image();
      img.src = imgSrc;
    });
  }, [collection.images]);

  // Handle hover-driven automatic carousel slideshow
  useEffect(() => {
    if (isHovered) {
      initialDelayRef.current = setTimeout(() => {
        timerRef.current = setInterval(() => {
          setActiveIndex((prev) => (prev + 1) % collection.images.length);
        }, 2600);
      }, 500);
    } else {
      if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveIndex(0);
    }

    return () => {
      if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, collection.images.length]);

  return (
    <Reveal delay={index * 110}>
      <Link
        to={collection.href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        className="group relative flex aspect-[3/4] min-h-[380px] w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/50 bg-[#10213a] p-6 shadow-[0_20px_50px_-20px_rgba(16,33,58,0.38)] transition-all duration-500 hover:-translate-y-2.5 hover:border-[#0b66e4]/40 hover:shadow-[0_32px_70px_-20px_rgba(11,102,228,0.45)]"
      >
        {/* Full-Bleed Layered Image Carousel with smooth crossfade & subtle Ken Burns scale */}
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          {collection.images.map((imgSrc, idx) => {
            const isActive = idx === activeIndex;
            return (
              <img
                key={imgSrc}
                src={imgSrc}
                alt={`${collection.title} slide ${idx + 1}`}
                loading="eager"
                className={`absolute inset-0 h-full w-full object-cover brightness-[0.92] transition-all duration-1000 ease-out group-hover:scale-108 ${
                  isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-100 z-0 pointer-events-none"
                }`}
              />
            );
          })}
        </div>

        {/* Elegant Multi-stop Scrim for high contrast & pure text clarity */}
        <div
          className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-300 group-hover:via-black/50"
          aria-hidden
        />

        {/* Top Header: Floating Frosted Glass Category Tag & Icon */}
        <div className="relative z-20 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#f8d77f] backdrop-blur-md shadow-sm">
            <Icon className="h-3.5 w-3.5 text-[#f8d77f]" aria-hidden />
            <span>{collection.tag}</span>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-[#0b66e4] group-hover:border-[#0b66e4] group-hover:rotate-45 group-hover:scale-110">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        {/* Bottom Content: Modern Typography & Narrative */}
        <div className="relative z-20 mt-auto pt-8">
          <h3 className="font-heading text-xl font-extrabold tracking-tight text-white transition-colors duration-200 group-hover:text-[#f8d77f] sm:text-2xl drop-shadow-sm">
            {collection.title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-white/85 line-clamp-3 sm:text-sm drop-shadow-sm">
            {collection.blurb}
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#f8d77f] transition-all duration-300 group-hover:translate-x-1">
            <span>Explore packages</span>
            <span className="text-sm leading-none">→</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function CuratedThemes() {
  const [browseDropdownOpen, setBrowseDropdownOpen] = useState(false);
  const [themes, setThemes] = useState<ThemeCollection[]>(curatedThemesData);
  const browseDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/public/themes")
      .then((res) => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ThemeCollection[] = data.map((t) => ({
            title: t.title,
            tag: t.tag || "CURATED THEME",
            blurb: t.blurb || "",
            href: t.href || "/packages",
            icon: t.scope === "international" ? Globe2 : Compass,
            images: t.image_url ? [t.image_url] : ["/themes/theme-mountains.jpg"],
            scope: t.scope || "all",
          }));
          setThemes(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        browseDropdownRef.current &&
        !browseDropdownRef.current.contains(event.target as Node)
      ) {
        setBrowseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Section Header */}
      <Reveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="eyebrow text-[#ad7f19]">Curated themes</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#10213a] sm:text-2xl md:text-3xl">
              Journeys arranged for every kind of traveller
            </h2>
          </div>
          
          {/* Action Controls: Advanced Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Advanced Browse Dropdown Menu */}
            <div ref={browseDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setBrowseDropdownOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-gradient-to-r from-primary to-[#0052cc] px-4 py-2 text-xs font-bold text-white shadow-[0_10px_22px_-8px_rgba(11,102,228,0.55)] transition-all duration-200 hover:shadow-[0_14px_28px_-8px_rgba(11,102,228,0.7)] hover:scale-[1.02] focus:outline-none sm:text-sm"
                aria-expanded={browseDropdownOpen}
              >
                <span>Browse Packages</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-white/90 transition-transform duration-200",
                    browseDropdownOpen && "rotate-180",
                  )}
                />
              </button>

              {browseDropdownOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-border-soft bg-white/98 p-2 shadow-[0_26px_56px_-18px_rgba(16,33,58,0.32)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ad7f19]">
                    Explore Destinations
                  </div>

                  <Link
                    to="/packages?scope=domestic"
                    onClick={() => setBrowseDropdownOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-lavender"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-deep transition-colors group-hover:text-primary">
                        Domestic Tours
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        India & Himalayan Journeys
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/packages?scope=international"
                    onClick={() => setBrowseDropdownOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-lavender"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Globe2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-deep transition-colors group-hover:text-primary">
                        International Tours
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        Europe, Bali, Dubai & Beyond
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/group-tours"
                    onClick={() => setBrowseDropdownOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-lavender"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Users2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-deep transition-colors group-hover:text-primary">
                        Group Departures
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        Escorted Social Departures
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/customized-tours"
                    onClick={() => setBrowseDropdownOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-lavender"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-deep transition-colors group-hover:text-primary">
                        Customized Packages
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        Tailor-Made Private Trips
                      </div>
                    </div>
                  </Link>

                  <div className="mt-1 border-t border-border-soft/60 pt-1">
                    <Link
                      to="/packages"
                      onClick={() => setBrowseDropdownOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/8"
                    >
                      <span>View All Packages</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Grid Alignment with Modern Luxury Glassmorphic Design */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {themes.map((collection, index) => (
          <ThemeCarouselCard
            key={collection.title}
            collection={collection}
            index={index}
          />
        ))}
      </div>
    </>
  );
}
