import { createAnonClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Caption } from "@/lib/types";
import { CaptionFilters } from "@/components/captions/caption-filters";
import { CaptionCopy } from "@/components/captions/caption-copy";

const PAGE_SIZE = 50;

interface Props {
  searchParams: Promise<{ sort?: string; visibility?: string; page?: string; q?: string }>;
}

export default async function CaptionsPage({ searchParams }: Props) {
  const { sort = "newest", visibility = "all", page = "1", q = "" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAnonClient();

  let query = supabase
    .from("captions")
    .select("*", { count: "exact" })
    .not("content", "is", null)
    .neq("content", "");

  if (q) query = query.ilike("content", `%${q}%`);
  if (visibility === "public") query = query.eq("is_public", true);
  if (visibility === "private") query = query.eq("is_public", false);
  if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else if (sort === "likes") query = query.order("like_count", { ascending: false });
  else if (sort === "least") query = query.order("like_count", { ascending: true });
  else query = query.order("created_datetime_utc", { ascending: false });

  const { data: captions, count } = await query.range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildHref = (p: number) => {
    const params = new URLSearchParams({ sort, visibility, page: String(p), q });
    return `?${params.toString()}`;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2rem",
          gap: "1rem",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--jade)",
              marginBottom: "0.25rem",
            }}
          >
            Captions
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {count ?? 0} total — page {currentPage} of {totalPages || 1} — read only
          </div>
        </div>

        <CaptionFilters sort={sort} visibility={visibility} q={q} />
      </div>

      <div
        style={{
          background: "var(--jade-glass)",
          border: "1px solid var(--jade-subtle)",
          borderTop: "2px solid var(--jade)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              {["Content", "Image", "Public", "Likes", "Created"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "0.75rem 1rem",
                    fontSize: "0.625rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--jade)",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(captions as Caption[])?.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.75rem",
                    color: "var(--jade-dim)",
                    maxWidth: "400px",
                  }}
                >
                  <CaptionCopy content={c.content ?? ""} />
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Badge label={c.image_id ? "Yes" : "No"} active={!!c.image_id} />
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Badge label={c.is_public ? "Public" : "Private"} active={c.is_public} />
                </td>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.8rem",
                    color: "var(--jade)",
                    fontWeight: 600,
                  }}
                >
                  {c.like_count}
                </td>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.7rem",
                    color: "var(--jade-muted)",
                  }}
                >
                  {new Date(c.created_datetime_utc).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!captions || captions.length === 0) && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontSize: "0.75rem",
              color: "var(--jade-muted)",
            }}
          >
            No captions found
          </div>
        )}
      </div>

      {totalPages > 1 && (() => {
        const pages: (number | "...")[] = [];
        const delta = 1;
        const left = currentPage - delta;
        const right = currentPage + delta;

        for (let p = 1; p <= totalPages; p++) {
          if (p === 1 || p === totalPages || (p >= left && p <= right)) {
            pages.push(p);
          } else if (p === left - 1 || p === right + 1) {
            pages.push("...");
          }
        }

        const btnStyle = (active: boolean): React.CSSProperties => ({
          padding: "0.25rem 0.6rem",
          fontSize: "0.7rem",
          opacity: active ? 1 : 0.4,
          pointerEvents: active ? "none" : "auto",
          textDecoration: "none",
        });

        return (
          <div style={{ display: "flex", gap: "0.25rem", marginTop: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
            {currentPage > 1 && (
              <Link href={buildHref(currentPage - 1)} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.7rem" }}>← Prev</Link>
            )}
            {pages.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} style={{ fontSize: "0.7rem", color: "var(--jade-muted)", padding: "0 0.25rem" }}>...</span>
              ) : (
                <Link key={p} href={buildHref(p)} className="btn-jade" style={btnStyle(p === currentPage)}>{p}</Link>
              )
            )}
            {currentPage < totalPages && (
              <Link href={buildHref(currentPage + 1)} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.7rem" }}>Next →</Link>
            )}
          </div>
        );
      })()}
    </div>
  );
}
