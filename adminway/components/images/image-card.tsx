"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ImagePreview } from "@/components/images/image-preview";
import { ImageDeleteButton } from "@/components/images/image-delete-button";
import type { Image as ImageType } from "@/lib/types";

export function ImageCard({ img }: { img: ImageType }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className="stat-card"
        onClick={() => setExpanded(true)}
        style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", cursor: "pointer" }}
      >
        <ImagePreview src={img.url ?? ""} />
        <div style={{ fontSize: "0.6rem", color: "var(--jade-muted)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.6 }}>
          {img.id}
        </div>
        <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {img.url}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Badge label={img.is_public ? "Public" : "Private"} active={img.is_public ?? false} />
          {img.is_common_use && <Badge label="Common Use" active />}
        </div>
        {img.profile_id && (
          <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Owner: {img.profile_id}
          </div>
        )}
        {img.additional_context && (
          <div style={{ fontSize: "0.7rem", color: "var(--jade-dim)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {img.additional_context}
          </div>
        )}
        {img.image_description && (
          <div style={{ fontSize: "0.7rem", color: "var(--jade-dim)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            <span style={{ color: "var(--jade-muted)" }}>Desc: </span>{img.image_description}
          </div>
        )}
        {img.celebrity_recognition && (
          <div style={{ fontSize: "0.7rem", color: "var(--jade-muted)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            <span style={{ color: "var(--jade-muted)" }}>Celebrity: </span>{img.celebrity_recognition}
          </div>
        )}
        <div style={{ fontSize: "0.625rem", color: "var(--jade-muted)", marginTop: "auto" }}>
          Created: {new Date(img.created_datetime_utc).toLocaleDateString()}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }} onClick={(e) => e.stopPropagation()}>
          <Link href={`/admin/images/${img.id}/edit`} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.625rem", flex: 1, textAlign: "center" }}>
            Edit
          </Link>
          <ImageDeleteButton imageId={img.id} />
        </div>
      </div>

      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#000",
              border: "1px solid var(--jade-subtle)",
              borderTop: "3px solid var(--jade)",
              boxShadow: "0 0 80px rgba(0,255,159,0.1)",
              maxWidth: "min(860px, 90vw)",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              onClick={() => setExpanded(false)}
              className="btn-jade"
              style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.6rem", padding: "0.25rem 0.75rem", zIndex: 1 }}
            >
              ✕
            </button>
            <div style={{ padding: "2.5rem", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url ?? ""}
                alt=""
                style={{ width: "320px", height: "320px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--jade-subtle)" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                <div style={{ fontSize: "0.6rem", color: "var(--jade-muted)", fontFamily: "monospace", wordBreak: "break-all" }}>{img.id}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--jade-muted)", wordBreak: "break-all" }}>{img.url}</div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Badge label={img.is_public ? "Public" : "Private"} active={img.is_public ?? false} />
                  {img.is_common_use && <Badge label="Common Use" active />}
                </div>
                {img.profile_id && <div style={{ fontSize: "0.7rem", color: "var(--jade-muted)" }}>Owner: {img.profile_id}</div>}
                {img.additional_context && <div style={{ fontSize: "0.8rem", color: "var(--jade-dim)" }}>{img.additional_context}</div>}
                {img.image_description && <div style={{ fontSize: "0.8rem", color: "var(--jade-dim)" }}><span style={{ color: "var(--jade-muted)" }}>Desc: </span>{img.image_description}</div>}
                {img.celebrity_recognition && <div style={{ fontSize: "0.8rem", color: "var(--jade-muted)" }}><span style={{ color: "var(--jade-muted)" }}>Celebrity: </span>{img.celebrity_recognition}</div>}
                <div style={{ fontSize: "0.7rem", color: "var(--jade-muted)" }}>Created: {new Date(img.created_datetime_utc).toLocaleDateString()}</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <Link href={`/admin/images/${img.id}/edit`} className="btn-jade" style={{ padding: "0.25rem 0.75rem", fontSize: "0.625rem", flex: 1, textAlign: "center" }}>Edit</Link>
                  <ImageDeleteButton imageId={img.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
