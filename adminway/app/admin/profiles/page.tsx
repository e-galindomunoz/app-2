import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types";

export default async function ProfilesPage() {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  console.log("[profiles]", { count: profiles?.length, error, sample: profiles?.[0] });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--jade)",
            marginBottom: "0.25rem",
          }}
        >
          Profiles
        </h1>
        <div
          style={{
            fontSize: "0.625rem",
            color: "var(--jade-muted)",
            letterSpacing: "0.1em",
          }}
        >
          {profiles?.length ?? 0} registered users — read only
        </div>
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
            <tr
              style={{
                borderBottom: "1px solid var(--jade-subtle)",
              }}
            >
              {["Email", "Name", "Study", "Superadmin", "Matrix Admin", "Created"].map(
                (h) => (
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
                )
              )}
            </tr>
          </thead>
          <tbody>
            {(profiles as Profile[])?.map((p) => (
              <tr
                key={p.id}
                style={{ borderBottom: "1px solid var(--jade-subtle)" }}
              >
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.75rem",
                    color: "var(--jade-dim)",
                  }}
                >
                  {p.email ?? "—"}
                </td>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.75rem",
                    color: "var(--jade-dim)",
                  }}
                >
                  {p.first_name || p.last_name
                    ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()
                    : "—"}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Badge label={p.is_in_study ? "Yes" : "No"} active={p.is_in_study} />
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Badge label={p.is_superadmin ? "Yes" : "No"} active={p.is_superadmin} />
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Badge
                    label={p.is_matrix_admin ? "Yes" : "No"}
                    active={p.is_matrix_admin}
                  />
                </td>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.7rem",
                    color: "var(--jade-muted)",
                  }}
                >
                  {new Date(p.created_datetime_utc).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!profiles || profiles.length === 0) && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontSize: "0.75rem",
              color: "var(--jade-muted)",
            }}
          >
            No profiles found
          </div>
        )}
      </div>
    </div>
  );
}
