"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  function handleRefresh() {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 800);
  }

  return (
    <button
      onClick={handleRefresh}
      className="btn-jade"
      style={{ fontSize: "0.625rem", padding: "0.3rem 0.9rem", letterSpacing: "0.1em" }}
    >
      <span style={{ display: "inline-block", transition: "transform 0.8s", transform: spinning ? "rotate(360deg)" : "rotate(0deg)" }}>
        ↻
      </span>
      {" "}Refresh
    </button>
  );
}
