import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { siteConfig } from "@/lib/site-config";
import { api } from "@/lib/api/client";
import { useSiteSettings } from "@/components/providers/site-settings-context";
import type { PublicOffice } from "@/lib/types/content";

const fallbackOffices: { name: string; address: string }[] =
  siteConfig.offices.map((o) => ({ name: o.name, address: o.address }));

function officeAddress(o: PublicOffice): string {
  return [o.address, o.city, o.pincode].filter(Boolean).join(", ");
}

export function ContactPage() {
  const { phone, email } = useSiteSettings();
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

  const list =
    offices.length > 0
      ? offices.map((o) => ({
          name: o.office_name,
          address: o.address || officeAddress(o),
          phone: o.phone,
          email: o.email,
        }))
      : fallbackOffices.map((o) => ({
          ...o,
          phone: null as string | null,
          email: null as string | null,
        }));

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="We'd love to help plan your next journey with a smoother, brighter, more premium travel experience."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        image="photo-1476514525535-07fb3b4ae5f1"
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.9rem] border border-[#eadfcf] bg-[linear-gradient(135deg,#fffefb,#f7f1e4)] p-7 shadow-[0_24px_56px_-34px_rgba(16,33,58,0.26)]">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-primary text-white shadow-[0_18px_32px_-18px_rgba(11,102,228,0.8)]">
              <Sparkles className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-deep">
              Talk to the travel team directly
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Reach out for group tours, private itineraries, departures,
              documentation support, or a fresh travel plan built around your
              needs.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-3 rounded-[1.3rem] border border-white/80 bg-white/80 p-4 shadow-sm">
                <Phone className="mt-1 h-5 w-5 text-primary" aria-hidden />
                <div>
                  <p className="font-semibold text-deep">Phone</p>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="text-text-secondary hover:text-primary"
                  >
                    {phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[1.3rem] border border-white/80 bg-white/80 p-4 shadow-sm">
                <Mail className="mt-1 h-5 w-5 text-primary" aria-hidden />
                <div>
                  <p className="font-semibold text-deep">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="text-text-secondary hover:text-primary"
                  >
                    {email}
                  </a>
                </div>
              </div>
              {list.map((office) => (
                <div
                  key={office.name}
                  className="flex items-start gap-3 rounded-[1.3rem] border border-white/80 bg-white/80 p-4 shadow-sm"
                >
                  <MapPin className="mt-1 h-5 w-5 text-primary shrink-0" aria-hidden />
                  <div className="space-y-1">
                    <p className="font-semibold text-deep">{office.name}</p>
                    <p className="text-sm leading-6 text-text-secondary">
                      {office.address}
                    </p>
                    {office.phone && (
                      <p className="text-xs font-semibold text-primary flex items-center gap-1.5 pt-0.5">
                        <Phone className="h-3.5 w-3.5" />
                        <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="hover:underline">
                          {office.phone}
                        </a>
                      </p>
                    )}
                    {office.email && (
                      <p className="text-xs text-text-secondary flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${office.email}`} className="hover:underline">
                          {office.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-[#eadfcf] bg-white p-7 shadow-[0_24px_56px_-34px_rgba(16,33,58,0.26)]">
            <h2 className="mb-2 text-2xl font-extrabold tracking-[-0.03em] text-deep">
              Send us a message
            </h2>
            <p className="mb-6 text-sm leading-7 text-text-secondary">
              Share where you want to go and how you want to travel. The team
              can take it forward from there.
            </p>
            <EnquiryForm variant="general" />
          </div>
        </div>
      </Section>
    </>
  );
}
