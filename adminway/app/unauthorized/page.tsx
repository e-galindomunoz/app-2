import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="bg-grid min-h-screen flex items-center justify-center">
      <div
        className="stat-card max-w-sm w-full mx-4 text-center"
        style={{ padding: "3rem 2rem" }}
      >
        <div
          className="text-5xl font-bold mb-4"
          style={{ color: "var(--jade)", textShadow: "var(--jade-glow)" }}
        >
          403
        </div>
        <h1
          className="text-lg uppercase tracking-widest mb-2"
          style={{ color: "var(--jade)" }}
        >
          Access Denied
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: "var(--jade-muted)" }}
        >
          Your account does not have superadmin privileges.
        </p>
        <Link href="/login" className="btn-jade inline-block">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
