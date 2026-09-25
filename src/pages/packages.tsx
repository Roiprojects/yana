import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Compass, Layers3 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { EnquireNowButton } from "@/components/ui/enquire-now-button";
import { PackageGrid, SampleDataBanner } from "@/components/tours/package-grid";
import { api } from "@/lib/api/client";
import type { PackageListItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

const scopeOptions = [
  { value: "domestic", label: "Domestic" },
  { value: "international", label: "International" },
] as const;
const typeOptions = [
  { value: "group", label: "Group" },
  { value: "customized", label: "Customized" },
] as const;

function buildHref(
  current: URLSearchParams,
  key: "scope" | "type",
  value: string,
) {
  const next = new URLSearchParams(current);
  if (next.get(key) === value) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return qs ? `/packages?${qs}` : "/packages";
}

export function PackagesPage() {
  const [searchParams] = useSearchParams();
  const scope = searchParams.get("scope") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const q = searchParams.get("q") ?? "";

  const [items, setItems] = useState<PackageListItem[]>([]);
  const [sample, setSample] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasFilter = Boolean(scope || type || q);
  const query = q.trim().toLowerCase();
  const filtered = query
    ? items.filter((p) =>
        [p.title, p.scope, p.destination_name, p.overview]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : items;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listPackages({
        scope:
          scope === "domestic" || scope === "international" ? scope : undefined,
        tourType: type === "group" || type === "customized" ? type : undefined,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setSample(res.sample);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope, type]);

  return (
    <>
      <PageHeader
        title="Tour Packages"
        subtitle="Find a journey that fits, now presented with a cleaner, richer, more premium browsing experience."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Packages" }]}
        image="photo-1501785888041-af3ef285b470"
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside className="space-y-6">
            <div className="sticky top-24 rounded-[2.5rem] border border-white/80 bg-white/40 p-6 sm:p-8 shadow-[0_24px_64px_-24px_rgba(16,33,58,0.12)] backdrop-blur-2xl">
              <div className="mb-6 flex items-center gap-4 border-b border-[#10213a]/10 pb-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#10213a] to-[#051024] text-[#f8d77f] shadow-[0_16px_32px_-10px_rgba(16,33,58,0.7)]">
                  <Layers3 className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#10213a]">
                    Filter Tours
                  </h2>
                  <p className="text-xs font-semibold text-[#10213a]/50 uppercase tracking-widest mt-1">
                    Refine journey
                  </p>
                </div>
              </div>

              {hasFilter ? (
                <div className="mb-6 overflow-hidden rounded-2xl">
                  <Link
                    to="/packages"
                    className="block w-full bg-red-50/80 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                  >
                    Clear all filters
                  </Link>
                </div>
              ) : null}

              <FilterGroup
                label="Destination Scope"
                options={scopeOptions}
                activeValue={scope}
                current={searchParams}
                paramKey="scope"
              />
              <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-[#10213a]/10 to-transparent" />
              <FilterGroup
                label="Travel Style"
                options={typeOptions}
                activeValue={type}
                current={searchParams}
                paramKey="type"
              />
            </div>
          </aside>

          <div>
            {loading ? (
              <p className="text-center text-sm text-text-secondary">
                Loading packages…
              </p>
            ) : (
              <>
                {sample ? <SampleDataBanner /> : null}
                {filtered.length > 0 ? (
                  <>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#eadfcf] bg-white px-5 py-4 shadow-[0_16px_36px_-26px_rgba(16,33,58,0.2)]">
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold text-deep">
                          {filtered.length}
                        </span>{" "}
                        package{filtered.length === 1 ? "" : "s"}
                        {query ? (
                          <>
                            {" "}
                            for &ldquo;
                            <span className="font-semibold text-deep">{q}</span>
                            &rdquo;
                          </>
                        ) : hasFilter ? (
                          " matched your filters"
                        ) : (
                          " available to explore"
                        )}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ad7f19]">
                        Curated departures
                      </p>
                    </div>
                    <PackageGrid items={filtered} />
                  </>
                ) : (
                  <EmptyState
                    icon={Compass}
                    title={
                      hasFilter
                        ? "No packages match your search"
                        : "No packages published yet"
                    }
                    description={
                      hasFilter
                        ? "Try clearing the filters or search, or send us an enquiry and we'll help directly."
                        : "Verified tour packages will be listed here once they are published from the admin panel."
                    }
                    action={<EnquireNowButton />}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

function FilterGroup({
  label,
  options,
  activeValue,
  current,
  paramKey,
}: {
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  activeValue: string | undefined;
  current: URLSearchParams;
  paramKey: "scope" | "type";
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#10213a]/50">
        {label}
      </h3>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const active = activeValue === opt.value;
          return (
            <Link
              key={opt.value}
              to={buildHref(current, paramKey, opt.value)}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300",
                active
                  ? "bg-gradient-to-r from-[#0b66e4] to-[#0052cc] text-white shadow-[0_10px_24px_-10px_rgba(11,102,228,0.8)]"
                  : "bg-white/60 text-[#10213a] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_20px_-12px_rgba(16,33,58,0.15)]",
              )}
            >
              <span>{opt.label}</span>
              {active && (
                <span className="flex h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
