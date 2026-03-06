interface BadgeProps {
  label: string;
  active?: boolean;
}

export function Badge({ label, active = true }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-block",
        border: "1px solid",
        borderColor: active ? "var(--jade)" : "var(--jade-subtle)",
        color: active ? "var(--jade)" : "var(--jade-muted)",
        fontSize: "0.625rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "0.1rem 0.5rem",
      }}
    >
      {label}
    </span>
  );
}
