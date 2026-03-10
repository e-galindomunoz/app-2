"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: "◈" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/profiles", label: "Users", icon: "◉" },
      { href: "/admin/images", label: "Images", icon: "◫" },
      { href: "/admin/captions", label: "Captions", icon: "◳" },
      { href: "/admin/caption-requests", label: "Caption Requests", icon: "◧" },
      { href: "/admin/caption-examples", label: "Caption Examples", icon: "◨" },
    ],
  },
  {
    label: "Humor",
    items: [
      { href: "/admin/humor-flavors", label: "Flavors", icon: "◑" },
      { href: "/admin/humor-flavor-steps", label: "Flavor Steps", icon: "◒" },
      { href: "/admin/humor-mix", label: "Humor Mix", icon: "◐" },
      { href: "/admin/terms", label: "Terms", icon: "◻" },
    ],
  },
  {
    label: "AI",
    items: [
      { href: "/admin/llm-providers", label: "LLM Providers", icon: "◆" },
      { href: "/admin/llm-models", label: "LLM Models", icon: "◇" },
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains", icon: "◈" },
      { href: "/admin/llm-responses", label: "LLM Responses", icon: "◉" },
    ],
  },
  {
    label: "Access",
    items: [
      { href: "/admin/allowed-signup-domains", label: "Allowed Domains", icon: "◎" },
      { href: "/admin/whitelisted-emails", label: "Whitelisted Emails", icon: "◌" },
    ],
  },
];

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const active = pathname.startsWith(href);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 1.25rem",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        textDecoration: "none",
        color: active || hovered ? "var(--jade)" : "var(--jade-muted)",
        borderLeft: active || hovered ? "2px solid var(--jade)" : "2px solid transparent",
        background: active ? "var(--jade-glass)" : hovered ? "var(--jade-subtle)" : "transparent",
        boxShadow: active || hovered ? "inset var(--jade-glow-sm)" : "none",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: "0.875rem" }}>{icon}</span>
      {label}
    </Link>
  );
}

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
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid var(--jade-subtle)",
          flexShrink: 0,
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
      <nav style={{ padding: "0.5rem 0", flex: 1 }}>
        {NAV_SECTIONS.map((section) => {
          const hasActive = section.items.some((item) => pathname.startsWith(item.href));
          return (
            <div key={section.label}>
              <div
                style={{
                  padding: "0.75rem 1.25rem 0.25rem",
                  fontSize: "0.5rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: hasActive ? "var(--jade-dim)" : "var(--jade-muted)",
                  fontWeight: 700,
                }}
              >
                {section.label}
              </div>
              {section.items.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
              ))}
            </div>
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
          flexShrink: 0,
        }}
      >
        ADMINWAY v1.0
      </div>
    </aside>
  );
}
