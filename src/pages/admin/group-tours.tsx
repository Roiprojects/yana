import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Plus, Pencil } from "lucide-react";
import { api } from "@/lib/api/client";
import { ActiveToggle, FeaturedToggle } from "@/components/admin/package-toggles";
import type { AdminPackageRow } from "@/lib/types/admin";

function price(v: string | number | null): string {
  if (v == null) return "—";
  const n = typeof v === "number" ? v : Number(v);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function AdminGroupToursPage() {
  const [items, setItems] = useState<AdminPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.adminPackages();
      const all = (res.items as AdminPackageRow[]) ?? [];
      setItems(all.filter(p => p.tour_type === "group"));
      setError(null);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Group Tours</h1>
          <p className="mt-1 text-sm text-text-secondary">{items.length} group packages · manage visibility and featured status.</p>
        </div>
        <Link to="/admin/packages/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> Add package
        </Link>
      </div>
      {error ? <p className="text-sm text-danger">Error: {error}</p>
        : loading ? <p className="text-sm text-text-secondary">Loading…</p>
        : items.length === 0 ? <p className="text-sm text-text-secondary">No group tour packages found.</p>
        : (
          <div className="overflow-hidden rounded-xl border border-border-soft bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-soft bg-bg-soft text-left text-xs uppercase tracking-wide text-text-secondary">
                    <th className="px-4 py-3 font-semibold">Package</th>
                    <th className="px-4 py-3 font-semibold">Scope</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 text-center font-semibold">Active</th>
                    <th className="px-4 py-3 text-center font-semibold">Featured</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {items.map(p => (
                    <tr key={p.id} className="hover:bg-bg-soft/50">
                      <td className="px-4 py-3"><div className="font-semibold">{p.title}</div><div className="text-xs text-text-secondary">{p.slug}</div></td>
                      <td className="px-4 py-3 capitalize">{p.scope}</td>
                      <td className="px-4 py-3 font-medium">{price(p.price_amount)}</td>
                      <td className="px-4 py-3 text-center"><ActiveToggle id={p.id} active={p.is_active} onChanged={load} /></td>
                      <td className="px-4 py-3 text-center"><FeaturedToggle id={p.id} featured={p.is_featured} onChanged={load} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/admin/packages/${p.id}/edit`} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                          <Link to={`/packages/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-text-secondary hover:text-primary">Open <ExternalLink className="h-3.5 w-3.5" /></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
