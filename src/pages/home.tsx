import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Users2,
  Sparkles,
  Compass,
  Wrench,
  Check,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { EnquiryCta } from "@/components/marketing/enquiry-cta";
import { HeroSlideshow } from "@/components/marketing/hero-slideshow";
import { HeroSearch } from "@/components/marketing/hero-search";
import { HeroFeaturesPanel } from "@/components/marketing/hero-features-panel";
import { UpcomingToursSection } from "@/components/marketing/upcoming-tours";
import { SpecialDealsSection } from "@/components/marketing/special-deals-carousel";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ValueProps } from "@/components/marketing/value-props";
import { TrustBadges } from "@/components/marketing/trust-badges";
import { DestinationMarquee } from "@/components/marketing/destination-marquee";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { GallerySection } from "@/components/marketing/gallery-section";
import { Faq } from "@/components/marketing/faq";
import { CuratedThemes } from "@/components/marketing/curated-themes";
import { primaryNav } from "@/lib/site-config";
import {
  unsplash,
  heroImage,
  experienceImage,
  collections,
} from "@/lib/images";
import { api } from "@/lib/api/client";
import type { PackageListItem } from "@/lib/types/tour";
import type { PublicFaq } from "@/lib/types/content";
import type { AdminHeroRow } from "@/lib/types/admin";

const categories = [
  {
    href: "/group-tours",
    icon: Users2,
    tag: "Escorted Journeys",
    title: "Group Tours",
    desc: "Curated departures that feel organised, comfortable, guided, and social.",
    gradient: "from-[#0b66e4] to-[#1d4ed8]",
    glow: "bg-[#0b66e4]/12",
  },
  {
    href: "/customized-tours",
    icon: Sparkles,
    tag: "Tailor Made",
    title: "Customized Tours",
    desc: "Bespoke itineraries shaped completely around your dates, pace, and interests.",
    gradient: "from-[#c99b2d] to-[#9a741c]",
    glow: "bg-[#c99b2d]/12",
  },
  {
    href: "/packages",
    icon: Compass,
    tag: "Ready Packages",
    title: "Tour Packages",
    desc: "Ready-to-enquire domestic and international packages with clear inclusions.",
    gradient: "from-[#2e9e6b] to-[#15803d]",
    glow: "bg-[#2e9e6b]/12",
  },
  {
    href: "/services",
    icon: Wrench,
    tag: "Full Support",
    title: "Travel Services",
    desc: "Flights, visa filing, forex, hotel bookings, and 24/7 journey coordination.",
    gradient: "from-[#6366f1] to-[#4338ca]",
    glow: "bg-[#6366f1]/12",
  },
];

const fallbackFaqs = [
  {
    q: "How do I book a tour package or customized trip?",
    a: "You can send us an online enquiry form through our website, message us directly on WhatsApp, or call our customer helpline. Our travel specialists will discuss your preferences, suggest curated itineraries, and guide you through the reservation process step by step.",
  },
  {
    q: "Do you offer fully customized private itineraries?",
    a: "Yes, absolutely! Alongside our escorted group departures, we specialize in tailor-made private tours. You choose your travel dates, preferred hotels, sightseeing pace, and transport preferences, and we design a bespoke day-by-day itinerary for you and your family.",
  },
  {
    q: "Which domestic and international destinations do you cover?",
    a: "We organize tours across India — including Chardham, Kashmir, Ladakh, Kerala, Andaman, Northeast, Goa, and Golden Triangle — as well as top international destinations such as Europe, Bali, Dubai, Singapore, Thailand, Maldives, Sri Lanka, and Vietnam.",
  },
  {
    q: "Can you arrange flight tickets, visa assistance, and forex?",
    a: "Yes. Yana Travels is a full-service travel partner. We assist with domestic and international air ticketing, visa consultation and document processing, foreign exchange (forex), and comprehensive travel insurance.",
  },
  {
    q: "What is typically included in your tour packages?",
    a: "Our packages generally include verified hotel accommodations, daily breakfast/meals, private AC vehicle transfers, airport assistance, and guided sightseeing. Package-specific inclusions and exclusions are clearly itemized before booking with zero hidden charges.",
  },
  {
    q: "What are your payment options and booking terms?",
    a: "We offer flexible payment terms. You can secure your booking with an initial token advance, followed by scheduled installments prior to departure. We accept bank transfers, UPI, credit/debit cards, and net banking with prompt GST invoices.",
  },
  {
    q: "What is your cancellation and refund policy?",
    a: "Cancellations are processed based on the supplier/airline terms and the date of notice prior to departure. Our team clearly explains the cancellation timeline during booking, and in case of unforeseen emergencies, we do our best to reschedule or offer credit notes where possible.",
  },
  {
    q: "Do you organize senior citizen and pilgrimage tours?",
    a: "Yes. We offer escorted pilgrimage journeys (such as Chardham Yatra by helicopter/road, South India Temple tours, and Varanasi-Ayodhya circuits) with dedicated care, slower pacing, comfortable stays, and medical/dietary assistance.",
  },
  {
    q: "Can we make changes to an ongoing tour?",
    a: "Our 24/7 on-trip concierge team is always available to assist with adjustments like extending hotel stays, adding optional excursions, or rearranging pickup schedules, subject to availability.",
  },
  {
    q: "How do I get in touch for urgent travel support?",
    a: "Our helpline and direct WhatsApp desk are active 24/7. Once your tour is confirmed, you will also be assigned a dedicated tour coordinator who tracks your journey and assists you throughout.",
  },
];

export function HomePage() {
  const [featured, setFeatured] = useState<PackageListItem[]>([]);
  const [faqs, setFaqs] = useState<PublicFaq[]>([]);
  const [heroSlide, setHeroSlide] = useState<AdminHeroRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listPackages({ featured: true })
      .then((res) => {
        if (cancelled) return;
        setFeatured(res.items);
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    api
      .listPublicFaqs()
      .then((items) => {
        if (!cancelled) setFaqs(items);
      })
      .catch(() => {
        if (!cancelled) setFaqs([]);
      });
    api
      .listPublicHeroSlides()
      .then((slides) => {
        if (!cancelled && Array.isArray(slides) && slides.length > 0) {
          setHeroSlide(slides[0]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const faqItems =
    faqs.length > 0
      ? faqs.map((f) => ({ q: f.question, a: f.answer }))
      : fallbackFaqs;
  return (
    <>
      <div className="px-0 pt-0">
        <section className="relative min-h-[100svh] overflow-hidden rounded-none border-0 bg-[linear-gradient(135deg,rgba(255,253,248,0.12),rgba(247,241,228,0.08))] shadow-[0_34px_80px_-42px_rgba(16,33,58,0.34)]">
          <HeroSlideshow
            videoSrc={heroSlide?.video_url || "/hero/homepage-hero-real-16x9.mp4"}
            mobileVideoSrc={heroSlide?.mobile_video_url || "/hero/homepage-hero-real-9x16.mp4"}
            poster="/hero/homepage-hero-real-16x9-poster.jpg"
            mobilePoster="/hero/homepage-hero-real-9x16-poster.jpg"
            images={
              heroSlide?.image_url
                ? [heroSlide.image_url]
                : [
                    unsplash(heroImage, 2000),
                    collections[0].image,
                    collections[3].image,
                  ]
            }
          />
          <div
            className="pointer-events-none absolute -left-12 top-16 h-56 w-56 rounded-full bg-[#e7d39a]/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#dfe9f8]/35 blur-3xl"
            aria-hidden
          />

          <Container className="relative z-10 flex min-h-[calc(100svh-1rem)] flex-col py-5 sm:py-6 lg:py-7">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link
                  to="/"
                  aria-label="Yana Travels home"
                  className="group flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]"
                >
                  <img
                    src="/brand/yana-logo-hero-dark.png"
                    alt="Yana Travels"
                    className="h-10 w-auto max-w-[170px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:h-12 sm:max-w-[210px] md:h-14 md:max-w-[240px]"
                  />
                </Link>
                <div className="hidden w-44 sm:block sm:w-56 md:w-64 lg:w-72">
                  <HeroSearch />
                </div>
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                <nav className="flex items-center gap-1.5" aria-label="Hero navigation">
                  {primaryNav.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="inline-flex items-center whitespace-nowrap rounded-full border border-white/28 bg-black/26 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] backdrop-blur-[4px] transition-all duration-200 hover:border-white/40 hover:bg-black/40"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            <div className="grid flex-1 w-full items-end gap-6 pt-8 pb-2 sm:pb-3 lg:grid-cols-12 lg:gap-8 lg:pt-10 lg:pb-4">
              <div className="self-end lg:col-span-8">
                <div className="max-w-4xl pl-2 pb-1 sm:pl-4 sm:p-2 sm:pb-2">
                  <h1 className="animate-rise font-display text-2xl font-semibold leading-[1.18] tracking-[-0.03em] text-yellow-400 drop-shadow-[0_18px_34px_rgba(0,0,0,0.65)] sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[2.9rem]">
                    {heroSlide?.title ? (
                      <>
                        <span className="block sm:whitespace-nowrap">{heroSlide.title}</span>
                        {heroSlide.subtitle && (
                          <span className="block text-white/95 text-base sm:text-lg md:text-xl font-medium mt-2 drop-shadow-md">
                            {heroSlide.subtitle}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="block sm:whitespace-nowrap">Traveling - it leaves you speechless,</span>
                        <span className="block text-yellow-400 sm:whitespace-nowrap">
                          then turns you into a story teller.
                        </span>
                      </>
                    )}
                  </h1>
                </div>
              </div>

              <div className="flex justify-start self-end lg:col-span-4 lg:justify-end">
                <HeroFeaturesPanel />
              </div>
            </div>
          </Container>
        </section>
      </div>

      <UpcomingToursSection />

      <div className="relative overflow-hidden border-y border-[#efe3cd] bg-[linear-gradient(90deg,#faf6ed,#fffdf8,#f3f7fd)]">
        <Container className="relative z-10 py-4 sm:py-5">
          <TrustBadges />
        </Container>
      </div>

      <Section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-12 left-1/4 h-80 w-80 rounded-full bg-[#dfe9f8]/70 blur-3xl"
          aria-hidden
        />
        <SpecialDealsSection items={featured} />
      </Section>

      <Section tone="soft" className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-10 top-12 h-96 w-96 rounded-full bg-[#dfe9f8]/60 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-[#e6d39d]/30 blur-3xl"
          aria-hidden
        />
        <Reveal>
          <div className="relative z-10 mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
            <div>
              <p className="eyebrow text-[#ad7f19]">How you travel</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#10213a] sm:text-2xl md:text-3xl">
                Travel styles with a clearer premium identity
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-[#6c7788] sm:text-sm">
              Whether you prefer escorted group departures or bespoke private itineraries, choose the travel format crafted for your journey.
            </p>
          </div>
        </Reveal>
        <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ href, icon: Icon, tag, title, desc, gradient, glow }, i) => (
            <Reveal key={href} delay={i * 90}>
              <Link
                to={href}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.8rem] border border-white/90 bg-white/85 p-6 shadow-[0_14px_38px_-16px_rgba(16,33,58,0.1)] backdrop-blur-md transition-all duration-300 hover:-translate-y-2.5 hover:border-[#0b66e4]/30 hover:bg-white hover:shadow-[0_28px_56px_-16px_rgba(11,102,228,0.22)]"
              >
                {/* Decorative top accent glow line */}
                <span
                  className="absolute inset-x-8 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-[#0b66e4]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />

                {/* Ambient background glow */}
                <span
                  className={`pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full ${glow} blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-100`}
                  aria-hidden
                />

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} p-3 text-white shadow-[0_10px_24px_-6px_rgba(16,33,58,0.35)] ring-4 ring-black/5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_14px_28px_-6px_rgba(11,102,228,0.45)]`}>
                      <Icon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" aria-hidden />
                    </div>
                    <span className="rounded-full border border-[#e8decb]/80 bg-[#fffdf8] px-3 py-1 text-[11px] font-bold tracking-wide text-[#6c7788] transition-colors group-hover:border-[#0b66e4]/30 group-hover:text-[#0b66e4]">
                      {tag}
                    </span>
                  </div>

                  <h3 className="relative mt-6 text-lg font-bold tracking-tight text-[#10213a] transition-colors duration-200 group-hover:text-[#0b66e4]">
                    {title}
                  </h3>
                  <p className="relative mt-2 text-xs leading-relaxed text-[#6c7788] sm:text-sm">
                    {desc}
                  </p>
                </div>

                <div className="relative mt-6 flex items-center justify-between border-t border-[#f0e8d8] pt-4">
                  <span className="text-xs font-semibold text-[#6c7788] transition-colors group-hover:text-[#0b66e4]">
                    Explore Style
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8decb] bg-[#fffdf8] text-[#10213a] shadow-sm transition-all duration-300 group-hover:bg-[#0b66e4] group-hover:border-[#0b66e4] group-hover:text-white group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="relative overflow-hidden">
        <CuratedThemes />
      </Section>

      <Section tone="soft" className="relative overflow-hidden">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-[1.9rem] shadow-[0_28px_60px_-32px_rgba(16,33,58,0.38)]">
              <div className="relative aspect-[4/3]">
                <img
                  src={unsplash(experienceImage, 1600)}
                  alt="A scenic travel route"
                  className="absolute inset-0 h-full w-full object-cover brightness-[1.05]"
                />
              </div>
              <div className="border-t border-[#eadfcf] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ad7f19]">
                  End-to-end comfort
                </p>
                <p className="mt-2 text-xs leading-5 text-text-secondary sm:text-sm sm:leading-6">
                  Enquiry, planning, documentation, and departure support in one
                  smoother journey.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <p className="eyebrow text-[#ad7f19]">Why choose Yana</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#10213a] sm:text-2xl md:text-3xl">
                Every detail handled, with a brighter and more polished feel
              </h2>
              <p className="mt-3 text-xs leading-5 text-text-secondary sm:text-sm sm:leading-6">
                From flights and stays to sightseeing and documentation, the
                site now frames the same travel offer with better spacing, more
                confidence, and stronger luxury cues.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Group departures and fully customized itineraries",
                  "Domestic and international destinations",
                  "Pilgrimage, honeymoon, weekend, and corporate travel",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-xs font-medium text-text-main sm:text-sm"
                  >
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                to="/about"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-xs font-semibold text-white shadow-[0_18px_30px_-18px_rgba(11,102,228,0.8)] transition-all duration-300 hover:-translate-y-0.5 sm:text-sm"
              >
                About Yana Travels <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <HowItWorks />
      </Section>

      <DestinationMarquee />

      <Section tone="soft">
        <ValueProps />
      </Section>

      <TestimonialsSection />

      <Section>
        <Reveal>
          <div className="mb-6 text-center sm:mb-8">
            <p className="eyebrow text-[#ad7f19]">Good to know</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#10213a] sm:text-2xl md:text-3xl">
              Frequently asked questions
            </h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="mx-auto max-w-3xl">
            <Faq items={faqItems} />
          </div>
        </Reveal>
      </Section>

      <GallerySection />

      <EnquiryCta />
    </>
  );
}
