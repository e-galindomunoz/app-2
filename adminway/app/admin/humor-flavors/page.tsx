import { createAnonClient } from "@/lib/supabase/server";
import { SearchSortBar } from "@/components/admin/search-sort-bar";
import type { HumorFlavor } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "slug", label: "Slug A→Z" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

interface Props {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

export default async function HumorFlavorsPage({ searchParams }: Props) {
  const { q = "", sort = "slug" } = await searchParams;
  const supabase = createAnonClient();

  let query = supabase.from("humor_flavors").select("*");

  if (q) query = query.or(`slug.ilike.%${q}%,description.ilike.%${q}%`);

  if (sort === "newest") query = query.order("created_datetime_utc", { ascending: false });
  else if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else query = query.order("slug", { ascending: true });

  const { data: flavors } = await query;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            Humor Flavors
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {flavors?.length ?? 0} flavors — read only
          </div>
        </div>
        <SearchSortBar q={q} sort={sort} sortOptions={SORT_OPTIONS} placeholder="Search slug or description…" />
      </div>

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              {["ID", "Slug", "Description", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(flavors as HumorFlavor[])?.map((f) => (
              <tr key={f.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade)", fontWeight: 700 }}>#{f.id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)", fontWeight: 600 }}>{f.slug}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)", maxWidth: "400px" }}>{f.description ?? "—"}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)" }}>
                  {new Date(f.created_datetime_utc).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!flavors || flavors.length === 0) && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>No humor flavors found</div>
        )}
      </div>
    </div>
  );
}
