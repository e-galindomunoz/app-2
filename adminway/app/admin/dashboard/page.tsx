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
    { data: newestImageRows },
    { data: newestCaptionRows },
    // caption_votes stats
    { count: totalVotes },
    { count: upvotes },
    { count: downvotes },
    { count: votes24h },
    { count: votes7d },
    { data: topRatedRows },
    { data: mostDownvotedRows },
    // humor flavor stats
    { data: allFlavorRows },
    { data: recentFlavorRows },
    { data: recent24hFlavorRows },
    { data: flavorDefs },
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
    supabase.from("images").select("id, url, created_datetime_utc").order("created_datetime_utc", { ascending: false }).limit(1),
    supabase.from("captions").select("id, content, created_datetime_utc, image_id, images(url)").not("content", "is", null).neq("content", "").order("created_datetime_utc", { ascending: false }).limit(1),
    // total votes all time
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    // upvotes (vote_value > 0)
    supabase.from("caption_votes").select("*", { count: "exact", head: true }).gt("vote_value", 0),
    // downvotes (vote_value < 0)
    supabase.from("caption_votes").select("*", { count: "exact", head: true }).lt("vote_value", 0),
    // votes in last 24h
    supabase.from("caption_votes").select("*", { count: "exact", head: true }).gte("created_datetime_utc", since24h),
    // votes in last 7d
    supabase.from("caption_votes").select("*", { count: "exact", head: true }).gte("created_datetime_utc", since7d),
    // top rated caption by like_count (net score derived from votes)
    supabase.from("captions").select("id, content, like_count, image_id, images(url)").gt("like_count", 0).order("like_count", { ascending: false }).limit(1),
    // most downvoted caption (lowest like_count)
    supabase.from("captions").select("id, content, like_count, image_id, images(url)").lt("like_count", 0).order("like_count", { ascending: true }).limit(1),
    // all captions with humor_flavor_id + like_count for flavor stats
    supabase.from("captions").select("humor_flavor_id, like_count").not("humor_flavor_id", "is", null),
    // recent captions (7d) with humor_flavor_id
    supabase.from("captions").select("humor_flavor_id").not("humor_flavor_id", "is", null).gte("created_datetime_utc", since7d),
    // recent captions (24h) with humor_flavor_id
    supabase.from("captions").select("humor_flavor_id").not("humor_flavor_id", "is", null).gte("created_datetime_utc", since24h),
    // humor flavor definitions
    supabase.from("humor_flavors").select("id, slug"),
  ]);

  const newestImage = newestImageRows?.[0] ?? null;
  const newestCaption = newestCaptionRows?.[0] ?? null;
  const topRated = topRatedRows?.[0] ?? null;
  const mostDownvoted = mostDownvotedRows?.[0] ?? null;

  const newestCaptionImageUrl = (newestCaption?.images as unknown as { url: string } | null)?.url ?? null;
  const topRatedImageUrl = (topRated?.images as unknown as { url: string } | null)?.url ?? null;
  const mostDownvotedImageUrl = (mostDownvoted?.images as unknown as { url: string } | null)?.url ?? null;

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

  // Humor flavor aggregation
  type FlavorStats = { count: number; totalLikes: number };
  const flavorMap: Record<number, FlavorStats> = {};
  for (const row of allFlavorRows ?? []) {
    const id = row.humor_flavor_id as number;
    if (!flavorMap[id]) flavorMap[id] = { count: 0, totalLikes: 0 };
    flavorMap[id].count += 1;
    flavorMap[id].totalLikes += (row.like_count as number) ?? 0;
  }
  const recentFlavorCount: Record<number, number> = {};
  for (const row of recentFlavorRows ?? []) {
    const id = row.humor_flavor_id as number;
    recentFlavorCount[id] = (recentFlavorCount[id] ?? 0) + 1;
  }
  const recent24hFlavorCount: Record<number, number> = {};
  for (const row of recent24hFlavorRows ?? []) {
    const id = row.humor_flavor_id as number;
    recent24hFlavorCount[id] = (recent24hFlavorCount[id] ?? 0) + 1;
  }
  const flavorSlug = (id: number) =>
    (flavorDefs ?? []).find((f: { id: number; slug: string }) => f.id === id)?.slug ?? String(id);

  const mostUsedFlavorId = Object.entries(flavorMap).sort((a, b) => b[1].count - a[1].count)[0]?.[0];
  const mostUsedRecentFlavorId = Object.entries(recentFlavorCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostUsed24hFlavorId = Object.entries(recent24hFlavorCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const highestRatedFlavorId = Object.entries(flavorMap)
    .filter(([, s]) => s.count > 0)
    .sort((a, b) => b[1].totalLikes / b[1].count - a[1].totalLikes / a[1].count)[0]?.[0];

  const mostUsedFlavor = mostUsedFlavorId
    ? { slug: flavorSlug(Number(mostUsedFlavorId)), count: flavorMap[Number(mostUsedFlavorId)].count }
    : null;
  const mostUsedRecentFlavor = mostUsedRecentFlavorId
    ? { slug: flavorSlug(Number(mostUsedRecentFlavorId)), count: recentFlavorCount[Number(mostUsedRecentFlavorId)] }
    : null;
  const mostUsed24hFlavor = mostUsed24hFlavorId
    ? { slug: flavorSlug(Number(mostUsed24hFlavorId)), count: recent24hFlavorCount[Number(mostUsed24hFlavorId)] }
    : null;
  const highestRatedFlavor = highestRatedFlavorId
    ? {
        slug: flavorSlug(Number(highestRatedFlavorId)),
        avg: (flavorMap[Number(highestRatedFlavorId)].totalLikes / flavorMap[Number(highestRatedFlavorId)].count).toFixed(2),
      }
    : null;

  const upvoteRate =
    totalVotes && totalVotes > 0
      ? `${(((upvotes ?? 0) / totalVotes) * 100).toFixed(1)}%`
      : "—";

  const sectionLabel = {
    fontSize: "0.625rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase" as const,
    color: "var(--jade-muted)",
    marginBottom: "0.75rem",
  };

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

      {/* Humor Flavor Stats */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={sectionLabel}>Humor Flavor Breakdown</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          <div
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "2px solid var(--jade)",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.5rem" }}>
              Most Used (All Time)
            </div>
            {mostUsedFlavor ? (
              <>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--jade)", letterSpacing: "-0.01em", marginBottom: "0.35rem" }}>
                  {mostUsedFlavor.slug}
                </div>
                <div style={{ fontSize: "0.625rem", color: "var(--jade-dim)", letterSpacing: "0.1em" }}>
                  {mostUsedFlavor.count} caption{mostUsedFlavor.count !== 1 ? "s" : ""}
                </div>
              </>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No data</div>
            )}
          </div>

          <div
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "2px solid var(--jade-dim)",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.5rem" }}>
              Trending (Last 7 Days)
            </div>
            {mostUsedRecentFlavor ? (
              <>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--jade)", letterSpacing: "-0.01em", marginBottom: "0.35rem" }}>
                  {mostUsedRecentFlavor.slug}
                </div>
                <div style={{ fontSize: "0.625rem", color: "var(--jade-dim)", letterSpacing: "0.1em" }}>
                  {mostUsedRecentFlavor.count} caption{mostUsedRecentFlavor.count !== 1 ? "s" : ""} this week
                </div>
              </>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No recent data</div>
            )}
          </div>

          <div
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "2px solid var(--jade-dim)",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.5rem" }}>
              Trending (Last 24 Hours)
            </div>
            {mostUsed24hFlavor ? (
              <>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--jade)", letterSpacing: "-0.01em", marginBottom: "0.35rem" }}>
                  {mostUsed24hFlavor.slug}
                </div>
                <div style={{ fontSize: "0.625rem", color: "var(--jade-dim)", letterSpacing: "0.1em" }}>
                  {mostUsed24hFlavor.count} caption{mostUsed24hFlavor.count !== 1 ? "s" : ""} today
                </div>
              </>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No recent data</div>
            )}
          </div>

          <div
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "2px solid var(--jade-dim)",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.5rem" }}>
              Highest Rated (Avg Likes)
            </div>
            {highestRatedFlavor ? (
              <>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--jade)", letterSpacing: "-0.01em", marginBottom: "0.35rem" }}>
                  {highestRatedFlavor.slug}
                </div>
                <div style={{ fontSize: "0.625rem", color: "var(--jade-dim)", letterSpacing: "0.1em" }}>
                  {highestRatedFlavor.avg} avg likes / caption
                </div>
              </>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Caption Rating Stats — 5×2 grid */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={sectionLabel}>Caption Ratings</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "0.75rem",
          }}
        >
          <StatCard label="Total Votes" value={totalVotes ?? 0} sub="all time" />
          <StatCard label="Upvotes" value={upvotes ?? 0} sub={`${upvoteRate} of all votes`} />
          <StatCard label="Downvotes" value={downvotes ?? 0} sub="negative ratings" />
          <StatCard label="Votes (24h)" value={votes24h ?? 0} sub="last 24 hours" />
          <StatCard label="Votes (7d)" value={votes7d ?? 0} sub="last 7 days" />
        </div>
      </div>

      {/* Top Rated / Most Downvoted — side by side */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={sectionLabel}>Caption Vote Leaders</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Top Rated */}
          <ExpandablePanel
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "3px solid var(--jade)",
              padding: "2rem",
              boxShadow: "0 0 60px rgba(0,255,159,0.08), inset 0 0 40px rgba(0,255,159,0.03)",
            }}
            expandedContent={topRated ? (
              <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
                {topRatedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={topRatedImageUrl} alt="" style={{ width: "260px", height: "260px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)", boxShadow: "0 0 20px rgba(0,255,159,0.15)" }} />
                )}
                <div>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "1rem" }}>Top Rated Caption</div>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--jade)", lineHeight: 1.3, textShadow: "0 0 60px rgba(0,255,159,0.4)", marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
                    &ldquo;{topRated.content}&rdquo;
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--jade-dim)", letterSpacing: "0.15em" }}>+{topRated.like_count ?? 0} net score</div>
                </div>
              </div>
            ) : undefined}
          >
            {topRated ? (
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                {topRatedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={topRatedImageUrl} alt="" style={{ width: "120px", height: "120px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)", boxShadow: "0 0 20px rgba(0,255,159,0.15)" }} />
                )}
                <div>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.5rem" }}>Top Rated Caption</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--jade)", lineHeight: 1.35, textShadow: "0 0 40px rgba(0,255,159,0.3)", marginBottom: "0.75rem", letterSpacing: "-0.01em" }}>
                    &ldquo;{topRated.content}&rdquo;
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--jade-dim)", letterSpacing: "0.15em" }}>+{topRated.like_count ?? 0} net score</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No rated captions yet</div>
            )}
          </ExpandablePanel>

          {/* Most Downvoted */}
          <ExpandablePanel
            style={{
              background: "var(--jade-glass)",
              border: "1px solid var(--jade-subtle)",
              borderTop: "2px solid rgba(255,80,80,0.4)",
              padding: "2rem",
              opacity: 0.8,
            }}
            expandedContent={mostDownvoted ? (
              <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
                {mostDownvotedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mostDownvotedImageUrl} alt="" style={{ width: "260px", height: "260px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)", opacity: 0.6 }} />
                )}
                <div>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "1rem" }}>Most Downvoted Caption</div>
                  <div style={{ fontSize: "2rem", fontWeight: 600, color: "var(--jade-dim)", lineHeight: 1.3, marginBottom: "1.5rem", letterSpacing: "-0.01em" }}>
                    &ldquo;{mostDownvoted.content}&rdquo;
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "rgba(255,80,80,0.7)", letterSpacing: "0.1em" }}>{mostDownvoted.like_count ?? 0} net score</div>
                </div>
              </div>
            ) : undefined}
          >
            {mostDownvoted ? (
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                {mostDownvotedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mostDownvotedImageUrl} alt="" style={{ width: "120px", height: "120px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)", opacity: 0.6 }} />
                )}
                <div>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jade-muted)", marginBottom: "0.5rem" }}>Most Downvoted Caption</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--jade-dim)", lineHeight: 1.35, marginBottom: "0.75rem", letterSpacing: "-0.01em" }}>
                    &ldquo;{mostDownvoted.content}&rdquo;
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,80,80,0.7)", letterSpacing: "0.1em" }}>{mostDownvoted.like_count ?? 0} net score</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--jade-muted)" }}>No downvoted captions</div>
            )}
          </ExpandablePanel>
        </div>
      </div>

      {/* Recent Activity — 2 col */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={sectionLabel}>Recent Activity</div>
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



    </div>
  );
}
