import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListOrdered, Pencil, Plus, Trash2, Save, Loader2, Calendar, Upload } from "lucide-react";
import { api } from "@/lib/api/client";
import type { AdminPackageRow } from "@/lib/types/admin";
import type { PackageDetail, ItineraryDay } from "@/lib/types/tour";

export function AdminItineraryPage() {
  const [packages, setPackages] = useState<AdminPackageRow[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [loadingPkg, setLoadingPkg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.adminPackages().then((res) => {
      const items = (res.items as AdminPackageRow[]) ?? [];
      setPackages(items);
      if (items.length > 0) {
        setSelectedPkgId(items[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedPkgId) return;
    setLoadingPkg(true);
    setMessage(null);
    const selected = packages.find((p) => p.id === selectedPkgId);
    if (!selected) return;

    api.getPackage(selected.slug).then((detail) => {
      setPackageDetail(detail);
      setItinerary(detail.itinerary ?? []);
    }).catch(() => {
      setPackageDetail(null);
      setItinerary([]);
    }).finally(() => {
      setLoadingPkg(false);
    });
  }, [selectedPkgId, packages]);

  function handleDayChange(index: number, field: keyof ItineraryDay, value: string | number) {
    setItinerary((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addDay() {
    setItinerary((prev) => [
      ...prev,
      {
        day_number: prev.length + 1,
        title: `Day ${prev.length + 1}: `,
        description: "",
        meals: "Breakfast",
        stay: "Hotel",
      },
    ]);
  }

  function removeDay(index: number) {
    setItinerary((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((item, idx) => ({ ...item, day_number: idx + 1 }));
    });
  }

  async function handleSave() {
    if (!packageDetail || !selectedPkgId) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.savePackage(selectedPkgId, {
        title: packageDetail.title,
        slug: packageDetail.slug,
        scope: packageDetail.scope,
        tour_type: packageDetail.tour_type,
        category_name: packageDetail.category_name,
        destination_name: packageDetail.destination_name,
        duration_days: packageDetail.duration_days,
        duration_nights: packageDetail.duration_nights,
        overview: packageDetail.overview,
        highlights: packageDetail.highlights,
        inclusions: packageDetail.inclusions,
        exclusions: packageDetail.exclusions,
        price_amount: packageDetail.price_amount,
        hero_image_url: packageDetail.hero_image_url,
        is_featured: packageDetail.is_featured,
        is_active: packageDetail.is_active,
        status: packageDetail.status,
        itinerary: itinerary,
      });

      if (res.ok) {
        setMessage("Itinerary saved successfully!");
      } else {
        setMessage(res.error || "Failed to save itinerary.");
      }
    } catch {
      setMessage("Error saving itinerary.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0c1e36]">
            Package Day-Wise Itineraries
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a package to view, edit, or add day-by-day travel plans.
          </p>
        </div>
      </div>

      {/* Package Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Select Tour Package
        </label>
        <select
          value={selectedPkgId}
          onChange={(e) => setSelectedPkgId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-primary focus:bg-white"
        >
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.scope} · {p.tour_type})
            </option>
          ))}
        </select>
      </div>

      {loadingPkg ? (
        <p className="text-sm text-slate-500">Loading package details…</p>
      ) : packageDetail ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/50 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{packageDetail.title}</h2>
              <p className="text-xs text-slate-500">
                Duration: {packageDetail.duration_days ?? "—"} Days / {packageDetail.duration_nights ?? "—"} Nights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/admin/packages/${selectedPkgId}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Package Info
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Itinerary
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                message.includes("success")
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Days List */}
          <div className="space-y-4">
            {itinerary.map((day, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {day.day_number || idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">Day {day.day_number || idx + 1} Plan</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDay(idx)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove Day
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Day Title
                    </label>
                    <input
                      type="text"
                      value={day.title || ""}
                      onChange={(e) => handleDayChange(idx, "title", e.target.value)}
                      placeholder="e.g. Arrival in Srinagar & Dal Lake Shikara Ride"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Meals
                      </label>
                      <input
                        type="text"
                        value={day.meals || ""}
                        onChange={(e) => handleDayChange(idx, "meals", e.target.value)}
                        placeholder="e.g. Breakfast & Dinner"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Overnight Stay
                      </label>
                      <input
                        type="text"
                        value={day.stay || ""}
                        onChange={(e) => handleDayChange(idx, "stay", e.target.value)}
                        placeholder="e.g. Houseboat / Hotel"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Day Activities / Description
                  </label>
                  <textarea
                    rows={3}
                    value={day.description || ""}
                    onChange={(e) => handleDayChange(idx, "description", e.target.value)}
                    placeholder="Describe the day's itinerary details, sightseeing spots, and activities…"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Day Image (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        value={day.image_url || ""}
                        onChange={(e) => handleDayChange(idx, "image_url", e.target.value)}
                        placeholder="Image URL (e.g. /uploads/day-1.jpg or https://...)"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition shrink-0">
                      <Upload className="h-4 w-4 text-primary" />
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
                            const res = await api.upload(data);
                            if (res.ok && res.url) {
                              handleDayChange(idx, "image_url", res.url);
                            } else {
                              alert("Upload failed");
                            }
                          } catch {
                            alert("Upload error");
                          }
                        }}
                      />
                    </label>
                  </div>
                  {day.image_url && (
                    <div className="mt-2.5 relative h-28 w-44 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={day.image_url}
                        alt={`Day ${day.day_number || idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDayChange(idx, "image_url", "")}
                        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={addDay}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary hover:text-primary transition"
            >
              <Plus className="h-4 w-4" /> Add Next Day
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Changes
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

