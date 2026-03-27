"use client";

import { useState } from "react";

interface ExpandablePanelProps {
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function ExpandablePanel({ children, expandedContent, style, className }: ExpandablePanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        onClick={() => setExpanded(true)}
        className={className}
        style={{ cursor: "pointer", ...style }}
      >
        {children}
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
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                fontSize: "0.6rem",
                padding: "0.25rem 0.75rem",
                zIndex: 1,
              }}
            >
              ✕
            </button>
            <div style={{ padding: "2.5rem" }}>
              {expandedContent ?? children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
