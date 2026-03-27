import { createAnonClient, createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/stat-card";
import { ExpandablePanel } from "@/components/ui/expandable-panel";
import { RefreshButton } from "@/components/ui/refresh-button";

export default async function DashboardPage() {
  const supabase = createAnonClient();
  const adminSupabase = await createClient();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalImages },
    { count: imagesWithDesc },
    { count: captions2026 },
    { count: totalCaptions },
    { count: totalUsers },
    { count: totalHumorFlavors },
    { count: captionRequests24h },
    { count: images24h },
    { count: newUsers7d },
    { data: mostLikedRows },
    { data: leastLikedRows },
    { data: newestImageRows },
    { data: newestCaptionRows },
  ] = await Promise.all([
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }).not("image_description", "is", null).neq("image_description", ""),
    supabase.from("captions").select("*", { count: "exact", head: true }).gte("created_datetime_utc", "2026-01-01").lt("created_datetime_utc", "2027-01-01"),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    adminSupabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
    supabase.from("caption_requests").select("*", { count: "exact", head: true }).gte("created_datetime_utc", since24h),
    supabase.from("images").select("*", { count: "exact", head: true }).gte("created_datetime_utc", since24h),
    adminSupabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_datetime_utc", since7d),
    supabase.from("captions").select("id, content, like_count, image_id, images(url)").order("like_count", { ascending: false }).limit(1),
    supabase.from("captions").select("id, content, like_count, image_id, images(url)").order("like_count", { ascending: true }).limit(1),
    supabase.from("images").select("id, url, created_datetime_utc").order("created_datetime_utc", { ascending: false }).limit(1),
    supabase.from("captions").select("id, content, created_datetime_utc, image_id, images(url)").not("content", "is", null).neq("content", "").order("created_datetime_utc", { ascending: false }).limit(1),
  ]);

  const mostLiked = mostLikedRows?.[0] ?? null;
  const leastLiked = leastLikedRows?.[0] ?? null;
  const newestImage = newestImageRows?.[0] ?? null;
  const newestCaption = newestCaptionRows?.[0] ?? null;

  const mostLikedImageUrl = (mostLiked?.images as unknown as { url: string } | null)?.url ?? null;
  const leastLikedImageUrl = (leastLiked?.images as unknown as { url: string } | null)?.url ?? null;
  const newestCaptionImageUrl = (newestCaption?.images as unknown as { url: string } | null)?.url ?? null;

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
      <div style={{ marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
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
            Dashboard
          </h1>
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>
            Live system metrics
          </div>
        </div>
        <RefreshButton />
      </div>

      {/* Stat cards — 5×2 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.75rem",
          marginBottom: "3rem",
        }}
      >
        <StatCard label="Total Images" value={totalImages ?? 0} sub="all time" />
        <StatCard label="Total Captions" value={totalCaptions ?? 0} sub="all time" />
        <StatCard label="Total Profiles" value={totalUsers ?? 0} sub="all time" />
        <StatCard label="Humor Flavors" value={totalHumorFlavors ?? 0} sub="available flavors" />
        <StatCard label="Caption Requests (24h)" value={captionRequests24h ?? 0} sub="last 24 hours" />
        <StatCard label="Images Uploaded (24h)" value={images24h ?? 0} sub="last 24 hours" />
        <StatCard label="New Profiles (7d)" value={newUsers7d ?? 0} sub="signed up this week" />
        <StatCard label="Captions in 2026" value={captions2026 ?? 0} sub="so far this year" />
        <StatCard label="Avg Captions / Month" value={avgCaptionsPerMonth} sub={`across ${monthsElapsed} month${monthsElapsed !== 1 ? "s" : ""}`} />
        <StatCard label="Images w/ Descriptions" value={`${imagesWithDesc ?? 0} (${descPct})`} sub={`of ${totalImages ?? 0} total`} />
      </div>

      {/* Recent Activity — 2 col */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--jade-muted)",
            marginBottom: "0.75rem",
          }}
        >
          Recent Activity
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Newest Image */}
          <ExpandablePanel
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "2px solid var(--jade-dim)",
              padding: "1.25rem",
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
            }}
            expandedContent={newestImage ? (
              <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newestImage.url} alt="" style={{ width: "300px", height: "300px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)" }} />
                <div>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "1rem" }}>Newest Image</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--jade-dim)", fontFamily: "monospace", wordBreak: "break-all", marginBottom: "0.75rem" }}>{newestImage.id}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>{new Date(newestImage.created_datetime_utc).toLocaleString()}</div>
                </div>
              </div>
            ) : undefined}
          >
            {newestImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newestImage.url} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)" }} />
                <div>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.5rem" }}>Newest Image</div>
                  <div style={{ fontSize: "0.625rem", color: "var(--jade-dim)", fontFamily: "monospace", wordBreak: "break-all", marginBottom: "0.5rem" }}>{newestImage.id}</div>
                  <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)" }}>{new Date(newestImage.created_datetime_utc).toLocaleString()}</div>
                </div>
              </>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No images yet</div>
            )}
          </ExpandablePanel>

          {/* Newest Caption */}
          <ExpandablePanel
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "2px solid var(--jade-dim)",
              padding: "1.25rem",
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
            }}
            expandedContent={newestCaption ? (
              <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                {newestCaptionImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={newestCaptionImageUrl} alt="" style={{ width: "240px", height: "240px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)" }} />
                )}
                <div>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "1rem" }}>Newest Caption</div>
                  <div style={{ fontSize: "1.25rem", color: "var(--jade-dim)", lineHeight: 1.4, marginBottom: "0.75rem" }}>&ldquo;{newestCaption.content}&rdquo;</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>{new Date(newestCaption.created_datetime_utc).toLocaleString()}</div>
                </div>
              </div>
            ) : undefined}
          >
            {newestCaption ? (
              <>
                {newestCaptionImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={newestCaptionImageUrl} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)" }} />
                )}
                <div>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.5rem" }}>Newest Caption</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--jade-dim)", lineHeight: 1.4, marginBottom: "0.5rem" }}>&ldquo;{newestCaption.content}&rdquo;</div>
                  <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)" }}>{new Date(newestCaption.created_datetime_utc).toLocaleString()}</div>
                </div>
              </>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No captions yet</div>
            )}
          </ExpandablePanel>
        </div>
      </div>

      {/* Most Liked / Least Liked — side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        {/* Most Liked Caption — hero */}
        <div>
          <div style={{ fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.75rem" }}>
            Most Liked Caption
          </div>
          <ExpandablePanel
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "3px solid var(--jade)",
              padding: "2rem",
              boxShadow: "0 0 60px rgba(0,255,159,0.08), inset 0 0 40px rgba(0,255,159,0.03)",
              height: "calc(100% - 1.625rem)",
            }}
            expandedContent={mostLiked ? (
              <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
                {mostLikedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mostLikedImageUrl} alt="" style={{ width: "260px", height: "260px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)", boxShadow: "0 0 20px rgba(0,255,159,0.15)" }} />
                )}
                <div>
                  <div style={{ fontSize: "2.25rem", fontWeight: 700, color: "var(--jade)", lineHeight: 1.25, textShadow: "0 0 60px rgba(0,255,159,0.4)", marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
                    &ldquo;{mostLiked.content}&rdquo;
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--jade-dim)", letterSpacing: "0.15em" }}>{mostLiked.like_count ?? 0} likes</div>
                </div>
              </div>
            ) : undefined}
          >
            {mostLiked ? (
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                {mostLikedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mostLikedImageUrl} alt="" style={{ width: "140px", height: "140px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)", boxShadow: "0 0 20px rgba(0,255,159,0.15)" }} />
                )}
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--jade)", lineHeight: 1.25, textShadow: "0 0 60px rgba(0,255,159,0.4)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                    &ldquo;{mostLiked.content}&rdquo;
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--jade-dim)", letterSpacing: "0.15em" }}>{mostLiked.like_count ?? 0} likes</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No data</div>
            )}
          </ExpandablePanel>
        </div>

        {/* Least Liked Caption — secondary */}
        <div>
          <div style={{ fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.75rem" }}>
            Least Liked Caption
          </div>
          <ExpandablePanel
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "2px solid var(--jade-dim)",
              padding: "2rem",
              opacity: 0.75,
              height: "calc(100% - 1.625rem)",
            }}
            expandedContent={leastLiked ? (
              <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
                {leastLikedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={leastLikedImageUrl} alt="" style={{ width: "260px", height: "260px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)", opacity: 0.6 }} />
                )}
                <div>
                  <div style={{ fontSize: "2.25rem", fontWeight: 600, color: "var(--jade-dim)", lineHeight: 1.25, marginBottom: "1.5rem", letterSpacing: "-0.01em" }}>
                    &ldquo;{leastLiked.content}&rdquo;
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>{leastLiked.like_count ?? 0} likes</div>
                </div>
              </div>
            ) : undefined}
          >
            {leastLiked ? (
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                {leastLikedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={leastLikedImageUrl} alt="" style={{ width: "140px", height: "140px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)", opacity: 0.6 }} />
                )}
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--jade-dim)", lineHeight: 1.25, marginBottom: "1.25rem", letterSpacing: "-0.01em" }}>
                    &ldquo;{leastLiked.content}&rdquo;
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--jade-muted)", letterSpacing: "0.1em" }}>{leastLiked.like_count ?? 0} likes</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No data</div>
            )}
          </ExpandablePanel>
        </div>
      </div>

    </div>
  );
}
