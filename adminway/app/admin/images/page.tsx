import Link from "next/link";
import { createAnonClient } from "@/lib/supabase/server";
import { ImagePreview } from "@/components/images/image-preview";
import { Badge } from "@/components/ui/badge";
import { ImageDeleteButton } from "@/components/images/image-delete-button";
import type { Image as ImageType } from "@/lib/types";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ImagesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const supabase = createAnonClient();

  let query = supabase
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (q) {
    query = query.ilike("url", `%${q}%`);
  }

  const { data: images } = await query;

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
            Images
          </h1>
          <div
            style={{
              fontSize: "0.625rem",
              color: "var(--jade-muted)",
              letterSpacing: "0.1em",
            }}
          >
            {images?.length ?? 0} shown
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <form method="get" style={{ display: "flex", gap: "0.5rem" }}>
            <input
              name="q"
              type="search"
              className="input-jade"
              placeholder="Search by URL..."
              defaultValue={q}
              style={{ width: "240px" }}
            />
            <button type="submit" className="btn-jade">
              Search
            </button>
          </form>
          <Link href="/admin/images/new" className="btn-jade">
            + New Image
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {(images as ImageType[])?.map((img) => (
          <div
            key={img.id}
            className="stat-card"
            style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {/* Image preview */}
            <ImagePreview src={img.url} />

            {/* URL */}
            <div
              style={{
                fontSize: "0.625rem",
                color: "var(--jade-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {img.url}
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Badge label={img.is_public ? "Public" : "Private"} active={img.is_public} />
              {img.is_common_use && <Badge label="Common Use" active />}
            </div>

            {/* Context */}
            {img.additional_context && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--jade-dim)",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {img.additional_context}
              </div>
            )}

            {/* Date */}
            <div
              style={{
                fontSize: "0.625rem",
                color: "var(--jade-muted)",
                marginTop: "auto",
              }}
            >
              Created: {new Date(img.created_datetime_utc).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link
                href={`/admin/images/${img.id}/edit`}
                className="btn-jade"
                style={{ padding: "0.25rem 0.75rem", fontSize: "0.625rem", flex: 1, textAlign: "center" }}
              >
                Edit
              </Link>
              <ImageDeleteButton imageId={img.id} />
            </div>
          </div>
        ))}
      </div>

      {(!images || images.length === 0) && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            fontSize: "0.75rem",
            color: "var(--jade-muted)",
          }}
        >
          No images found
        </div>
      )}
    </div>
  );
}
