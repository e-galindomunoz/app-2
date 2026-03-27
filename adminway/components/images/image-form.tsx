"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Image as ImageType, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface ImageFormProps {
  image?: ImageType;
  profiles: Pick<Profile, "id" | "email" | "first_name" | "last_name">[];
  action: (formData: FormData) => Promise<{ error?: string }>;
}

export function ImageForm({ image, profiles, action }: ImageFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState(image?.url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = e.currentTarget;

    // For new images, insert directly from browser client (bypasses server-side RLS)
    if (!image) {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id ?? null;
      const { error: dbError } = await supabase.from("images").insert({
        url,
        profile_id: userId,
        is_public: (form.is_public as HTMLInputElement).checked,
        is_common_use: (form.is_common_use as HTMLInputElement).checked,
        additional_context: (form.additional_context as HTMLTextAreaElement).value || null,
        image_description: (form.image_description as HTMLTextAreaElement).value || null,
        created_by_user_id: userId,
        modified_by_user_id: userId,
      });
      setPending(false);
      if (dbError) { setError(dbError.message); return; }
      router.push("/admin/images");
      return;
    }

    // For edits, also use browser client
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const profileIdVal = (form.profile_id as HTMLSelectElement).value;
    const { error: dbError } = await supabase.from("images").update({
      url,
      profile_id: profileIdVal || null,
      is_public: (form.is_public as HTMLInputElement).checked,
      is_common_use: (form.is_common_use as HTMLInputElement).checked,
      additional_context: (form.additional_context as HTMLTextAreaElement).value || null,
      image_description: (form.image_description as HTMLTextAreaElement).value || null,
      modified_by_user_id: session?.user.id ?? null,
    }).eq("id", image.id);
    setPending(false);
    if (dbError) { setError(dbError.message); return; }
    router.push("/admin/images");
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.625rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "var(--jade-muted)",
    marginBottom: "0.375rem",
  };

  const fieldStyle: React.CSSProperties = { marginBottom: "1.25rem" };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "640px" }}>
      {error && (
        <div
          style={{
            border: "1px solid var(--jade)",
            background: "rgba(0,255,159,0.05)",
            color: "var(--jade)",
            padding: "0.75rem 1rem",
            fontSize: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {/* File upload */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Upload File {uploading && <span style={{ color: "var(--jade-muted)" }}>— uploading...</span>}</label>
        <input
          type="file"
          accept="image/*"
          className="input-jade"
          style={{ cursor: "pointer" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            setError(null);
            const ext = file.name.split(".").pop();
            const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const supabase = createClient();
            const { error: uploadError } = await supabase.storage.from("images").upload(path, file, { contentType: file.type });
            if (uploadError) {
              setError(uploadError.message);
              setUploading(false);
              return;
            }
            const { data } = supabase.storage.from("images").getPublicUrl(path);
            setUrl(data.publicUrl);
            setUploading(false);
          }}
        />
      </div>

      {/* URL — optional if file provided */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Or Image URL</label>
        <input
          name="url"
          type="url"
          className="input-jade"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* URL Preview */}
      {url && (
        <div style={{ ...fieldStyle, marginTop: "-0.75rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              objectFit: "contain",
              border: "1px solid var(--jade-subtle)",
              background: "var(--jade-glass)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Profile */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Profile (owner)</label>
        <select
          name="profile_id"
          className="input-jade"
          defaultValue={image?.profile_id ?? ""}
          style={{ cursor: "pointer" }}
        >
          <option value="">— None —</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.email ??
                [p.first_name, p.last_name].filter(Boolean).join(" ") ??
                p.id}
            </option>
          ))}
        </select>
      </div>

      {/* Toggles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
            fontSize: "0.75rem",
            color: "var(--jade-dim)",
          }}
        >
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={image?.is_public ?? false}
            style={{ accentColor: "var(--jade)" }}
          />
          Public
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
            fontSize: "0.75rem",
            color: "var(--jade-dim)",
          }}
        >
          <input
            type="checkbox"
            name="is_common_use"
            defaultChecked={image?.is_common_use ?? false}
            style={{ accentColor: "var(--jade)" }}
          />
          Common Use
        </label>
      </div>

      {/* Additional Context */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Additional Context</label>
        <textarea
          name="additional_context"
          className="input-jade"
          rows={3}
          placeholder="Optional context..."
          defaultValue={image?.additional_context ?? ""}
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Image Description */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Image Description</label>
        <textarea
          name="image_description"
          className="input-jade"
          rows={3}
          placeholder="Optional description..."
          defaultValue={image?.image_description ?? ""}
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Read-only fields (edit mode) */}
      {image?.celebrity_recognition && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Celebrity Recognition (read-only)</label>
          <div
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--jade-subtle)",
              fontSize: "0.75rem",
              color: "var(--jade-muted)",
            }}
          >
            {image.celebrity_recognition}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
        <button
          type="submit"
          className="btn-jade"
          disabled={pending}
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Saving..." : image ? "Update Image" : "Create Image"}
        </button>
        <button
          type="button"
          className="btn-jade"
          onClick={() => router.push("/admin/images")}
          style={{ borderColor: "var(--jade-subtle)", color: "var(--jade-muted)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
