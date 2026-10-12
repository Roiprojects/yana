import { useState } from "react";
import {
  Clock,
  MapPin,
  Check,
  X,
  CalendarDays,
  BedDouble,
  Utensils,
  Bus,
  FileText,
  FileDown,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { whatsappLink } from "@/lib/site-config";
import { useSiteSettings } from "@/components/providers/site-settings-context";
import { EnquireNowButton } from "@/components/ui/enquire-now-button";
import { DownloadPdfModal } from "@/components/forms/download-pdf-modal";
import type { PackageDetail } from "@/lib/types/tour";

const MEALS: Record<string, string> = {
  B: "Breakfast",
  L: "Lunch",
  D: "Dinner",
};
function mealLabel(code: string): string {
  const parts = code
    .split("/")
    .map((c) => MEALS[c.trim().toUpperCase()])
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : `Meals: ${code}`;
}

function Prose({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <section>
      <h2 className="mb-2 text-xl font-bold">{title}</h2>
      <p className="whitespace-pre-line text-text-secondary">{text}</p>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm text-text-secondary">{value}</p>
      </div>
    </div>
  );
}

function List({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[] | null;
  positive: boolean;
}) {
  if (!items || items.length === 0) return null;
  const Icon = positive ? Check : X;
  return (
    <div>
      <h3 className="mb-3 font-bold">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-text-secondary"
          >
            <Icon
              className={`mt-0.5 h-4 w-4 shrink-0 ${positive ? "text-success" : "text-danger"}`}
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatPrice(amount: number | null, currency: string): string | null {
  if (amount == null) return null;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function PackageDetailView({ pkg }: { pkg: PackageDetail }) {
  const { whatsapp } = useSiteSettings();
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const price = formatPrice(pkg.price_amount, pkg.price_currency);
  const dur =
    pkg.duration_days != null && pkg.duration_nights != null
      ? `${pkg.duration_days}D / ${pkg.duration_nights}N`
      : pkg.duration_days != null
        ? `${pkg.duration_days} days`
        : null;
  const enquiryMsg = `Hi, I'm interested in the "${pkg.title}" package.`;

  return (
    <article className="-mt-24">
      {/* Cinematic hero with overlaid title */}
      <div className="px-3 sm:px-4">
        <div className="grain relative flex min-h-[70vh] items-end overflow-hidden rounded-[1.75rem] bg-lavender md:rounded-[2rem]">
          {pkg.hero_image_url ? (
            <img
              src={pkg.hero_image_url}
              alt={pkg.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-lavender to-bg-soft">
              <MapPin className="h-10 w-10 text-primary/40" aria-hidden />
            </div>
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/40 to-deep/20"
          />
          <Container className="relative z-10 pb-12 pt-36 text-white">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md">
                {pkg.tour_type}
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur-md">
                {pkg.scope}
              </span>
              {pkg.category_name && (
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
                  {pkg.category_name}
                </span>
              )}
            </div>
            <h1 className="max-w-3xl font-heading text-4xl font-extrabold leading-tight text-white md:text-6xl">
              {pkg.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/85">
              {pkg.destination_name && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {pkg.destination_name}
                </span>
              )}
              {dur && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" aria-hidden />
                  {dur}
                </span>
              )}
              {price && (
                <span className="inline-flex items-center gap-2">
                  <span className="text-white/60">From</span>
                  <span className="font-heading text-lg font-bold text-white">
                    {price}
                  </span>
                </span>
              )}
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div className="space-y-8">
            <Prose title="Overview" text={pkg.overview} />

            {pkg.highlights && pkg.highlights.length > 0 && (
              <section>
                <h2 className="mb-3 text-xl font-bold">Highlights</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {pkg.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {pkg.itinerary.length > 0 && (
              <section>
                <h2 className="mb-6 text-xl font-bold">Day-wise itinerary</h2>
                <ol className="relative ml-4 space-y-6 border-l-2 border-lavender pl-8">
                  {pkg.itinerary.map((day) => (
                    <li key={day.day_number} className="relative">
                      <span className="absolute -left-[42px] flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm ring-4 ring-bg-main">
                        {day.day_number}
                      </span>
                      <Reveal>
                        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm transition hover:shadow-md">
                          <p className="text-xs font-bold uppercase tracking-wide text-primary">
                            Day {day.day_number}
                          </p>
                          {day.title && (
                            <h3 className="mt-1 font-bold text-text-main">
                              {day.title}
                            </h3>
                          )}
                          {day.image_url && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-border-soft bg-lavender/30">
                              <img
                                src={day.image_url}
                                alt={day.title || `Day ${day.day_number}`}
                                className="h-48 w-full object-cover transition duration-300 hover:scale-105"
                              />
                            </div>
                          )}
                          {day.description && (
                            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                              {day.description}
                            </p>
                          )}
                          {(day.meals || day.stay) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {day.meals && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1 text-xs font-medium text-deep">
                                  <Utensils
                                    className="h-3.5 w-3.5 text-primary"
                                    aria-hidden
                                  />
                                  {mealLabel(day.meals)}
                                </span>
                              )}
                              {day.stay && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1 text-xs font-medium text-deep">
                                  <BedDouble
                                    className="h-3.5 w-3.5 text-primary"
                                    aria-hidden
                                  />
                                  {day.stay}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {(pkg.accommodation || pkg.meals_info || pkg.transport_info) && (
              <section className="grid gap-4 rounded-xl border border-border-soft bg-white p-5 sm:grid-cols-3">
                <InfoRow
                  icon={BedDouble}
                  label="Stay"
                  value={pkg.accommodation}
                />
                <InfoRow icon={Utensils} label="Meals" value={pkg.meals_info} />
                <InfoRow
                  icon={Bus}
                  label="Transport"
                  value={pkg.transport_info}
                />
              </section>
            )}

            {pkg.inclusions?.length || pkg.exclusions?.length ? (
              <section className="grid gap-8 sm:grid-cols-2">
                <List title="Inclusions" items={pkg.inclusions} positive />
                <List
                  title="Exclusions"
                  items={pkg.exclusions}
                  positive={false}
                />
              </section>
            ) : null}

            <Prose title="Visa information" text={pkg.visa_info} />
            <Prose title="Cancellation policy" text={pkg.cancellation_policy} />
            <Prose title="Terms & conditions" text={pkg.terms} />

            {pkg.documents_required && pkg.documents_required.length > 0 && (
              <List
                title="Documents required"
                items={pkg.documents_required}
                positive
              />
            )}
          </div>

          {/* Sticky enquiry sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border-soft bg-white p-6 shadow-sm">
              {price ? (
                <p className="text-sm text-text-secondary">
                  From{" "}
                  <span className="text-2xl font-extrabold text-deep">
                    {price}
                  </span>
                  {pkg.taxes_info ? (
                    <span className="block text-xs">{pkg.taxes_info}</span>
                  ) : null}
                </p>
              ) : (
                <p className="text-lg font-bold text-deep">
                  Enquire for pricing
                </p>
              )}

              {(pkg.pickup_location || pkg.drop_location) && (
                <div className="mt-4 space-y-2 border-t border-border-soft pt-4 text-sm text-text-secondary">
                  {pkg.pickup_location && (
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" aria-hidden /> Pickup:{" "}
                      {pkg.pickup_location}
                    </p>
                  )}
                  {pkg.drop_location && (
                    <p className="flex items-center gap-2">
                      <FileText className="h-4 w-4" aria-hidden /> Drop:{" "}
                      {pkg.drop_location}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2">
                <EnquireNowButton destination={pkg.title} />

                <LinkButton
                  href={whatsappLink(enquiryMsg, whatsapp)}
                  external
                  variant="ghost"
                  className="w-full"
                >
                  WhatsApp us
                </LinkButton>
                <button
                  type="button"
                  onClick={() => setPdfModalOpen(true)}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-border-soft px-5 py-2.5 text-sm font-semibold text-deep transition-colors hover:border-gold hover:text-primary"
                >
                  <FileDown className="h-4 w-4" />
                  Download itinerary (PDF)
                </button>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {pdfModalOpen && (
        <DownloadPdfModal
          pkg={pkg}
          pdfUrl={pkg.source_pdf}
          onClose={() => setPdfModalOpen(false)}
        />
      )}
    </article>
  );
}
