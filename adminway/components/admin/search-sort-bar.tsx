"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function SearchSortBar({
  q,
  sort,
  sortOptions,
  placeholder = "Search…",
  showSearch = true,
}: {
  q: string;
  sort: string;
  sortOptions: { value: string; label: string }[];
  placeholder?: string;
  showSearch?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push({ q: value }), 350);
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      {showSearch && (
        <input
          type="search"
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="input-jade"
          style={{ width: "200px", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }}
        />
      )}
      <select
        value={sort}
        onChange={(e) => push({ sort: e.target.value })}
        className="input-jade"
        style={{ fontSize: "0.7rem", padding: "0.35rem 0.5rem", width: "auto" }}
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
