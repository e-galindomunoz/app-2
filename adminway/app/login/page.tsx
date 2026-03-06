"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="bg-grid min-h-screen flex items-center justify-center">
      <div
        className="stat-card max-w-sm w-full mx-4 text-center"
        style={{ padding: "3rem 2rem" }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--jade-muted)" }}
        >
          System Access
        </div>
        <h1
          className="text-2xl font-bold tracking-widest uppercase mb-1"
          style={{ color: "var(--jade)" }}
        >
          AdminWay
        </h1>
        <div className="text-xs mb-8" style={{ color: "var(--jade-muted)" }}>
          Restricted area — authorized personnel only
        </div>

        <button
          onClick={signInWithGoogle}
          className="btn-jade w-full flex items-center justify-center gap-3"
          style={{ padding: "0.75rem 1.5rem" }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={16}
            height={16}
            style={{ filter: "brightness(0) invert(1)", opacity: 0.8 }}
          />
          Continue with Google
        </button>

        <div className="mt-6 text-xs" style={{ color: "var(--jade-muted)" }}>
          Superadmin credentials required
        </div>
      </div>
    </div>
  );
}
