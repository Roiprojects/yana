
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api/client";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "image" | "video" | "checkbox";
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

interface CrudManagerProps<T extends { id: string; is_active?: boolean }> {
  title: string;
  description: string;
  /** DB table name — also the API module key. */
  module: string;
  items: T[];
  columns: {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }[];
  fields: FieldDef[];
  onReload: () => void;
}

export function CrudManager<T extends { id: string; is_active?: boolean }>({
  title,
  description,
  module,
  items,
  columns,
  fields,
  onReload,
}: CrudManagerProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreate() {
    setEditingItem(null);
    setImageUrls({});
    setModalOpen(true);
  }

  function openEdit(item: T) {
    setEditingItem(item);
    const initialImages: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.type === "image" && item[f.name as keyof T]) {
        initialImages[f.name] = String(item[f.name as keyof T]);
      }
    });
    setImageUrls(initialImages);
    setModalOpen(true);
  }

  async function handleToggle(id: string, current: boolean) {
    await api.toggleModule(module, id, current);
    onReload();
  }

  async function handleDelete(id: string) {
    await api.deleteModule(module, id);
    setDeleteConfirmId(null);
    onReload();
  }

  async function handleImageUpload(
    fieldName: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    const data = new FormData();
    data.append("file", file);

    try {
      const json = await api.upload(data);
      if (json.ok && json.url) {
        setImageUrls((prev) => ({ ...prev, [fieldName]: json.url as string }));
      } else {
        alert("Image upload failed: " + (json.error || "Unknown error"));
      }
    } catch {
      alert("Image upload failed");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    Object.entries(imageUrls).forEach(([k, v]) => {
      formData.set(k, v);
    });

    const body: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });

    try {
      const res = await api.saveModule(module, body);
      if (res.ok) {
        setModalOpen(false);
        onReload();
      } else {
        alert(res.error || "Save failed");
      }
    } catch (err) {
      alert("Error saving record: " + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0c1e36]">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Add {title.replace(/s$/i, "")}
        </button>
      </div>

      {/* Data Table */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-bold text-slate-700">No records found</p>
          <p className="mt-1 text-sm text-slate-500">
            Click "Add" above to create your first record.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {columns.map((col) => (
                    <th key={String(col.key)} className="px-5 py-3.5">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="px-5 py-4 font-medium text-slate-800"
                      >
                        {col.render
                          ? col.render(item)
                          : String(item[col.key as keyof T] ?? "—")}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(item.id, Boolean(item.is_active))
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {item.is_active ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />{" "}
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-slate-400" />{" "}
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900">
              {editingItem
                ? `Edit ${title.replace(/s$/i, "")}`
                : `Add New ${title.replace(/s$/i, "")}`}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {editingItem && (
                <input type="hidden" name="id" value={editingItem.id} />
              )}

              {fields.map((f) => {
                const val = editingItem
                  ? (editingItem[f.name as keyof T] as unknown)
                  : f.defaultValue;

                if (f.type === "textarea") {
                  return (
                    <div key={f.name}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        {f.label}
                      </label>
                      <textarea
                        name={f.name}
                        rows={3}
                        defaultValue={(val as string) ?? ""}
                        placeholder={f.placeholder}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  );
                }

                if (f.type === "select") {
                  return (
                    <div key={f.name}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        {f.label}
                      </label>
                      <select
                        name={f.name}
                        defaultValue={(val as string) ?? f.options?.[0]?.value}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                      >
                        {f.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (f.type === "image") {
                  const currentImg = imageUrls[f.name] || (val as string) || "";
                  return (
                    <div key={f.name}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        {f.label}
                      </label>
                      {currentImg && (
                        <div className="mb-2 relative h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          <img
                            src={currentImg}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <input
                          type="hidden"
                          name={f.name}
                          value={imageUrls[f.name] || currentImg}
                        />
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                          {uploadingField === f.name ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-4 w-4 text-primary" />
                          )}
                          {uploadingField === f.name
                            ? "Uploading…"
                            : "Upload Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(f.name, e)}
                          />
                        </label>
                        {currentImg && (
                          <span className="text-xs text-slate-400 truncate max-w-[200px]">
                            {currentImg}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                if (f.type === "video") {
                  const currentVideo = imageUrls[f.name] || (val as string) || "";
                  return (
                    <div key={f.name}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        {f.label}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          name={f.name}
                          defaultValue={currentVideo}
                          placeholder={f.placeholder}
                          onChange={(e) =>
                            setImageUrls((prev) => ({
                              ...prev,
                              [f.name]: e.target.value,
                            }))
                          }
                          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shrink-0">
                          {uploadingField === f.name ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-4 w-4 text-primary" />
                          )}
                          {uploadingField === f.name ? "Uploading…" : "Upload MP4"}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(f.name, e)}
                          />
                        </label>
                      </div>
                    </div>
                  );
                }

                if (f.type === "checkbox") {
                  return (
                    <div key={f.name} className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={f.name}
                        name={f.name}
                        defaultChecked={Boolean(val)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={f.name}
                        className="text-sm font-semibold text-slate-700"
                      >
                        {f.label}
                      </label>
                    </div>
                  );
                }

                return (
                  <div key={f.name}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      defaultValue={(val as string) ?? ""}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                );
              })}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-150 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-slate-900">Are you sure?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This record will be permanently deleted from the database.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
