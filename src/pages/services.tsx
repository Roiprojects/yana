
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Globe2,
  Compass,
  Heart,
  Landmark,
  Building2,
  Plane,
  FileCheck,
  Coins,
  BedDouble,
  Ship,
  Smile,
  LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { EnquiryCta } from "@/components/marketing/enquiry-cta";
import { api } from "@/lib/api/client";
import { useEnquiryModal } from "@/components/providers/enquiry-modal-context";

// Custom AI-generated background images (strictly landscape, architecture, nature — NO human faces, NO bike license numbers)
const serviceMeta: Record<
  string,
  { image: string; tag: string; icon: LucideIcon; link?: string }
> = {
  "Domestic Packages": {
    image: "/services/service-domestic.jpg",
    tag: "Incredible India",
    icon: MapPin,
    link: "/packages?scope=domestic",
  },
  "International Packages": {
    image: "/services/service-international.jpg",
    tag: "Global Horizons",
    icon: Globe2,
    link: "/packages?scope=international",
  },
  Cruises: {
    image: "/services/service-cruises.jpg",
    tag: "Ocean & River Voyages",
    icon: Ship,
    link: "/packages?q=cruise",
  },
  "Childrens Programme": {
    image: "/services/service-childrens-programme.jpg",
    tag: "Family & Kids Fun",
    icon: Smile,
    link: "/packages?q=family",
  },
  "Children's Programme": {
    image: "/services/service-childrens-programme.jpg",
    tag: "Family & Kids Fun",
    icon: Smile,
    link: "/packages?q=family",
  },
  "Bike Trips": {
    image: "/services/service-biketrips.jpg",
    tag: "Mountain Expeditions",
    icon: Compass,
    link: "/packages?q=bike",
  },
  "Honeymoon Packages": {
    image: "/services/service-honeymoon.jpg",
    tag: "Romantic Escapes",
    icon: Heart,
    link: "/packages?q=honeymoon",
  },
  "Historic Destinations": {
    image: "/services/service-historic.jpg",
    tag: "Heritage & Culture",
    icon: Landmark,
    link: "/packages?q=heritage",
  },
  "Pilgrimage Packages": {
    image: "/services/service-pilgrimage.jpg",
    tag: "Spiritual Journeys",
    icon: Sparkles,
    link: "/packages?q=pilgrimage",
  },
  MICE: {
    image: "/services/service-mice.jpg",
    tag: "Corporate & Events",
    icon: Building2,
  },
  "Flight Booking": {
    image: "/services/service-flight.jpg",
    tag: "Air Ticketing",
    icon: Plane,
  },
  Visa: {
    image: "/services/service-visa.jpg",
    tag: "Documentation",
    icon: FileCheck,
  },
  Forex: {
    image: "/services/service-forex.jpg",
    tag: "Currency Exchange",
    icon: Coins,
  },
  "Hotel Booking": {
    image: "/services/service-hotel.jpg",
    tag: "Luxury Stays",
    icon: BedDouble,
  },
};

const fallbackServices = [
  {
    id: "1",
    name: "Domestic Packages",
    description: "Tours across India, planned end to end.",
  },
  {
    id: "2",
    name: "International Packages",
    description: "Journeys to destinations around the world.",
  },
  {
    id: "3",
    name: "Cruises",
    description: "Luxury ocean and river cruise journeys to breathtaking destinations worldwide.",
  },
  {
    id: "4",
    name: "Childrens Programme",
    description: "Fun, safe, and engaging youth travel activities curated for family holidays.",
  },
  {
    id: "5",
    name: "Bike Trips",
    description: "Guided motorcycle journeys along scenic routes.",
  },
  {
    id: "6",
    name: "Honeymoon Packages",
    description: "Romantic getaways planned for two.",
  },
  {
    id: "7",
    name: "Historic Destinations",
    description: "Tours built around heritage and culture.",
  },
  {
    id: "8",
    name: "Pilgrimage Packages",
    description: "Spiritual journeys to revered destinations.",
  },
  {
    id: "9",
    name: "MICE",
    description: "Meetings, incentives, conferences, and events.",
  },
  {
    id: "10",
    name: "Flight Booking",
    description: "Assistance booking domestic and international flights.",
  },
  {
    id: "11",
    name: "Visa",
    description: "Support with visa applications and documentation.",
  },
  {
    id: "12",
    name: "Forex",
    description: "Foreign currency exchange for your trip.",
  },
  {
    id: "13",
    name: "Hotel Booking",
    description: "Accommodation arranged to suit your stay.",
  },
];

type ServiceItem = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
};

export function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const { open: openEnquiry } = useEnquiryModal();

  useEffect(() => {
    let cancelled = false;
    api
      .listPublicServices()
      .then((res) => {
        if (cancelled) return;
        const items = res as ServiceItem[];
        setServices(
          Array.isArray(items) && items.length > 0 ? items : fallbackServices,
        );
      })
      .catch(() => {
        if (!cancelled) setServices(fallbackServices);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const list = services.length > 0 ? services : fallbackServices;

  return (
    <>
      <PageHeader
        title="Our Services"
        subtitle="Everything you need for a seamless journey, presented with a more premium and attractive experience."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        image="photo-1469474968028-56623f02e42e"
      />

      <Section>
        <Reveal>
          <div className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow text-[#ad7f19]">What we offer</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-deep md:text-4xl">
                From the first enquiry to the last mile of the journey
              </h2>
              <p className="mt-4 text-base leading-8 text-text-secondary">
                Beyond full tour planning, Yana coordinates every individual
                element of your travel — flights, visas, stays, forex, and guided
                itineraries — so your journey is effortless and memorable.
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-[#eadfcf] bg-[linear-gradient(135deg,#fffefb,#f7f1e4)] p-6 shadow-[0_22px_52px_-34px_rgba(16,33,58,0.24)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary text-white shadow-[0_16px_30px_-18px_rgba(11,102,228,0.8)]">
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-sm leading-7 text-text-secondary">
                The service layer operates as a comprehensive travel concierge,
                delivering tailored convenience, fast response times, and
                verified supplier standards.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item, i) => {
            const meta = serviceMeta[item.name] ?? {
              image:
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85",
              tag: "Concierge Service",
              icon: Sparkles,
            };
            const Icon = meta.icon;

            const cardContent = (
              <div className="group relative flex h-full min-h-[310px] flex-col justify-between overflow-hidden rounded-[1.8rem] border border-white/40 bg-deep p-6 shadow-[0_18px_42px_-18px_rgba(16,33,58,0.38)] transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_28px_60px_-18px_rgba(11,102,228,0.4)]">
                {/* Scenic Background Image */}
                <img
                  src={item.image_url || meta.image}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover brightness-[1.02] transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />

                {/* Bottom-only Gradient Overlay — No dark shade at the top */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                  aria-hidden
                />

                {/* Top Glassmorphic Tag & Icon */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/35 text-white shadow-md backdrop-blur-md ring-1 ring-white/30 transition-all duration-300 group-hover:bg-primary group-hover:scale-110 group-hover:shadow-[0_10px_22px_-6px_rgba(11,102,228,0.6)]">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <span className="rounded-full border border-white/25 bg-black/45 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#f8d77f] backdrop-blur-md shadow-sm">
                    {meta.tag}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 mt-8">
                  <h3 className="font-heading text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-[#f8d77f]">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85 line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>
            );

            return (
              <Reveal key={item.id ?? item.name} delay={(i % 3) * 90}>
                {meta.link ? (
                  <Link to={meta.link} className="block h-full">
                    {cardContent}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEnquiry()}
                    className="block h-full w-full text-left focus:outline-none"
                  >
                    {cardContent}
                  </button>
                )}
              </Reveal>
            );
          })}
        </div>
      </Section>

      <EnquiryCta />
    </>
  );
}
