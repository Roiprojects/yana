import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/api/client";
import type {
  AboutContent,
  AboutValue,
  SiteSettings,
} from "@/lib/types/content";

type AboutForm = {
  headline: string;
  intro: string;
  offerings: string;
  values: AboutValue[];
};

function textField(
  label: string,
  value: string,
  onChange: (v: string) => void,
  opts: { placeholder?: string; hint?: string; textarea?: boolean } = {},
) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
      </label>
      {opts.textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={opts.placeholder}
          rows={5}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={opts.placeholder}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      )}
      {opts.hint && <p className="mt-1 text-xs text-slate-400">{opts.hint}</p>}
    </div>
  );
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AboutClient() {
  const [form, setForm] = useState<AboutForm>({
    headline: "",
    intro: "",
    offerings: "",
    values: [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getPublicSettings()
      .then((res: SiteSettings) => {
        if (cancelled) return;
        const about: AboutContent = res.about ?? {};
        const rawIntro = about.intro;
        const introStr = Array.isArray(rawIntro)
          ? rawIntro.join("\n")
          : typeof rawIntro === "string"
          ? rawIntro
          : "";
        const rawOfferings = about.offerings;
        const offeringsStr = Array.isArray(rawOfferings)
          ? rawOfferings.join("\n")
          : typeof rawOfferings === "string"
          ? rawOfferings
          : "";
        setForm({
          headline: about.headline ?? "",
          intro: introStr,
          offerings: offeringsStr,
          values: Array.isArray(about.values) ? about.values : [],
        });
      })
      .catch(() => {
        /* keep empty form */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key: keyof AboutForm) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const setValue = (index: number, patch: Partial<AboutValue>) =>
    setForm((f) => ({
      ...f,
      values: f.values.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));

  const addValue = () =>
    setForm((f) => ({ ...f, values: [...f.values, { title: "", desc: "" }] }));

  const removeValue = (index: number) =>
    setForm((f) => ({ ...f, values: f.values.filter((_, i) => i !== index) }));

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const value: AboutContent = {
      headline: form.headline.trim() || undefined,
      intro: splitLines(form.intro),
      offerings: splitLines(form.offerings),
      values: form.values
        .filter((v) => v.title.trim() || v.desc.trim())
        .map((v) => ({ title: v.title.trim(), desc: v.desc.trim() })),
    };
    try {
      const res = await api.saveSettings(
        "about",
        value as unknown as Record<string, unknown>,
      );
      setMessage(
        res.ok ? "Saved. Changes appear on the About page." : "Save failed.",
      );
    } catch {
      setMessage("Error saving about content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0c1e36]">About Us</h1>
        <p className="mt-1 text-sm text-slate-500">
          Company story shown on the public About page. One item per line for
          intro paragraphs and offerings; leave a section blank to keep the
          built-in defaults.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        {textField("Headline", form.headline, set("headline"), {
          placeholder: "Welcome to Yana Travels",
        })}
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        {textField("Intro paragraphs", form.intro, set("intro"), {
          textarea: true,
          hint: "One paragraph per line.",
        })}
        {textField("Offerings", form.offerings, set("offerings"), {
          textarea: true,
          hint: "One offering per line.",
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Values
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Shown as cards on the About page. Empty values are skipped.
            </p>
          </div>
          <button
            type="button"
            onClick={addValue}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add value
          </button>
        </div>
        <div className="space-y-3">
          {form.values.length === 0 && (
            <p className="text-sm text-slate-400">No values yet.</p>
          )}
          {form.values.map((v, i) => (
            <div
              key={i}
              className="grid items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                type="text"
                value={v.title}
                onChange={(e) => setValue(i, { title: e.target.value })}
                placeholder="Title"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                value={v.desc}
                onChange={(e) => setValue(i, { desc: e.target.value })}
                placeholder="Description"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => removeValue(i)}
                aria-label={`Remove value ${i + 1}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save About Content
        </button>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </div>
    </div>
  );
}
