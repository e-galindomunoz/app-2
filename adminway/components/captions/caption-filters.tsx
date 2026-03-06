"use client";

import { useState } from "react";

interface Props {
  sort: string;
  visibility: string;
  q: string;
}

export function CaptionFilters({ sort, visibility, q }: Props) {
  const [open, setOpen] = useState(false);

  const selectStyle: React.CSSProperties = {
    background: "var(--jade-glass)",
    border: "1px solid var(--jade-subtle)",
    color: "var(--jade-dim)",
    fontSize: "0.7rem",
    padding: "0.4rem 0.6rem",
    letterSpacing: "0.05em",
    outline: "none",
    cursor: "pointer",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.6rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "var(--jade-muted)",
    marginBottom: "0.35rem",
    display: "block",
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
      <form method="get" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input type="hidden" name="page" value="1" />
        <input
          name="q"
          type="search"
          className="input-jade"
          placeholder="Search captions..."
          defaultValue={q}
          style={{ width: "200px" }}
        />
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="visibility" value={visibility} />
        <button type="submit" className="btn-jade">Search</button>
      </form>

      <button className="btn-jade" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Filter"}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            right: 0,
            background: "#000",
            border: "1px solid var(--jade-subtle)",
            borderTop: "2px solid var(--jade)",
            padding: "1.25rem",
            minWidth: "260px",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <form method="get">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="q" value={q} />

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Sort</label>
                <select name="sort" defaultValue={sort} style={selectStyle}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="likes">Most Liked</option>
                  <option value="least">Least Liked</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Visibility</label>
                <select name="visibility" defaultValue={visibility} style={selectStyle}>
                  <option value="all">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn-jade" style={{ flex: 1 }}>
                Apply
              </button>
              <a
                href="?"
                className="btn-jade"
                style={{ flex: 1, textAlign: "center", textDecoration: "none", opacity: 0.6 }}
              >
                Reset
              </a>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
