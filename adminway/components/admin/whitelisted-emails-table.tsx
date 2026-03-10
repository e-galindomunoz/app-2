"use client";

import { useState, useTransition, useMemo } from "react";
import { createWhitelistedEmail, deleteWhitelistedEmail } from "@/app/admin/whitelisted-emails/actions";
import type { WhitelistedEmail } from "@/lib/types";

const cellStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)", verticalAlign: "top" };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 };

export function WhitelistedEmailsTable({ items }: { items: WhitelistedEmail[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("email");

  const filtered = useMemo(() => {
    let list = items;
    if (q) list = list.filter((e) => e.email_address.toLowerCase().includes(q.toLowerCase()));
    if (sort === "newest") return [...list].sort((a, b) => b.created_datetime_utc.localeCompare(a.created_datetime_utc));
    if (sort === "oldest") return [...list].sort((a, b) => a.created_datetime_utc.localeCompare(b.created_datetime_utc));
    return [...list].sort((a, b) => a.email_address.localeCompare(b.email_address));
  }, [items, q, sort]);

  function handleAdd(fd: FormData) {
    startTransition(async () => {
      const result = await createWhitelistedEmail(fd);
      if (result.error) { setError(result.error); return; }
      setShowAdd(false); setError(null);
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Remove this email?")) return;
    startTransition(async () => { await deleteWhitelistedEmail(id); });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>Whitelisted Emails</h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>{filtered.length} of {items.length} emails</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email…" className="input-jade" style={{ width: "200px", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-jade" style={{ fontSize: "0.7rem", padding: "0.35rem 0.5rem", width: "auto" }}>
            <option value="email">Email A→Z</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button onClick={() => setShowAdd(true)} className="btn-jade" style={{ fontSize: "0.7rem" }}>+ Add Email</button>
        </div>
      </div>

      {error && <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", fontSize: "0.75rem", color: "#ff5050" }}>{error}</div>}

      {showAdd && (
        <div style={{ marginBottom: "1rem", padding: "1rem", background: "rgba(0,255,159,0.04)", border: "1px solid var(--jade-subtle)" }}>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(new FormData(e.currentTarget)); }} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", maxWidth: "500px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Email *</label>
              <input name="email" type="email" required className="input-jade" style={{ width: "100%" }} placeholder="user@example.com" />
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
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td style={{ ...cellStyle, fontWeight: 600, color: "var(--jade-dim)" }}>{e.email_address}</td>
                <td style={{ ...cellStyle, fontSize: "0.7rem", color: "var(--jade-muted)" }}>{new Date(e.created_datetime_utc).toLocaleDateString()}</td>
                <td style={{ padding: "0.5rem 1rem" }}>
                  <button onClick={() => handleDelete(e.id)} disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem", opacity: 0.6 }}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !showAdd && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>
            {q ? "No matching emails" : "No whitelisted emails yet — add one above"}
          </div>
        )}
      </div>
    </div>
  );
}
