
import { type AdminServiceRow } from "@/lib/types/admin";
import { useModuleItems } from "@/lib/hooks/use-module-items";
import { CrudManager, type FieldDef } from "@/components/admin/crud-manager";
import { ImageIcon } from "lucide-react";

const fields: FieldDef[] = [
  {
    name: "name",
    label: "Service Name",
    type: "text",
    placeholder: "e.g. Flight Booking",
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    placeholder: "e.g. flight-booking",
  },
  {
    name: "image_url",
    label: "Service Image / Photo",
    type: "image",
    placeholder: "Upload an image or paste URL (e.g. /services/service-flight.jpg)",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Brief summary of service offered...",
  },
];

export function ServicesClient() {
  const { items, loading, error, reload } =
    useModuleItems<AdminServiceRow>("services");

  if (loading)
    return <p className="text-sm text-slate-500">Loading services…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <CrudManager<AdminServiceRow>
      title="Services"
      description="Manage services offered by Yana Travels (Flight Bookings, Forex, Visas, Hotels, etc.)."
      module="services"
      items={items}
      onReload={reload}
      fields={fields}
      columns={[
        {
          key: "name",
          label: "Service",
          render: (item) => (
            <div className="flex items-center gap-3.5">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-12 w-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-xs"
                />
              ) : (
                <div className="flex h-12 w-16 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 shrink-0">
                  <ImageIcon className="h-5 w-5 opacity-40" />
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500">{item.slug}</div>
              </div>
            </div>
          ),
        },
        {
          key: "description",
          label: "Description",
          render: (item) => item.description || "—",
        },
      ]}
    />
  );
}
