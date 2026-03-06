"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ImageDeleteButtonProps {
  imageId: string;
}

export function ImageDeleteButton({ imageId }: ImageDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.from("images").delete().eq("id", imageId);
    if (error) {
      alert(error.message);
      setPending(false);
      setConfirming(false);
    } else {
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span
          style={{
            fontSize: "0.625rem",
            color: "var(--jade-muted)",
            letterSpacing: "0.05em",
          }}
        >
          Confirm?
        </span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="btn-jade"
          style={{
            padding: "0.25rem 0.75rem",
            fontSize: "0.625rem",
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn-jade"
          style={{
            padding: "0.25rem 0.75rem",
            fontSize: "0.625rem",
            borderColor: "var(--jade-subtle)",
            color: "var(--jade-muted)",
          }}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn-jade"
      style={{
        padding: "0.25rem 0.75rem",
        fontSize: "0.625rem",
        borderColor: "var(--jade-subtle)",
        color: "var(--jade-muted)",
      }}
    >
      Delete
    </button>
  );
}
