
import { type AdminFaqRow } from "@/lib/types/admin";
import { useModuleItems } from "@/lib/hooks/use-module-items";
import { CrudManager, type FieldDef } from "@/components/admin/crud-manager";

const fields: FieldDef[] = [
  {
    name: "question",
    label: "Question",
    type: "text",
    placeholder: "e.g. How do I book a trip?",
  },
  {
    name: "answer",
    label: "Answer",
    type: "textarea",
    placeholder: "Write the full answer here...",
  },
  {
    name: "category",
    label: "Category",
    type: "text",
    placeholder: "e.g. Booking, Visa, Payment",
    defaultValue: "General",
  },
];

export function FaqsClient() {
  const { items, loading, error, reload } =
    useModuleItems<AdminFaqRow>("faqs");

  if (loading)
    return <p className="text-sm text-slate-500">Loading FAQs…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <CrudManager<AdminFaqRow>
      title="FAQs"
      description="Manage frequently asked questions displayed on the website."
      module="faqs"
      items={items}
      onReload={reload}
      fields={fields}
      columns={[
        {
          key: "question",
          label: "Question",
          render: (item) => (
            <div>
              <div className="font-bold text-slate-900 line-clamp-2">{item.question}</div>
              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.answer}</div>
            </div>
          ),
        },
        { key: "category", label: "Category" },
      ]}
    />
  );
}
