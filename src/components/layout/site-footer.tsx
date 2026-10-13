import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Star,
} from "lucide-react";
import { primaryNav, siteConfig, whatsappLink } from "@/lib/site-config";
import { Container } from "@/components/ui/container";
import { useSiteSettings } from "@/components/providers/site-settings-context";
import { useEnquiryModal } from "@/components/providers/enquiry-modal-context";
import { api } from "@/lib/api/client";
import type { PublicOffice } from "@/lib/types/content";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { phone, email, facebook, instagram, whatsapp } = useSiteSettings();
  const { open: openEnquiry } = useEnquiryModal();
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

  const fallbackOffices: PublicOffice[] = siteConfig.offices.map((office, index) => ({
    id: `fallback-${index}`,
    office_name: office.name,
    address: office.address,
    city: null,
    pincode: null,
    phone: null,
    email: null,
    hours: "Mon – Sat: 9:30 AM – 6:30 PM",
  }));

  const officeList: PublicOffice[] = offices.length > 0 ? offices : fallbackOffices;

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      {/* Background Travel Image (Pure, Crisp, No Blue Shade) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/brand/footer-travel-bg.jpg')",
        }}
      />

      {/* Subtle bottom vignette to ensure copyright legibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"
      />

      {/* Top subtle golden shimmer line */}
      <div
        aria-hidden
        className="relative z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#e8c979]/60 to-transparent"
      />

      {/* Top Quick Concierge & Booking Action Bar */}
      <div className="relative z-10 border-b border-white/10 py-10">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-white/15 bg-white/8 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:p-8">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c99b2d] to-[#9a741c] text-white shadow-lg">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">
                  Ready to craft your unforgettable holiday?
                </h3>
                <p className="mt-1 text-xs text-white/75 md:text-sm">
                  Speak directly with our travel designers or request a custom itinerary in minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-deep shadow-lg transition-all duration-300 hover:bg-[#fff9ed] hover:scale-105 hover:shadow-xl sm:text-sm"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </button>

              <a
                href={whatsappLink("Hi Yana Travels, I want to inquire about planning a trip", whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#25d366]/40 bg-[#25d366]/20 px-5 py-3 text-xs font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-[#25d366] hover:shadow-lg sm:text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer 4-Column Directory */}
      <Container className="relative z-10 grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1fr_1.3fr]">
        {/* Column 1: Brand Wordmark & Recognition */}
        <div className="space-y-6">
          <Link
            to="/"
            aria-label="Yana Travels"
            className="group inline-flex items-center transition-opacity hover:opacity-95"
          >
            <img
              src="/brand/yana-logo-footer-transparent.png?v=4"
              alt="Yana Travels"
              className="h-11 w-auto max-w-[190px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105 sm:h-13 sm:max-w-[220px]"
            />
          </Link>

          <p className="text-sm leading-relaxed text-white/75">
            Yana Travels is Karnataka based tour operator specializing in conducting premium domestic &amp; international tours. Yana Travels makes planning your dream vacation effortless. Discover and book your perfect getaway today with Yana Travels.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
            <div className="flex items-center text-[#fcd34d]">
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
            <span>4.9 / 5 Rated Experience</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {facebook && (
              <a
                href={facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-all duration-300 hover:bg-white hover:text-primary hover:scale-110"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {instagram && (
              <a
                href={instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-all duration-300 hover:bg-white hover:text-primary hover:scale-110"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            <a
              href={whatsappLink(undefined, whatsapp)}
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#25d366]/30 bg-[#25d366]/20 text-white transition-all duration-300 hover:bg-[#25d366] hover:scale-110"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <p className="flex items-center gap-2 font-heading text-xs font-extrabold uppercase tracking-[0.2em] text-[#e8c979]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8c979]" />
            <span>Explore Tours</span>
          </p>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li>
              <Link
                to="/packages?scope=domestic"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>Domestic Packages</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
            <li>
              <Link
                to="/packages?scope=international"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>International Escapes</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
            <li>
              <Link
                to="/group-tours"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>Escorted Group Tours</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
            <li>
              <Link
                to="/customized-tours"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>Custom Tailored Trips</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>Travel Services &amp; Visa</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>About Yana Travels</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>Contact &amp; Enquiries</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>Privacy Policy</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="group flex items-center justify-between transition-colors hover:text-white"
              >
                <span>Terms &amp; Conditions</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-[#e8c979]" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Support Desk */}
        <div>
          <p className="flex items-center gap-2 font-heading text-xs font-extrabold uppercase tracking-[0.2em] text-[#e8c979]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8c979]" />
            <span>24/7 Concierge</span>
          </p>

          <div className="mt-5 space-y-4 text-sm text-white/80">
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 transition-all duration-300 hover:border-white/25 hover:bg-white/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#e8c979] group-hover:bg-white group-hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Hotline Helpline
                </div>
                <div className="font-bold text-white group-hover:text-[#e8c979] transition-colors">
                  {phone}
                </div>
              </div>
            </a>

            <a
              href={`mailto:${email}`}
              className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 transition-all duration-300 hover:border-white/25 hover:bg-white/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#e8c979] group-hover:bg-white group-hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Email Desk
                </div>
                <div className="font-semibold text-white group-hover:text-[#e8c979] transition-colors">
                  {email}
                </div>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
              <Clock className="h-4 w-4 shrink-0 text-[#e8c979]" />
              <span>Mon – Sat: 9:30 AM – 6:30 PM</span>
            </div>
          </div>
        </div>

        {/* Column 4: Offices & Locations */}
        <div>
          <p className="flex items-center gap-2 font-heading text-xs font-extrabold uppercase tracking-[0.2em] text-[#e8c979]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8c979]" />
            <span>Branch Offices</span>
          </p>

          <div className="mt-5 space-y-3.5 text-xs text-white/75">
            {officeList.map((office) => (
              <div
                key={office.id || office.office_name}
                className="group rounded-xl border border-white/10 bg-white/5 p-3.5 transition-all duration-300 hover:border-white/25 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-[#e8c979] transition-colors">
                    {office.office_name}
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${office.office_name} ${office.address || ""}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#e8c979] hover:underline"
                  >
                    <span>Map</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-1.5 leading-relaxed text-white/65">
                  {office.address}
                </p>
                {office.phone && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#e8c979] font-semibold">
                    <Phone className="h-3 w-3" />
                    <a
                      href={`tel:${office.phone.replace(/\s/g, "")}`}
                      className="hover:underline"
                    >
                      {office.phone}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Bottom Legal & Developer Credits Bar */}
      <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-white/60 sm:flex-row">
          <p>© {year} Yana Travels. All rights reserved.</p>

          <div className="flex items-center justify-center">
            <span>
              Developed by{" "}
              <a
                href="https://wa.me/919945379333"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white transition-colors hover:text-[#e8c979]"
              >
                ROI Infotech
              </a>
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
