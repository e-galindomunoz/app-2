"use client";

import { useState, useTransition } from "react";
import { updateHumorMix } from "@/app/admin/humor-mix/actions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { HumorFlavorMix, HumorFlavor } from "@/lib/types";

const cellStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)", verticalAlign: "middle" };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 };

const SORT_OPTIONS = [
  { value: "count_desc", label: "Count ↓" },
  { value: "count_asc", label: "Count ↑" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

interface Props {
  items: HumorFlavorMix[];
  flavors: Pick<HumorFlavor, "id" | "slug">[];
  sort: string;
}

export function HumorMixTable({ items, flavors, sort }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const flavorMap = new Map(flavors.map((f) => [f.id, f.slug]));

  function handleSort(value: string) {
    router.push(`${pathname}?sort=${value}`);
  }

  function handleUpdate(id: number, fd: FormData) {
    startTransition(async () => {
      const result = await updateHumorMix(id, fd);
      if (result.error) { setError(result.error); return; }
      setEditingId(null); setError(null);
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            Humor Mix
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {items.length} entries
          </div>
        </div>
        <select value={sort} onChange={(e) => handleSort(e.target.value)} className="input-jade" style={{ fontSize: "0.7rem", padding: "0.35rem 0.5rem", width: "auto" }}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {error && <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", fontSize: "0.75rem", color: "#ff5050" }}>{error}</div>}

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              <th style={thStyle}>Humor Flavor</th>
              <th style={thStyle}>Caption Count</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                {editingId === m.id ? (
                  <td colSpan={4} style={{ padding: "0.5rem 1rem" }}>
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdate(m.id, new FormData(e.currentTarget)); }} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--jade-dim)", fontWeight: 600, minWidth: "120px" }}>
                        {flavorMap.get(m.humor_flavor_id) ?? `#${m.humor_flavor_id}`}
                      </span>
                      <input
                        name="caption_count"
                        type="number"
                        min="0"
                        required
                        defaultValue={m.caption_count}
                        className="input-jade"
                        style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", width: "100px" }}
                      />
                      <button type="submit" disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>{isPending ? "…" : "Save"}</button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem", opacity: 0.6 }}>Cancel</button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td style={{ ...cellStyle, fontWeight: 600, color: "var(--jade-dim)" }}>
                      {flavorMap.get(m.humor_flavor_id) ?? `#${m.humor_flavor_id}`}
                    </td>
                    <td style={{ ...cellStyle, fontSize: "0.8rem", color: "var(--jade)", fontWeight: 700 }}>{m.caption_count}</td>
                    <td style={{ ...cellStyle, fontSize: "0.7rem", color: "var(--jade-muted)" }}>
                      {new Date(m.created_datetime_utc).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.5rem 1rem" }}>
                      <button onClick={() => setEditingId(m.id)} disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>Edit</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>No humor mix entries found</div>
        )}
      </div>
    </div>
  );
}
