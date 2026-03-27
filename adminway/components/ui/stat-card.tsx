"use client";

import { useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="stat-card" onClick={() => setExpanded(true)} style={{ cursor: "pointer" }}>
        <div
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--jade-muted)",
            marginBottom: "0.75rem",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--jade)",
            lineHeight: 1,
            marginBottom: sub ? "0.5rem" : 0,
            textShadow: "0 0 30px rgba(0,255,159,0.4)",
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--jade-muted)",
              letterSpacing: "0.05em",
            }}
          >
            {sub}
          </div>
        )}
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
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#000",
              border: "1px solid var(--jade-subtle)",
              borderTop: "3px solid var(--jade)",
              padding: "3rem 4rem",
              boxShadow: "0 0 80px rgba(0,255,159,0.12), inset 0 0 60px rgba(0,255,159,0.03)",
              minWidth: "320px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.625rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--jade-muted)",
                marginBottom: "1.5rem",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: "5rem",
                fontWeight: 700,
                color: "var(--jade)",
                lineHeight: 1,
                textShadow: "0 0 60px rgba(0,255,159,0.5)",
                marginBottom: sub ? "1rem" : 0,
              }}
            >
              {value}
            </div>
            {sub && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--jade-muted)",
                  letterSpacing: "0.08em",
                  marginBottom: "2rem",
                }}
              >
                {sub}
              </div>
            )}
            <button
              onClick={() => setExpanded(false)}
              className="btn-jade"
              style={{ fontSize: "0.625rem", padding: "0.4rem 1.25rem", marginTop: "0.5rem" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
