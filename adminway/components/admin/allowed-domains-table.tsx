"use client";

import { useState, useTransition, useMemo } from "react";
import { createAllowedDomain, updateAllowedDomain, deleteAllowedDomain } from "@/app/admin/allowed-signup-domains/actions";
import type { AllowedSignupDomain } from "@/lib/types";

const cellStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)", verticalAlign: "top" };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 };

export function AllowedDomainsTable({ items }: { items: AllowedSignupDomain[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("domain");

  const filtered = useMemo(() => {
    let list = items;
    if (q) list = list.filter((d) => d.apex_domain.toLowerCase().includes(q.toLowerCase()));
    if (sort === "newest") return [...list].sort((a, b) => b.created_datetime_utc.localeCompare(a.created_datetime_utc));
    if (sort === "oldest") return [...list].sort((a, b) => a.created_datetime_utc.localeCompare(b.created_datetime_utc));
    return [...list].sort((a, b) => a.apex_domain.localeCompare(b.apex_domain));
  }, [items, q, sort]);

  function handleAdd(fd: FormData) {
    startTransition(async () => {
      const result = await createAllowedDomain(fd);
      if (result.error) { setError(result.error); return; }
      setShowAdd(false); setError(null);
    });
  }

  function handleUpdate(id: number, fd: FormData) {
    startTransition(async () => {
      const result = await updateAllowedDomain(id, fd);
      if (result.error) { setError(result.error); return; }
      setEditingId(null); setError(null);
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Remove this domain?")) return;
    startTransition(async () => { await deleteAllowedDomain(id); });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>Allowed Signup Domains</h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>{filtered.length} of {items.length} domains</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search domain…" className="input-jade" style={{ width: "180px", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-jade" style={{ fontSize: "0.7rem", padding: "0.35rem 0.5rem", width: "auto" }}>
            <option value="domain">Domain A→Z</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button onClick={() => setShowAdd(true)} className="btn-jade" style={{ fontSize: "0.7rem" }}>+ Add Domain</button>
        </div>
      </div>

      {error && <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", fontSize: "0.75rem", color: "#ff5050" }}>{error}</div>}

      {showAdd && (
        <div style={{ marginBottom: "1rem", padding: "1rem", background: "rgba(0,255,159,0.04)", border: "1px solid var(--jade-subtle)" }}>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(new FormData(e.currentTarget)); }} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", maxWidth: "500px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Domain *</label>
              <input name="domain" required className="input-jade" style={{ width: "100%" }} placeholder="e.g. example.com" />
            </div>
            <button type="submit" disabled={isPending} className="btn-jade" style={{ fontSize: "0.7rem" }}>{isPending ? "Saving…" : "Add"}</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-jade" style={{ fontSize: "0.7rem", opacity: 0.6 }}>Cancel</button>
          </form>
        </div>
      )}

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Domain</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                {editingId === d.id ? (
                  <td colSpan={4} style={{ padding: "0.5rem 1rem" }}>
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdate(d.id, new FormData(e.currentTarget)); }} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input name="domain" required defaultValue={d.apex_domain} className="input-jade" style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", flex: 1, maxWidth: "300px" }} />
                      <button type="submit" disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>{isPending ? "…" : "Save"}</button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem", opacity: 0.6 }}>Cancel</button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td style={{ ...cellStyle, color: "var(--jade)", fontWeight: 700 }}>#{d.id}</td>
                    <td style={{ ...cellStyle, fontWeight: 600, color: "var(--jade-dim)" }}>{d.apex_domain}</td>
                    <td style={{ ...cellStyle, fontSize: "0.7rem", color: "var(--jade-muted)" }}>{new Date(d.created_datetime_utc).toLocaleDateString()}</td>
                    <td style={{ padding: "0.5rem 1rem", display: "flex", gap: "0.4rem" }}>
                      <button onClick={() => setEditingId(d.id)} disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>Edit</button>
                      <button onClick={() => handleDelete(d.id)} disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem", opacity: 0.6 }}>Del</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !showAdd && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>
            {q ? "No matching domains" : "No allowed domains yet — add one above"}
          </div>
        )}
      </div>
    </div>
  );
}
