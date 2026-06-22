"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Search input. Submits to /search?q= (server-rendered results). Used both in
 * the header (compact) and at the top of the search page.
 */
export function SearchBox({
  initialQuery = "",
  autoFocus = false,
  className,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search"
        aria-label="Search"
        className="w-full rounded-full border border-black/[.12] bg-transparent px-4 py-1.5 text-sm outline-none focus:border-foreground dark:border-white/[.16]"
      />
    </form>
  );
}
