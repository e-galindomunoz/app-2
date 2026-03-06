import { createAnonClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/stat-card";

export default async function DashboardPage() {
  const supabase = createAnonClient();

  const [
    { count: totalImages },
    { count: imagesWithDesc },
    { count: captions2026 },
    { data: mostLikedRows },
    { data: leastLikedRows },
  ] = await Promise.all([
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .not("image_description", "is", null)
      .neq("image_description", ""),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .gte("created_datetime_utc", "2026-01-01")
      .lt("created_datetime_utc", "2027-01-01"),
    supabase.from("captions").select("id, content, like_count, image_id, images(url)").order("like_count", { ascending: false }).limit(1),
    supabase.from("captions").select("id, content, like_count, image_id, images(url)").order("like_count", { ascending: true }).limit(1),
  ]);

  const mostLiked = mostLikedRows?.[0] ?? null;
  const leastLiked = leastLikedRows?.[0] ?? null;

  const mostLikedImageUrl = (mostLiked?.images as unknown as { url: string } | null)?.url ?? null;
  const leastLikedImageUrl = (leastLiked?.images as unknown as { url: string } | null)?.url ?? null;

  const now = new Date();
  const monthsElapsed = now.getFullYear() === 2026
    ? now.getMonth() + 1
    : 12;
  const avgCaptionsPerMonth = captions2026
    ? (captions2026 / monthsElapsed).toFixed(1)
    : "0";

  const descPct =
    totalImages && totalImages > 0
      ? `${(((imagesWithDesc ?? 0) / totalImages) * 100).toFixed(1)}%`
      : "0%";


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
          Dashboard
        </h1>
        <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
          Live system metrics
        </div>
      </div>

      {/* Stat cards row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Captions Generated in 2026"
          value={captions2026 ?? 0}
          sub="so far this year"
        />

        <StatCard
          label="Avg Captions / Month (2026)"
          value={avgCaptionsPerMonth}
          sub={`across ${monthsElapsed} month${monthsElapsed !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Images with Descriptions"
          value={`${imagesWithDesc ?? 0} (${descPct})`}
          sub={`of ${totalImages ?? 0} total images`}
        />
      </div>

      {/* Most Liked Caption — big highlight */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--jade-muted)",
            marginBottom: "0.75rem",
          }}
        >
          Most Liked Caption
        </div>
        <div
          style={{
            background: "var(--jade-glass)",
            border: "1px solid var(--jade-subtle)",
            borderTop: "2px solid var(--jade)",
            padding: "2rem",
          }}
        >
          {mostLiked ? (
            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
              {mostLikedImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mostLikedImageUrl}
                  alt=""
                  style={{
                    width: "160px",
                    height: "160px",
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "1px solid var(--jade-subtle)",
                  }}
                />
              )}
              <div>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--jade)",
                    lineHeight: 1.3,
                    textShadow: "0 0 40px rgba(0,255,159,0.3)",
                    marginBottom: "1.25rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  &ldquo;{mostLiked.content}&rdquo;
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--jade-dim)", letterSpacing: "0.1em" }}>
                  {mostLiked.like_count ?? 0} likes
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No data</div>
          )}
        </div>
      </div>

      {/* Least Liked Caption — big highlight */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--jade-muted)",
            marginBottom: "0.75rem",
          }}
        >
          Least Liked Caption
        </div>
        <div
          style={{
            background: "var(--jade-glass)",
            border: "1px solid var(--jade-subtle)",
            borderTop: "2px solid var(--jade-dim)",
            padding: "2rem",
          }}
        >
          {leastLiked ? (
            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
              {leastLikedImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={leastLikedImageUrl}
                  alt=""
                  style={{
                    width: "160px",
                    height: "160px",
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "1px solid var(--jade-subtle)",
                  }}
                />
              )}
              <div>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--jade-dim)",
                    lineHeight: 1.3,
                    marginBottom: "1.25rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  &ldquo;{leastLiked.content}&rdquo;
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
                  {leastLiked.like_count ?? 0} likes
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No data</div>
          )}
        </div>
      </div>

    </div>
  );
}
