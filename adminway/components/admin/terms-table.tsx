"use client";

import { useState, useTransition, useMemo } from "react";
import { createTerm, updateTerm, deleteTerm } from "@/app/admin/terms/actions";
import type { Term } from "@/lib/types";

const cellStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)", verticalAlign: "top" };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 };

function TermForm({ initial, onSave, onCancel, isPending }: { initial?: Term; onSave: (fd: FormData) => void; onCancel: () => void; isPending: boolean }) {
  return (
    <tr style={{ background: "rgba(0,255,159,0.04)", borderBottom: "1px solid var(--jade-subtle)" }}>
      <td colSpan={6} style={{ padding: "1rem" }}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.currentTarget)); }} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "700px" }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Term *</label>
              <input name="term" required defaultValue={initial?.term} className="input-jade" style={{ width: "100%" }} placeholder="e.g. slapstick" />
            </div>
            <div style={{ minWidth: "80px" }}>
              <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Priority</label>
              <input name="priority" type="number" defaultValue={initial?.priority ?? 0} className="input-jade" style={{ width: "100%" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Definition *</label>
            <textarea name="definition" required defaultValue={initial?.definition ?? ""} className="input-jade" rows={2} style={{ width: "100%", resize: "vertical" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Example *</label>
            <textarea name="example" required defaultValue={initial?.example ?? ""} className="input-jade" rows={2} style={{ width: "100%", resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" disabled={isPending} className="btn-jade" style={{ fontSize: "0.7rem" }}>{isPending ? "Saving…" : initial ? "Update" : "Create"}</button>
            <button type="button" onClick={onCancel} className="btn-jade" style={{ fontSize: "0.7rem", opacity: 0.6 }}>Cancel</button>
          </div>
        </form>
      </td>
    </tr>
  );
}

export function TermsTable({ items }: { items: Term[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("term");

  const filtered = useMemo(() => {
    let list = items;
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter((t) => t.term.toLowerCase().includes(lq) || t.definition?.toLowerCase().includes(lq) || t.example?.toLowerCase().includes(lq));
    }
    if (sort === "term") return [...list].sort((a, b) => a.term.localeCompare(b.term));
    if (sort === "priority") return [...list].sort((a, b) => b.priority - a.priority);
    if (sort === "oldest") return [...list].sort((a, b) => a.created_datetime_utc.localeCompare(b.created_datetime_utc));
    return [...list].sort((a, b) => b.created_datetime_utc.localeCompare(a.created_datetime_utc));
  }, [items, q, sort]);

  function handleAdd(fd: FormData) {
    startTransition(async () => {
      const result = await createTerm(fd);
      if (result.error) { setError(result.error); return; }
      setShowAdd(false); setError(null);
    });
  }

  function handleEdit(id: number, fd: FormData) {
    startTransition(async () => {
      const result = await updateTerm(id, fd);
      if (result.error) { setError(result.error); return; }
      setEditingId(null); setError(null);
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this term?")) return;
    startTransition(async () => { await deleteTerm(id); });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>Terms</h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>{filtered.length} of {items.length} terms</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input-jade" style={{ width: "180px", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-jade" style={{ fontSize: "0.7rem", padding: "0.35rem 0.5rem", width: "auto" }}>
            <option value="term">Term A→Z</option>
            <option value="priority">Priority ↓</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="btn-jade" style={{ fontSize: "0.7rem" }}>+ Add Term</button>
        </div>
      </div>

      {error && <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", fontSize: "0.75rem", color: "#ff5050" }}>{error}</div>}

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              <th style={thStyle}>Term</th>
              <th style={thStyle}>Definition</th>
              <th style={thStyle}>Example</th>
              <th style={thStyle}>Priority</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {showAdd && <TermForm onSave={handleAdd} onCancel={() => setShowAdd(false)} isPending={isPending} />}
            {filtered.map((t) =>
              editingId === t.id ? (
                <TermForm key={t.id} initial={t} onSave={(fd) => handleEdit(t.id, fd)} onCancel={() => setEditingId(null)} isPending={isPending} />
              ) : (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                  <td style={{ ...cellStyle, fontWeight: 600, color: "var(--jade-dim)" }}>{t.term}</td>
                  <td style={{ ...cellStyle, color: "var(--jade-muted)", maxWidth: "200px" }}>{t.definition}</td>
                  <td style={{ ...cellStyle, color: "var(--jade-muted)", maxWidth: "200px" }}>{t.example}</td>
                  <td style={{ ...cellStyle, color: "var(--jade-muted)" }}>{t.priority}</td>
                  <td style={{ ...cellStyle, fontSize: "0.7rem", color: "var(--jade-muted)" }}>{new Date(t.created_datetime_utc).toLocaleDateString()}</td>
                  <td style={{ padding: "0.5rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => { setEditingId(t.id); setShowAdd(false); }} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>Edit</button>
                      <button onClick={() => handleDelete(t.id)} disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem", opacity: 0.6 }}>Del</button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {filtered.length === 0 && !showAdd && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>
            {q ? "No matching terms" : "No terms yet — add one above"}
          </div>
        )}
      </div>
    </div>
  );
}
