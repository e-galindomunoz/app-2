"use client";

import { useState, useTransition, useMemo } from "react";
import { createLlmModel, updateLlmModel, deleteLlmModel } from "@/app/admin/llm-models/actions";
import type { LlmModel, LlmProvider } from "@/lib/types";

const cellStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)", verticalAlign: "top" };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 };

function ModelForm({ initial, providers, onSave, onCancel, isPending }: { initial?: LlmModel; providers: LlmProvider[]; onSave: (fd: FormData) => void; onCancel: () => void; isPending: boolean }) {
  return (
    <tr style={{ background: "rgba(0,255,159,0.04)", borderBottom: "1px solid var(--jade-subtle)" }}>
      <td colSpan={7} style={{ padding: "1rem" }}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.currentTarget)); }} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "700px" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Name *</label>
              <input name="name" required defaultValue={initial?.name} className="input-jade" style={{ width: "100%" }} placeholder="e.g. GPT-4o" />
            </div>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Provider Model ID *</label>
              <input name="provider_model_id" required defaultValue={initial?.provider_model_id} className="input-jade" style={{ width: "100%" }} placeholder="gpt-4o" />
            </div>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <label style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Provider *</label>
              <select name="llm_provider_id" required defaultValue={initial?.llm_provider_id ?? ""} className="input-jade" style={{ width: "100%" }}>
                <option value="">— Select —</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--jade-dim)", cursor: "pointer" }}>
            <input type="checkbox" name="is_temperature_supported" defaultChecked={initial?.is_temperature_supported ?? false} />
            Temperature Supported
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" disabled={isPending} className="btn-jade" style={{ fontSize: "0.7rem" }}>{isPending ? "Saving…" : initial ? "Update" : "Create"}</button>
            <button type="button" onClick={onCancel} className="btn-jade" style={{ fontSize: "0.7rem", opacity: 0.6 }}>Cancel</button>
          </div>
        </form>
      </td>
    </tr>
  );
}

export function LlmModelsTable({ items, providers }: { items: LlmModel[]; providers: LlmProvider[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");

  const providerMap = new Map(providers.map((p) => [p.id, p.name]));

  const filtered = useMemo(() => {
    let list = items;
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(lq) || m.provider_model_id.toLowerCase().includes(lq));
    }
    if (sort === "provider") return [...list].sort((a, b) => (providerMap.get(a.llm_provider_id) ?? "").localeCompare(providerMap.get(b.llm_provider_id) ?? ""));
    if (sort === "newest") return [...list].sort((a, b) => b.created_datetime_utc.localeCompare(a.created_datetime_utc));
    if (sort === "oldest") return [...list].sort((a, b) => a.created_datetime_utc.localeCompare(b.created_datetime_utc));
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [items, q, sort, providerMap]);

  function handleAdd(fd: FormData) {
    startTransition(async () => {
      const result = await createLlmModel(fd);
      if (result.error) { setError(result.error); return; }
      setShowAdd(false); setError(null);
    });
  }

  function handleEdit(id: number, fd: FormData) {
    startTransition(async () => {
      const result = await updateLlmModel(id, fd);
      if (result.error) { setError(result.error); return; }
      setEditingId(null); setError(null);
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this model?")) return;
    startTransition(async () => { await deleteLlmModel(id); });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>LLM Models</h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>{filtered.length} of {items.length} models</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or model ID…" className="input-jade" style={{ width: "200px", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-jade" style={{ fontSize: "0.7rem", padding: "0.35rem 0.5rem", width: "auto" }}>
            <option value="name">Name A→Z</option>
            <option value="provider">Provider</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="btn-jade" style={{ fontSize: "0.7rem" }}>+ Add Model</button>
        </div>
      </div>

      {error && <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", fontSize: "0.75rem", color: "#ff5050" }}>{error}</div>}

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Provider Model ID</th>
              <th style={thStyle}>Provider</th>
              <th style={thStyle}>Temp?</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {showAdd && <ModelForm providers={providers} onSave={handleAdd} onCancel={() => setShowAdd(false)} isPending={isPending} />}
            {filtered.map((m) =>
              editingId === m.id ? (
                <ModelForm key={m.id} initial={m} providers={providers} onSave={(fd) => handleEdit(m.id, fd)} onCancel={() => setEditingId(null)} isPending={isPending} />
              ) : (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                  <td style={{ ...cellStyle, color: "var(--jade)", fontWeight: 700 }}>#{m.id}</td>
                  <td style={{ ...cellStyle, fontWeight: 600 }}>{m.name}</td>
                  <td style={{ ...cellStyle, color: "var(--jade-muted)", fontFamily: "monospace", fontSize: "0.7rem" }}>{m.provider_model_id}</td>
                  <td style={{ ...cellStyle, color: "var(--jade-muted)" }}>{providerMap.get(m.llm_provider_id) ?? `#${m.llm_provider_id}`}</td>
                  <td style={{ ...cellStyle, color: m.is_temperature_supported ? "var(--jade)" : "var(--jade-muted)", fontWeight: 600 }}>{m.is_temperature_supported ? "✓" : "✗"}</td>
                  <td style={{ ...cellStyle, fontSize: "0.7rem", color: "var(--jade-muted)" }}>{new Date(m.created_datetime_utc).toLocaleDateString()}</td>
                  <td style={{ padding: "0.5rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => { setEditingId(m.id); setShowAdd(false); }} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>Edit</button>
                      <button onClick={() => handleDelete(m.id)} disabled={isPending} className="btn-jade" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem", opacity: 0.6 }}>Del</button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {filtered.length === 0 && !showAdd && <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>{q ? "No matching models" : "No models yet"}</div>}
      </div>
    </div>
  );
}
