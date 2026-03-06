interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="stat-card">
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
  );
}
