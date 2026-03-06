"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/admin/profiles", label: "Profiles", icon: "◉" },
  { href: "/admin/images", label: "Images", icon: "◫" },
  { href: "/admin/captions", label: "Captions", icon: "◳" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "#000",
        borderRight: "1px solid var(--jade-subtle)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid var(--jade-subtle)",
        }}
      >
        <div
          style={{
            fontSize: "0.625rem",
            color: "var(--jade-muted)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "0.25rem",
          }}
        >
          System
        </div>
        <div
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--jade)",
            textShadow: "var(--jade-glow)",
          }}
        >
          AdminWay
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "1rem 0", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: active ? "var(--jade)" : "var(--jade-muted)",
                borderLeft: active
                  ? "2px solid var(--jade)"
                  : "2px solid transparent",
                background: active ? "var(--jade-glass)" : "transparent",
                boxShadow: active ? "inset var(--jade-glow-sm)" : "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--jade-subtle)",
          fontSize: "0.625rem",
          color: "var(--jade-muted)",
          letterSpacing: "0.1em",
        }}
      >
        ADMINWAY v1.0
      </div>
    </aside>
  );
}
