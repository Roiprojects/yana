import { type AdminThemeRow } from "@/lib/types/admin";
import { useModuleItems } from "@/lib/hooks/use-module-items";
import { CrudManager, type FieldDef } from "@/components/admin/crud-manager";

const fields: FieldDef[] = [
  {
    name: "title",
    label: "Theme Title",
    type: "text",
    placeholder: "e.g. Mountains & the North",
  },
  {
    name: "tag",
    label: "Tag / Badge Label",
    type: "text",
    placeholder: "e.g. ALPINE SERENITY",
  },
  {
    name: "blurb",
    label: "Description / Blurb",
    type: "textarea",
    placeholder: "Short narrative describing the theme...",
  },
  {
    name: "href",
    label: "Target Link (URL)",
    type: "text",
    placeholder: "e.g. /group-tours/domestic",
    defaultValue: "/packages",
  },
  {
    name: "scope",
    label: "Scope",
    type: "select",
    options: [
      { label: "All Packages", value: "all" },
      { label: "Domestic Only", value: "domestic" },
      { label: "International Only", value: "international" },
    ],
  },
  {
    name: "image_url",
    label: "Theme Cover Image",
    type: "image",
  },
];

export function ThemesClient() {
  const { items, loading, error, reload } =
    useModuleItems<AdminThemeRow>("curated_themes");

  if (loading)
    return <p className="text-sm text-slate-500">Loading travel themes…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <CrudManager<AdminThemeRow>
      title="Curated Themes"
      description="Manage theme cards (Mountains, Beaches, Heritage, International) displayed on the home page."
      module="curated_themes"
      items={items}
      onReload={reload}
      fields={fields}
      columns={[
        {
          key: "title",
          label: "Theme",
          render: (item) => (
            <div className="flex items-center gap-3">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-12 w-16 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="h-12 w-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  No img
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900">{item.title}</div>
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                  {item.tag}
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "href",
          label: "Target Link",
          render: (item) => (
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
              {item.href}
            </span>
          ),
        },
        {
          key: "scope",
          label: "Scope",
          render: (item) => <span className="capitalize">{item.scope}</span>,
        },
      ]}
    />
  );
}
