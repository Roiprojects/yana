import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Building2,
  Clock,
  Phone,
  MessageSquare,
  ArrowUpRight,
  ArrowRight,
  Globe2,
  Landmark,
  Heart,
  FileCheck,
  Coins,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { EnquiryCta } from "@/components/marketing/enquiry-cta";
import { useSiteSettings } from "@/components/providers/site-settings-context";
import { useEnquiryModal } from "@/components/providers/enquiry-modal-context";
import { whatsappLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import type { PublicOffice } from "@/lib/types/content";

const detailedOfferings = [
  {
    icon: MapPin,
    tag: "Domestic",
    title: "India Group Tours",
    desc: "Curated escorted journeys across Kashmir, Ladakh, Kerala, Chardham & Northeast.",
    gradient: "from-[#0b66e4] to-[#1e3fae]",
    link: "/group-tours/domestic",
  },
  {
    icon: Globe2,
    tag: "International",
    title: "Global Departures",
    desc: "Escorted world tours covering Europe, Bali, Dubai, Singapore & exotic horizons.",
    gradient: "from-[#4f46e5] to-[#3730a3]",
    link: "/group-tours/international",
  },
  {
    icon: Sparkles,
    tag: "Tailored",
    title: "Customized Holidays",
    desc: "100% tailor-made private itineraries shaped around your personal pace and dates.",
    gradient: "from-[#c99b2d] to-[#9a741c]",
    link: "/customized-tours",
  },
  {
    icon: Landmark,
    tag: "Spiritual",
    title: "Pilgrimage Journeys",
    desc: "Sacred temple yatras with dedicated care, slower pacing, and verified stays.",
    gradient: "from-[#d97706] to-[#b45309]",
    link: "/packages?q=pilgrimage",
  },
  {
    icon: Heart,
    tag: "Romantic",
    title: "Honeymoon Packages",
    desc: "Handcrafted romantic escapes with luxury pool villas and private dining.",
    gradient: "from-[#e11d48] to-[#be123c]",
    link: "/packages?q=honeymoon",
  },
  {
    icon: Building2,
    tag: "Corporate",
    title: "MICE & Conferences",
    desc: "Corporate offsites, leadership summits, team retreats, and group incentive travel.",
    gradient: "from-[#0284c7] to-[#0369a1]",
    link: "/services",
  },
  {
    icon: FileCheck,
    tag: "Logistics",
    title: "Flights & Visa Desk",
    desc: "Hassle-free air ticketing, visa consultation, documentation, and permits.",
    gradient: "from-[#059669] to-[#047857]",
    link: "/services",
  },
  {
    icon: Coins,
    tag: "Concierge",
    title: "Forex & Luxury Stays",
    desc: "Foreign currency exchange, verified boutique hotel stays, and 24/7 care.",
    gradient: "from-[#7c3aed] to-[#6d28d9]",
    link: "/services",
  },
];

const fallbackValues = [
  {
    icon: Compass,
    title: "End-to-end planning",
    desc: "One team handling stays, sightseeing, transfers, and documentation with a more polished travel experience.",
  },
  {
    icon: HeartHandshake,
    title: "Personal attention",
    desc: "Itineraries shaped around how you like to travel, not a fixed template or one-size-fits-all route.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted support",
    desc: "A reliable team you can reach before departure and while your journey is in motion.",
  },
];

function officeAddress(o: PublicOffice): string {
  return [o.address, o.city, o.pincode].filter(Boolean).join(", ");
}

export function AboutPage() {
  const { founded, about } = useSiteSettings();
  const [offices, setOffices] = useState<PublicOffice[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .listPublicOffices()
      .then((res) => {
        if (!cancelled) setOffices(res);
      })
      .catch(() => {
        if (!cancelled) setOffices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const headline = about?.headline || "Welcome to Yana Travels";

  const rawIntro = about?.intro;
  const intro: string[] =
    Array.isArray(rawIntro) && rawIntro.length > 0
      ? rawIntro
      : typeof rawIntro === "string" && rawIntro.trim().length > 0
      ? rawIntro
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [
          `Yana Travels was founded in ${founded}. We are a team of travel experts with deep knowledge of historic, scenic, and culturally rich destinations across India and abroad.`,
          "We understand the importance of your time, and our aim is to make every getaway memorable. Be it a personal holiday, a leisure tour, or a corporate travel plan, we work to balance comfort, coordination, and value while keeping the journey smooth from start to finish.",
          "From flights and stays to documentation, day-to-day planning, food, activities, and support, we handle the details so your experience feels curated instead of stressful. We also customize around your needs whenever the journey calls for it.",
        ];

  const values: { title: string; desc: string; icon?: typeof Compass }[] =
    Array.isArray(about?.values) && about.values.length > 0
      ? about.values.map((v) => ({ title: v.title, desc: v.desc }))
      : fallbackValues;

  const { open: openEnquiry } = useEnquiryModal();
  const { whatsapp } = useSiteSettings();

  const defaultOffices = [
    {
      name: "Udupi",
      tag: "Corporate Headquarters",
      tagColor: "text-primary bg-primary/10 border-primary/25",
      address: "Corporate Office, Near City Bus Stand, Udupi, Karnataka - 576101",
      phone: "+91 9513588143",
      hours: "Mon – Sat: 9:30 AM – 6:30 PM",
      mapQuery: "Yana Travels Udupi Karnataka",
      image: "/brand/office-udupi.jpg",
    },
    {
      name: "Bengaluru",
      tag: "Capital Branch",
      tagColor: "text-[#ad7f19] bg-[#f8efe0] border-[#e8decb]",
      address: "#20, 3rd Floor, S L Plaza, 8th Cross Sampige Road, Malleshwaram, Bengaluru - 560003",
      phone: "+91 9513588143",
      hours: "Mon – Sat: 9:30 AM – 6:30 PM",
      mapQuery: "S L Plaza Sampige Road Malleshwaram Bengaluru",
      image: "/brand/office-bengaluru.jpg",
    },
    {
      name: "Hubli",
      tag: "Regional Branch",
      tagColor: "text-[#2e9e6b] bg-[#eef8f2] border-[#c8ebd6]",
      address: "#45, 3rd Floor, Satellite Complex, Koppikar Road, Hubli - 580020",
      phone: "+91 9513588143",
      hours: "Mon – Sat: 9:30 AM – 6:30 PM",
      mapQuery: "Satellite Complex Koppikar Road Hubli",
      image: "/brand/office-hubli.jpg",
    },
  ];

  const officeList =
    offices.length > 0
      ? offices.map((o) => {
          const matched = defaultOffices.find(
            (d) =>
              d.name.toLowerCase() === o.office_name.toLowerCase() ||
              o.office_name.toLowerCase().includes(d.name.toLowerCase()) ||
              (o.city && d.name.toLowerCase().includes(o.city.toLowerCase())),
          );
          const fullAddr = [o.address, o.city, o.pincode].filter(Boolean).join(", ");
          return {
            name: o.office_name,
            tag: matched?.tag || "Branch Office",
            tagColor: matched?.tagColor || "text-primary bg-primary/10 border-primary/25",
            address: o.address || fullAddr || matched?.address || "",
            phone: o.phone || matched?.phone || "+91 9513588143",
            hours: o.hours || matched?.hours || "Mon – Sat: 9:30 AM – 6:30 PM",
            mapQuery: `${o.office_name} ${o.address || fullAddr}`,
            image: matched?.image || "/brand/office-udupi.jpg",
          };
        })
      : defaultOffices;

  return (
    <>
      <PageHeader
        title="About Yana Travels"
        subtitle=""
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        image="photo-1548013146-72479768bada"
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <Reveal>
            <div className="max-w-3xl">
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] md:text-4xl">
                {headline}
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-8 text-text-secondary">
                {intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-[1.9rem] border border-[#eadfcf] bg-[linear-gradient(135deg,#fffefb,#f7f1e4)] p-7 shadow-[0_24px_56px_-34px_rgba(16,33,58,0.28)]">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-primary text-white shadow-[0_18px_34px_-20px_rgba(11,102,228,0.8)]">
                <Sparkles className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-xl font-extrabold tracking-[-0.03em] text-deep">
                Why the brand feels stronger now
              </h3>
              <ul className="mt-5 space-y-3">
                {[
                  "Brighter luxury styling with stronger visual hierarchy",
                  "More elegant section spacing and premium card treatment",
                  "A cleaner expression of trust, comfort, and curated service",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-text-secondary"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#c99b2d]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="soft">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow text-[#ad7f19]">What we do</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-deep md:text-4xl">
                Travel services arranged around real needs
              </h2>
              <p className="mt-3 text-base leading-relaxed text-text-secondary">
                Comprehensive holiday solutions designed with comfort, transparency, and personal attention at every step.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-2.5 text-xs font-bold text-primary shadow-sm transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-md"
            >
              <span>Explore All Services</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {detailedOfferings.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 60}>
                <Link
                  to={item.link}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.8rem] border border-[#eadfcf] bg-white p-6 shadow-[0_16px_36px_-24px_rgba(16,33,58,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_26px_50px_-18px_rgba(11,102,228,0.2)]"
                >
                  {/* Top Subtle Light Line */}
                  <span
                    className="hairline absolute inset-x-6 top-0 h-[2px] rounded-b-full bg-gradient-to-r from-transparent via-[#c99b2d]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />

                  <div>
                    {/* Header: Icon & Tag */}
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <span className="rounded-full border border-[#eadfcf] bg-[#fffdf8] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#ad7f19] shadow-2xs">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold tracking-tight text-deep transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#f0e8d8] pt-3.5">
                    <span className="text-[11px] font-semibold text-text-secondary group-hover:text-deep transition-colors">
                      Learn more
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 110}>
              <div className="h-full rounded-[1.7rem] border border-[#eadfcf] bg-white p-7 shadow-[0_22px_48px_-30px_rgba(16,33,58,0.26)]">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[#f8f2e3] text-primary ring-1 ring-[#eadfcf]">
                  {v.icon ? (
                    <v.icon className="h-6 w-6" aria-hidden />
                  ) : (
                    <Compass className="h-6 w-6" aria-hidden />
                  )}
                </div>
                <h3 className="text-lg font-bold tracking-[-0.02em]">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {v.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Revamped High-End "Our Presence" Section */}
      <Section tone="soft">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow text-[#ad7f19]">Our presence</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-deep md:text-4xl">
                Offices that keep your journey connected
              </h2>
              <p className="mt-3 text-base leading-relaxed text-text-secondary">
                Visit our branches across Karnataka for in-person consultation, bespoke itinerary planning, and reliable journey coordination.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openEnquiry()}
              className="inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span>Book In-Person Visit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Reveal>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {officeList.map((office, i) => (
            <Reveal key={office.name} delay={i * 100}>
              <div className="group relative flex h-[440px] flex-col justify-between overflow-hidden rounded-[2.2rem] border border-white/20 p-7 shadow-[0_22px_45px_-18px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 hover:border-[#fcd34d]/60 hover:shadow-[0_32px_70px_-15px_rgba(0,0,0,0.7)]">
                {/* 1. Pure Crisp Background City/Landmark Image */}
                <div
                  className="pointer-events-none absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${office.image || "/brand/office-udupi.jpg"}')` }}
                />

                {/* 2. Default Bottom Subtle Gradient (Keeps image 100% visible before hover) */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-0" />

                {/* 3. Dark Frosted Vignette on Hover (Makes all revealed text ultra-crisp) */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/92 to-slate-950/70 opacity-0 backdrop-blur-[3px] transition-opacity duration-500 group-hover:opacity-100" />

                {/* 4. Top Golden Shimmer Highlight */}
                <span
                  className="hairline absolute inset-x-8 top-0 h-[2px] rounded-b-full bg-gradient-to-r from-transparent via-[#fcd34d]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />

                {/* Top Card Header (Always Visible) */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-white/25 bg-black/35 text-white backdrop-blur-md shadow-lg transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                    <Building2 className="h-6 w-6 text-[#fcd34d]" aria-hidden />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#fcd34d] animate-pulse" />
                    <span>{office.tag}</span>
                  </span>
                </div>

                {/* Default State: City Name & View Pill (Visible before hover, fades out on hover) */}
                <div className="relative z-10 transition-all duration-500 group-hover:translate-y-6 group-hover:opacity-0">
                  <h3 className="font-heading text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                    {office.name}
                  </h3>
                  <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
                    <span>Hover for details</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#fcd34d]" />
                  </div>
                </div>

                {/* Hover Revealed Details Panel (Slides up smoothly on hover) */}
                <div className="absolute inset-x-7 bottom-7 z-20 flex flex-col justify-end translate-y-8 opacity-0 pointer-events-none transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto">
                  <h3 className="font-heading text-2xl font-extrabold tracking-tight text-[#fcd34d]">
                    {office.name}
                  </h3>

                  <div className="mt-3.5 space-y-2.5 text-xs text-white">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#fcd34d]" />
                      <span className="leading-relaxed text-white/90">{office.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-[#fcd34d]" />
                      <span className="text-white/85">{office.hours}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#fcd34d]" />
                      <a
                        href={`tel:${office.phone.replace(/\s/g, "")}`}
                        className="font-bold text-white transition-colors hover:text-[#fcd34d]"
                      >
                        {office.phone}
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-3.5">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        office.mapQuery || `${office.name} ${office.address}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white transition-colors hover:text-[#fcd34d] hover:underline"
                    >
                      <span>Get Directions</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#fcd34d]" />
                    </a>

                    <a
                      href={whatsappLink(`Hi Yana Travels, I would like to visit your ${office.name} office.`, whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#25d366]/40 bg-[#25d366]/25 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-[#25d366] hover:shadow-md"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <EnquiryCta />
    </>
  );
}
