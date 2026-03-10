import { createAnonClient } from "@/lib/supabase/server";
import { SearchSortBar } from "@/components/admin/search-sort-bar";
import type { CaptionRequest } from "@/lib/types";

const PAGE_SIZE = 50;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "id_desc", label: "ID ↓" },
  { value: "id_asc", label: "ID ↑" },
];

interface Props {
  searchParams: Promise<{ page?: string; sort?: string; q?: string }>;
}

export default async function CaptionRequestsPage({ searchParams }: Props) {
  const { page = "1", sort = "newest", q = "" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAnonClient();
  let query = supabase.from("caption_requests").select("*", { count: "exact" });

  if (q) query = query.or(`profile_id.eq.${q},image_id.eq.${q}`);

  if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else if (sort === "id_asc") query = query.order("id", { ascending: true });
  else if (sort === "id_desc") query = query.order("id", { ascending: false });
  else query = query.order("created_datetime_utc", { ascending: false });

  const { data: requests, count } = await query.range(from, to);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            Caption Requests
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {count ?? 0} total — page {currentPage} of {totalPages || 1} — read only
          </div>
        </div>
        <SearchSortBar q={q} sort={sort} sortOptions={SORT_OPTIONS} placeholder="Search by profile or image UUID…" />
      </div>

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              {["ID", "Profile ID", "Image ID", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(requests as CaptionRequest[])?.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade)", fontWeight: 700 }}>#{r.id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)", fontFamily: "monospace" }}>{r.profile_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)", fontFamily: "monospace" }}>{r.image_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)" }}>
                  {new Date(r.created_datetime_utc).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!requests || requests.length === 0) && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>No caption requests found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
          {currentPage > 1 && (
            <a href={`?page=${currentPage - 1}&sort=${sort}&q=${q}`} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.7rem" }}>← Prev</a>
          )}
          {currentPage < totalPages && (
            <a href={`?page=${currentPage + 1}&sort=${sort}&q=${q}`} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.7rem" }}>Next →</a>
          )}
        </div>
      )}
    </div>
  );
}
