"use client";

import { useState, useTransition, useMemo } from "react";
import { createLlmProvider, updateLlmProvider, deleteLlmProvider } from "@/app/admin/llm-providers/actions";
import type { LlmProvider } from "@/lib/types";

const cellStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)", verticalAlign: "top" };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 };

function ProviderForm({ initial, onSave, onCancel, isPending }: { initial?: LlmProvider; onSave: (fd: FormData) => void; onCancel: () => void; isPending: boolean }) {
  return (
    <tr style={{ background: "rgba(0,255,159,0.04)", borderBottom: "1px solid var(--jade-subtle)" }}>
      <td colSpan={3} style={{ padding: "1rem" }}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.currentTarget)); }} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", maxWidth: "500px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Name *</label>
            <input name="name" required defaultValue={initial?.name} className="input-jade" style={{ width: "100%" }} placeholder="e.g. OpenAI" />
          </div>
          <button type="submit" disabled={isPending} className="btn-jade" style={{ fontSize: "0.7rem" }}>{isPending ? "Saving…" : initial ? "Update" : "Create"}</button>
          <button type="button" onClick={onCancel} className="btn-jade" style={{ fontSize: "0.7rem", opacity: 0.6 }}>Cancel</button>
        </form>
      </td>
    </tr>
  );
}

export function LlmProvidersTable({ items }: { items: LlmProvider[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => {
    let list = items;
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === "newest") return [...list].sort((a, b) => b.created_datetime_utc.localeCompare(a.created_datetime_utc));
    if (sort === "oldest") return [...list].sort((a, b) => a.created_datetime_utc.localeCompare(b.created_datetime_utc));
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [items, q, sort]);

  function handleAdd(fd: FormData) {
    startTransition(async () => {
      const result = await createLlmProvider(fd);
      if (result.error) { setError(result.error); return; }
      setShowAdd(false); setError(null);
    });
  }

  function handleEdit(id: number, fd: FormData) {
    startTransition(async () => {
      const result = await updateLlmProvider(id, fd);
      if (result.error) { setError(result.error); return; }
      setEditingId(null); setError(null);
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this provider? This may break linked models.")) return;
    startTransition(async () => { await deleteLlmProvider(id); });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>LLM Providers</h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>{filtered.length} of {items.length} providers</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input-jade" style={{ width: "160px", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-jade" style={{ fontSize: "0.7rem", padding: "0.35rem 0.5rem", width: "auto" }}>
            <option value="name">Name A→Z</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="btn-jade" style={{ fontSize: "0.7rem" }}>+ Add Provider</button>
        </div>
      </div>

      {error && <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", fontSize: "0.75rem", color: "#ff5050" }}>{error}</div>}

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {showAdd && <ProviderForm onSave={handleAdd} onCancel={() => setShowAdd(false)} isPending={isPending} />}
            {filtered.map((p) =>
              editingId === p.id ? (
                <ProviderForm key={p.id} initial={p} onSave={(fd) => handleEdit(p.id, fd)} onCancel={() => setEditingId(null)} isPending={isPending} />
              ) : (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                  <td style={{ ...cellStyle, fontWeight: 600, color: "var(--jade-dim)" }}>{p.name}</td>
                  <td style={{ ...cellStyle, fontSize: "0.7rem", color: "var(--jade-muted)" }}>{new Date(p.created_datetime_utc).toLocaleDateString()}</td>
                  <td style={{ padding: "0.5rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => { setEditingId(p.id); setShowAdd(false); }} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem", opacity: 0.6 }}>Del</button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {filtered.length === 0 && !showAdd && <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>{q ? "No matching providers" : "No providers yet"}</div>}
      </div>
    </div>
  );
}
