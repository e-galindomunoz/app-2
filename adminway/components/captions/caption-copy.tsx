"use client";

import { useState } from "react";

export function CaptionCopy({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={handleClick}
      title="Click to copy"
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: "pointer",
        color: copied ? "var(--jade)" : "var(--jade-dim)",
        transition: "color 0.2s",
      }}
    >
      {copied ? "Copied!" : content}
    </div>
  );
}
