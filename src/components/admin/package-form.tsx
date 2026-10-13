
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { packageInputSchema, type PackageInput } from "@/lib/schemas/package";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import type { EditablePackage } from "@/lib/types/admin";

const field =
  "w-full rounded-lg border border-border-soft bg-white px-3.5 py-2.5 text-sm outline-none focus-visible:border-primary";
const label = "mb-1.5 block text-sm font-semibold";
const err = "mt-1 text-xs text-danger";

function toLines(arr: string[] | null | undefined): string {
  return (arr ?? []).join("\n");
}

export function PackageForm({ pkg }: { pkg: EditablePackage | null }) {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [availableThemes, setAvailableThemes] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    api
      .listPublicThemes()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setAvailableThemes(data.map((t) => ({ id: t.id, title: t.title })));
        }
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PackageInput>({
    resolver: zodResolver(packageInputSchema),
    defaultValues: {
      title: pkg?.title ?? "",
      slug: pkg?.slug ?? "",
      scope: pkg?.scope ?? "domestic",
      tour_type: pkg?.tour_type ?? "group",
      category_name: pkg?.category_name ?? "",
      theme_name: pkg?.theme_name ?? "",
      destination_name: pkg?.destination_name ?? "",
      country: pkg?.country ?? "",
      duration_days: pkg?.duration_days ?? undefined,
      duration_nights: pkg?.duration_nights ?? undefined,
      overview: pkg?.overview ?? "",
      highlights: toLines(pkg?.highlights) as unknown as string[],
      inclusions: toLines(pkg?.inclusions) as unknown as string[],
      exclusions: toLines(pkg?.exclusions) as unknown as string[],
      price_amount:
        pkg?.price_amount != null
          ? (Number(pkg.price_amount) as unknown as number)
          : undefined,
      taxes_info: pkg?.taxes_info ?? "",
      hero_image_url: pkg?.hero_image_url ?? "",
      source_pdf: pkg?.source_pdf ?? "",
      is_featured: pkg?.is_featured ?? false,
      is_active: pkg?.is_active ?? true,
      status: pkg?.status ?? "published",
    },
  });

  async function onSubmit(values: PackageInput) {
    setServerError(null);
    const result = await api.savePackage(pkg?.id ?? null, values);
    if (result.ok) {
      navigate("/admin/packages");
      return;
    }
    if (result.fieldErrors) {
      for (const [k, m] of Object.entries(result.fieldErrors)) {
        setError(k as keyof PackageInput, { message: m as string });
      }
    }
    setServerError(result.error ?? "Save failed");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6 rounded-xl border border-border-soft bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="title">
            Title *
          </label>
          <input id="title" className={field} {...register("title")} />
          {errors.title && <p className={err}>{errors.title.message}</p>}
        </div>
        <div>
          <label className={label} htmlFor="slug">
            Slug *
          </label>
          <input id="slug" className={field} {...register("slug")} />
          {errors.slug && <p className={err}>{errors.slug.message}</p>}
        </div>
        <div>
          <label className={label} htmlFor="scope">
            Scope *
          </label>
          <select id="scope" className={field} {...register("scope")}>
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="tour_type">
            Tour type *
          </label>
          <select id="tour_type" className={field} {...register("tour_type")}>
            <option value="group">Group</option>
            <option value="customized">Customized</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="category_name">
            Category
          </label>
          <input
            id="category_name"
            className={field}
            {...register("category_name")}
          />
        </div>
        <div>
          <label className={label} htmlFor="theme_name">
            Curated Theme
          </label>
          <select id="theme_name" className={field} {...register("theme_name")}>
            <option value="">-- Select Curated Theme --</option>
            {availableThemes.length > 0 ? (
              availableThemes.map((t) => (
                <option key={t.id} value={t.title}>
                  {t.title}
                </option>
              ))
            ) : (
              <>
                <option value="Mountains & the North">Mountains & the North</option>
                <option value="Beaches & Islands">Beaches & Islands</option>
                <option value="Heritage & Pilgrimage">Heritage & Pilgrimage</option>
                <option value="International Escapes">International Escapes</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="destination_name">
            Destination
          </label>
          <input
            id="destination_name"
            className={field}
            {...register("destination_name")}
          />
        </div>
        <div>
          <label className={label} htmlFor="duration_days">
            Days
          </label>
          <input
            id="duration_days"
            type="number"
            className={field}
            {...register("duration_days")}
          />
          {errors.duration_days && (
            <p className={err}>{errors.duration_days.message}</p>
          )}
        </div>
        <div>
          <label className={label} htmlFor="duration_nights">
            Nights
          </label>
          <input
            id="duration_nights"
            type="number"
            className={field}
            {...register("duration_nights")}
          />
        </div>
        <div>
          <label className={label} htmlFor="price_amount">
            Price (₹ per person)
          </label>
          <input
            id="price_amount"
            type="number"
            className={field}
            {...register("price_amount")}
          />
          {errors.price_amount && (
            <p className={err}>{errors.price_amount.message}</p>
          )}
        </div>
        <div>
          <label className={label} htmlFor="country">
            Country
          </label>
          <input id="country" className={field} {...register("country")} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="overview">
          Overview
        </label>
        <textarea
          id="overview"
          rows={3}
          className={field}
          {...register("overview")}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className={label} htmlFor="highlights">
            Highlights (one per line)
          </label>
          <textarea
            id="highlights"
            rows={5}
            className={field}
            {...register("highlights")}
          />
        </div>
        <div>
          <label className={label} htmlFor="inclusions">
            Inclusions (one per line)
          </label>
          <textarea
            id="inclusions"
            rows={5}
            className={field}
            {...register("inclusions")}
          />
        </div>
        <div>
          <label className={label} htmlFor="exclusions">
            Exclusions (one per line)
          </label>
          <textarea
            id="exclusions"
            rows={5}
            className={field}
            {...register("exclusions")}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="hero_image_url">
            Hero image URL
          </label>
          <div className="flex items-center gap-2">
            <input
              id="hero_image_url"
              className={field}
              {...register("hero_image_url")}
            />
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-bg-soft px-3 py-2 text-xs font-semibold whitespace-nowrap text-text-main hover:bg-white transition">
              <Upload className="h-3.5 w-3.5 text-primary" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const data = new FormData();
                  data.append("file", file);
                  try {
                    const json = await api.upload(data);
                    if (json.ok && json.url) {
                      setValue("hero_image_url", json.url);
                    }
                  } catch (err) {
                    alert("Upload failed");
                  }
                }}
              />
            </label>
          </div>
          {errors.hero_image_url && (
            <p className={err}>{errors.hero_image_url.message}</p>
          )}
        </div>
        <div>
          <label className={label} htmlFor="source_pdf">
            Package Brochure PDF
          </label>
          <div className="flex items-center gap-2">
            <input
              id="source_pdf"
              placeholder="/uploads/brochure.pdf or PDF URL"
              className={field}
              {...register("source_pdf")}
            />
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-bg-soft px-3 py-2 text-xs font-semibold whitespace-nowrap text-text-main hover:bg-white transition">
              <Upload className="h-3.5 w-3.5 text-primary" />
              Upload PDF
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const data = new FormData();
                  data.append("file", file);
                  try {
                    const json = await api.upload(data);
                    if (json.ok && json.url) {
                      setValue("source_pdf", json.url);
                    }
                  } catch (err) {
                    alert("Upload failed");
                  }
                }}
              />
            </label>
          </div>
          {errors.source_pdf && (
            <p className={err}>{errors.source_pdf.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="taxes_info">
            Price note / taxes
          </label>
          <input
            id="taxes_info"
            className={field}
            {...register("taxes_info")}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" {...register("is_active")} /> Active
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" {...register("is_featured")} /> Featured
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Status</span>
          <select className={field + " w-auto"} {...register("status")}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving…" : pkg ? "Save changes" : "Create package"}
        </Button>
        <button
          type="button"
          onClick={() => navigate("/admin/packages")}
          className="rounded-full border border-border-soft px-5 py-2.5 text-sm font-semibold text-text-main hover:bg-bg-soft"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
