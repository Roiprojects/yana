import { type AdminDepartureRow } from "@/lib/types/admin";
import { useModuleItems } from "@/lib/hooks/use-module-items";
import { CrudManager, type FieldDef } from "@/components/admin/crud-manager";
import { Calendar, MapPin, ImageIcon } from "lucide-react";

const fields: FieldDef[] = [
  {
    name: "title",
    label: "Tour / Departure Name",
    type: "text",
    placeholder: "e.g. Chardham Yatra 2026 Luxury Departure",
  },
  {
    name: "departure_date",
    label: "Departure Date",
    type: "text",
    placeholder: "e.g. 15 May 2026",
  },
  {
    name: "return_date",
    label: "Return Date",
    type: "text",
    placeholder: "e.g. 25 May 2026",
  },
  {
    name: "boarding_point",
    label: "Boarding Point / Hub",
    type: "text",
    placeholder: "e.g. Bangalore / Haridwar",
  },
  {
    name: "price",
    label: "Price per Person",
    type: "text",
    placeholder: "e.g. ₹85,000",
  },
  {
    name: "seats_available",
    label: "Seats Available / Capacity",
    type: "text",
    placeholder: "e.g. 8 Seats Left / Filling Fast",
  },
  {
    name: "status",
    label: "Departure Status",
    type: "select",
    options: [
      { label: "Available", value: "Available" },
      { label: "Filling Fast", value: "Filling Fast" },
      { label: "Guaranteed Departure", value: "Guaranteed" },
      { label: "Waitlist", value: "Waitlist" },
      { label: "Sold Out", value: "Sold Out" },
    ],
  },
  {
    name: "image_url",
    label: "Tour / Departure Photo",
    type: "image",
    placeholder: "Upload an image or paste URL",
  },
  {
    name: "package_slug",
    label: "Linked Package Slug (Optional)",
    type: "text",
    placeholder: "e.g. chardham-yatra-luxury",
  },
];

export function DeparturesClient() {
  const { items, loading, error, reload } =
    useModuleItems<AdminDepartureRow>("departures");

  if (loading)
    return <p className="text-sm text-slate-500">Loading departures…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <CrudManager<AdminDepartureRow>
      title="Departures"
      description="Manage upcoming fixed & guaranteed departure dates, pricing, and seat availability."
      module="departures"
      items={items}
      onReload={reload}
      fields={fields}
      columns={[
        {
          key: "title",
          label: "Tour & Boarding",
          render: (item) => (
            <div className="flex items-center gap-3.5">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-12 w-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-xs"
                />
              ) : (
                <div className="flex h-12 w-16 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 shrink-0">
                  <ImageIcon className="h-5 w-5 opacity-40" />
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900 line-clamp-1">
                  {item.title}
                </div>
                {item.boarding_point && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="h-3 w-3 text-sky-500 shrink-0" />
                    <span>{item.boarding_point}</span>
                  </div>
                )}
              </div>
            </div>
          ),
        },
        {
          key: "departure_date",
          label: "Dates",
          render: (item) => (
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <Calendar className="h-3 w-3 text-emerald-600" />
                <span>{item.departure_date}</span>
              </div>
              {item.return_date && (
                <div className="text-slate-500 pl-4">
                  to {item.return_date}
                </div>
              )}
            </div>
          ),
        },
        {
          key: "price",
          label: "Price",
          render: (item) => (
            <span className="font-semibold text-slate-900">
              {item.price || "Contact for price"}
            </span>
          ),
        },
        {
          key: "seats_available",
          label: "Availability",
          render: (item) => {
            const status = (item.status || "").toLowerCase();
            const isFillingFast = status.includes("filling") || (item.seats_available || "").toLowerCase().includes("filling");
            const isSoldOut = status.includes("sold");
            return (
              <div className="flex flex-col gap-1 items-start">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSoldOut
                      ? "bg-rose-100 text-rose-800"
                      : isFillingFast
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {item.status || "Available"}
                </span>
                {item.seats_available && (
                  <span className="text-[11px] text-slate-500">
                    {item.seats_available}
                  </span>
                )}
              </div>
            );
          },
        },
      ]}
    />
  );
}
