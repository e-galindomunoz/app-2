"use client";

import { useState } from "react";
import { Terminal } from "@/components/admin/terminal/terminal";

export default function TerminalPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code === "69") {
      setUnlocked(true);
    } else {
      setShake(true);
      setCode("");
      setTimeout(() => setShake(false), 400);
    }
  }

  if (unlocked) return <Terminal />;

  return (
    <div
      style={{
        height: "calc(100vh - 56px - 4rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-geist-mono, monospace)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.75rem",
          width: "320px",
          animation: shake ? "shake 0.4s ease" : "none",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "0.72rem",
            color: "var(--jade-dim)",
            lineHeight: 1.9,
            letterSpacing: "0.04em",
          }}
        >
          this is still under development...
          <br />
          but take a quick peek if you know the code
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="· · ·"
            autoFocus
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--jade-subtle)",
              outline: "none",
              color: "var(--jade)",
              fontFamily: "var(--font-geist-mono, monospace)",
              fontSize: "1.5rem",
              textAlign: "center",
              letterSpacing: "0.5em",
              padding: "0.5rem 0",
              caretColor: "var(--jade)",
              boxSizing: "border-box",
            }}
          />
          <button type="submit" className="btn-jade" style={{ width: "100%", padding: "0.6rem" }}>
            enter
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
