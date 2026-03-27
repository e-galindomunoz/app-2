import { createAnonClient } from "@/lib/supabase/server";
import { SearchSortBar } from "@/components/admin/search-sort-bar";
import type { HumorFlavorStep, HumorFlavor } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "order", label: "Step order" },
  { value: "flavor", label: "Flavor ID" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

interface Props {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

export default async function HumorFlavorStepsPage({ searchParams }: Props) {
  const { q = "", sort = "order" } = await searchParams;
  const supabase = createAnonClient();

  let query = supabase.from("humor_flavor_steps").select("*");

  if (q) query = query.ilike("description", `%${q}%`);

  if (sort === "flavor") query = query.order("humor_flavor_id", { ascending: true }).order("order_by", { ascending: true });
  else if (sort === "newest") query = query.order("created_datetime_utc", { ascending: false });
  else if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else query = query.order("order_by", { ascending: true });

  const [{ data: steps }, { data: flavors }] = await Promise.all([
    query,
    supabase.from("humor_flavors").select("id, slug"),
  ]);

  const flavorMap = new Map((flavors as HumorFlavor[])?.map((f) => [f.id, f.slug]) ?? []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            Humor Flavor Steps
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {steps?.length ?? 0} steps — read only
          </div>
        </div>
        <SearchSortBar q={q} sort={sort} sortOptions={SORT_OPTIONS} placeholder="Search description…" />
      </div>

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              {["ID", "Order", "Flavor", "Step Type", "Input Type", "Output Type", "Description", "Temp", "Model ID", "System Prompt", "User Prompt", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(steps as HumorFlavorStep[])?.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade)", fontWeight: 700 }}>#{s.id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade)", fontWeight: 700 }}>{s.order_by}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)" }}>
                  {flavorMap.get(s.humor_flavor_id) ?? `#${s.humor_flavor_id}`}
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>#{s.humor_flavor_step_type_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>#{s.llm_input_type_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>#{s.llm_output_type_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)", maxWidth: "200px" }}>{s.description ?? "—"}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>{s.llm_temperature ?? "—"}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-muted)" }}>#{s.llm_model_id}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.llm_system_prompt ?? "—"}
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.llm_user_prompt ?? "—"}
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)" }}>
                  {new Date(s.created_datetime_utc).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!steps || steps.length === 0) && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>No flavor steps found</div>
        )}
      </div>
    </div>
  );
}
