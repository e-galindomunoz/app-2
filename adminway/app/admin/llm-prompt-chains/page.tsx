import { createAnonClient } from "@/lib/supabase/server";
import { SearchSortBar } from "@/components/admin/search-sort-bar";
import type { LlmPromptChain } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "id_desc", label: "ID ↓" },
  { value: "id_asc", label: "ID ↑" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function LlmPromptChainsPage({ searchParams }: Props) {
  const { sort = "id_desc" } = await searchParams;
  const supabase = createAnonClient();

  let query = supabase.from("llm_prompt_chains").select("*");

  if (sort === "id_asc") query = query.order("id", { ascending: true });
  else if (sort === "newest") query = query.order("created_datetime_utc", { ascending: false });
  else if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else query = query.order("id", { ascending: false });

  const { data: chains } = await query;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            LLM Prompt Chains
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {chains?.length ?? 0} chains — read only
          </div>
        </div>
        <SearchSortBar q="" sort={sort} sortOptions={SORT_OPTIONS} showSearch={false} />
      </div>

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              {["ID", "Caption Request ID", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(chains as LlmPromptChain[])?.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade)", fontWeight: 700 }}>#{c.id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)" }}>#{c.caption_request_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)" }}>
                  {new Date(c.created_datetime_utc).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!chains || chains.length === 0) && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>No prompt chains found</div>
        )}
      </div>
    </div>
  );
}
