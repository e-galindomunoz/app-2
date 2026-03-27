import Link from "next/link";
import { createAnonClient } from "@/lib/supabase/server";
import { SearchSortBar } from "@/components/admin/search-sort-bar";
import { ImageCard } from "@/components/images/image-card";
import type { Image as ImageType } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "public", label: "Public first" },
  { value: "common", label: "Common use first" },
];

const PAGE_SIZE = 50;

interface Props {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export default async function ImagesPage({ searchParams }: Props) {
  const { q = "", sort = "newest", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = createAnonClient();

  let query = supabase.from("images").select("*", { count: "exact" });

  if (q) query = query.or(`url.ilike.%${q}%,image_description.ilike.%${q}%,additional_context.ilike.%${q}%`);

  if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else if (sort === "public") query = query.order("is_public", { ascending: false }).order("created_datetime_utc", { ascending: false });
  else if (sort === "common") query = query.order("is_common_use", { ascending: false }).order("created_datetime_utc", { ascending: false });
  else query = query.order("created_datetime_utc", { ascending: false });

  const { data: images, count } = await query.range(from, to);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            Images
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {count ?? 0} total — page {currentPage} of {totalPages || 1}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <SearchSortBar q={q} sort={sort} sortOptions={SORT_OPTIONS} placeholder="Search URL or description…" />
          <Link href="/admin/images/new" className="btn-jade">+ New Image</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {(images as ImageType[])?.map((img) => (
          <ImageCard key={img.id} img={img} />
        ))}
      </div>

      {(!images || images.length === 0) && (
        <div style={{ textAlign: "center", padding: "4rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>
          No images found
        </div>
      )}

      {totalPages > 1 && (() => {
        const pages: (number | "...")[] = [];
        const delta = 1;
        const left = currentPage - delta;
        const right = currentPage + delta;
        for (let p = 1; p <= totalPages; p++) {
          if (p === 1 || p === totalPages || (p >= left && p <= right)) pages.push(p);
          else if (p === left - 1 || p === right + 1) pages.push("...");
        }
        const buildHref = (p: number) => {
          const params = new URLSearchParams({ q, sort, page: String(p) });
          return `?${params.toString()}`;
        };
        return (
          <div style={{ display: "flex", gap: "0.25rem", marginTop: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
            {currentPage > 1 && (
              <Link href={buildHref(currentPage - 1)} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.7rem" }}>← Prev</Link>
            )}
            {pages.map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} style={{ fontSize: "0.7rem", color: "var(--jade-muted)", padding: "0 0.25rem" }}>...</span>
              ) : (
                <Link key={p} href={buildHref(p)} className="btn-jade" style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem", opacity: p === currentPage ? 1 : 0.4, pointerEvents: p === currentPage ? "none" : "auto" }}>{p}</Link>
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
