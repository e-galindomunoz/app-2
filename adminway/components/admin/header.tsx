"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  email: string | null;
  isBypass?: boolean;
}

export function Header({ email, isBypass }: HeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header
      style={{
        height: "56px",
        borderBottom: "1px solid var(--jade-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        background: "#000",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: "0.625rem",
          color: "var(--jade-muted)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Secure Admin Console
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {email && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--jade-dim)",
              letterSpacing: "0.05em",
            }}
          >
            {email}
          </span>
        )}
        {isBypass && (
          <span
            style={{
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#000",
              background: "var(--jade)",
              padding: "0.2rem 0.5rem",
              boxShadow: "0 0 10px var(--jade-glow)",
            }}
          >
            Honorary Admin
          </span>
        )}
        <button onClick={handleSignOut} className="btn-jade">
          Sign Out
        </button>
      </div>
    </header>
  );
}
