import { createAnonClient } from "@/lib/supabase/server";
import { SearchSortBar } from "@/components/admin/search-sort-bar";
import type { LlmModelResponse } from "@/lib/types";

const PAGE_SIZE = 50;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "time_desc", label: "Slowest first" },
  { value: "time_asc", label: "Fastest first" },
];

interface Props {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function LlmResponsesPage({ searchParams }: Props) {
  const { page = "1", sort = "newest" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAnonClient();

  let query = supabase.from("llm_model_responses").select("*", { count: "exact" });

  if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else if (sort === "time_desc") query = query.order("processing_time_seconds", { ascending: false });
  else if (sort === "time_asc") query = query.order("processing_time_seconds", { ascending: true });
  else query = query.order("created_datetime_utc", { ascending: false });

  const { data: responses, count } = await query.range(from, to);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            LLM Responses
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {count ?? 0} total — page {currentPage} of {totalPages || 1} — read only
          </div>
        </div>
        <SearchSortBar q="" sort={sort} sortOptions={SORT_OPTIONS} showSearch={false} />
      </div>

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              {["Caption Req", "Model ID", "Response", "Proc. Time", "Temp", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(responses as LlmModelResponse[])?.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)" }}>#{r.caption_request_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>#{r.llm_model_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-dim)", maxWidth: "360px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.llm_model_response ?? "—"}
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>{r.processing_time_seconds}s</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>{r.llm_temperature ?? "—"}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)" }}>
                  {new Date(r.created_datetime_utc).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!responses || responses.length === 0) && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>No LLM responses found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
          {currentPage > 1 && (
            <a href={`?page=${currentPage - 1}&sort=${sort}`} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.7rem" }}>← Prev</a>
          )}
          {currentPage < totalPages && (
            <a href={`?page=${currentPage + 1}&sort=${sort}`} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.7rem" }}>Next →</a>
          )}
        </div>
      )}
    </div>
  );
}
