import { createAnonClient } from "@/lib/supabase/server";
import { SearchSortBar } from "@/components/admin/search-sort-bar";
import type { HumorFlavorMix, HumorFlavor } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "count_desc", label: "Count ↓" },
  { value: "count_asc", label: "Count ↑" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function HumorMixPage({ searchParams }: Props) {
  const { sort = "count_desc" } = await searchParams;
  const supabase = createAnonClient();

  let query = supabase.from("humor_flavor_mix").select("*");

  if (sort === "count_asc") query = query.order("caption_count", { ascending: true });
  else if (sort === "newest") query = query.order("created_datetime_utc", { ascending: false });
  else if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else query = query.order("caption_count", { ascending: false });

  const [{ data: mix }, { data: flavors }] = await Promise.all([
    query,
    supabase.from("humor_flavors").select("id, slug").order("slug", { ascending: true }),
  ]);

  const flavorMap = new Map((flavors as HumorFlavor[])?.map((f) => [f.id, f.slug]) ?? []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            Humor Mix
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {mix?.length ?? 0} entries — read only
          </div>
        </div>
        <SearchSortBar q="" sort={sort} sortOptions={SORT_OPTIONS} showSearch={false} />
      </div>

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              {["Humor Flavor", "Caption Count", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(mix as HumorFlavorMix[])?.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)", fontWeight: 600 }}>
                  {flavorMap.get(m.humor_flavor_id) ?? `#${m.humor_flavor_id}`}
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--jade)", fontWeight: 700 }}>{m.caption_count}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)" }}>
                  {new Date(m.created_datetime_utc).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!mix || mix.length === 0) && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>No humor mix entries found</div>
        )}
      </div>
    </div>
  );
}
