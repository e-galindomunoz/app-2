import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { SearchSortBar } from "@/components/admin/search-sort-bar";
import type { Profile } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "email", label: "Email A→Z" },
];

interface Props {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

export default async function ProfilesPage({ searchParams }: Props) {
  const { q = "", sort = "newest" } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("profiles").select("*");

  if (q) query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`);

  if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else if (sort === "email") query = query.order("email", { ascending: true });
  else query = query.order("created_datetime_utc", { ascending: false });

  const { data: profiles } = await query;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jade)", marginBottom: "0.25rem" }}>
            Users
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            {profiles?.length ?? 0} users — read only
          </div>
        </div>
        <SearchSortBar q={q} sort={sort} sortOptions={SORT_OPTIONS} placeholder="Search email or name…" />
      </div>

      <div style={{ background: "var(--jade-glass)", border: "1px solid var(--jade-subtle)", borderTop: "2px solid var(--jade)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
              {["Email", "Name", "Study", "Superadmin", "Matrix Admin", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jade)", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(profiles as Profile[])?.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--jade-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)" }}>{p.email ?? "—"}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--jade-dim)" }}>
                  {p.first_name || p.last_name ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : "—"}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}><Badge label={p.is_in_study ? "Yes" : "No"} active={p.is_in_study} /></td>
                <td style={{ padding: "0.75rem 1rem" }}><Badge label={p.is_superadmin ? "Yes" : "No"} active={p.is_superadmin} /></td>
                <td style={{ padding: "0.75rem 1rem" }}><Badge label={p.is_matrix_admin ? "Yes" : "No"} active={p.is_matrix_admin} /></td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "var(--jade-muted)" }}>
                  {p.created_datetime_utc ? new Date(p.created_datetime_utc).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!profiles || profiles.length === 0) && (
          <div style={{ padding: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--jade-muted)" }}>No profiles found</div>
        )}
      </div>
    </div>
  );
}
