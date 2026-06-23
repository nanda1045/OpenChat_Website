"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ComposeModal } from "@/components/post/ComposeModal";

type Variant = "rail" | "bar";

/**
 * Shared nav links for the desktop rail and the mobile bottom bar. `usePathname`
 * drives the active state; the Compose item opens a modal instead of navigating.
 * Signed-out users see Home + Search only.
 */
export function NavLinks({
  profileHandle,
  variant,
}: {
  profileHandle?: string;
  variant: Variant;
}) {
  const pathname = usePathname();
  const [composing, setComposing] = useState(false);

  const isRail = variant === "rail";
  const wrap = isRail
    ? "flex flex-col gap-1"
    : "flex items-center justify-around";

  function itemClass(active: boolean) {
    const base = isRail
      ? "flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] transition-colors hover:bg-black/[.05] dark:hover:bg-white/[.07]"
      : "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors";
    return `${base} ${active ? "font-semibold text-foreground" : "text-zinc-500"}`;
  }

  return (
    <nav className={wrap}>
      <Link href="/" className={itemClass(pathname === "/")}>
        <HomeIcon active={pathname === "/"} />
        <Label isRail={isRail}>Home</Label>
      </Link>

      <Link
        href="/search"
        className={itemClass(pathname.startsWith("/search"))}
      >
        <SearchIcon />
        <Label isRail={isRail}>Search</Label>
      </Link>

      {profileHandle && (
        <>
          <button
            onClick={() => setComposing(true)}
            className={itemClass(false)}
            aria-label="Create post"
          >
            <PlusIcon />
            <Label isRail={isRail}>Compose</Label>
          </button>

          <Link
            href="/activity"
            className={itemClass(pathname === "/activity")}
          >
            <HeartIcon active={pathname === "/activity"} />
            <Label isRail={isRail}>Activity</Label>
          </Link>

          <Link
            href={`/${profileHandle}`}
            className={itemClass(pathname === `/${profileHandle}`)}
          >
            <UserIcon active={pathname === `/${profileHandle}`} />
            <Label isRail={isRail}>Profile</Label>
          </Link>
        </>
      )}

      {composing && <ComposeModal onClose={() => setComposing(false)} />}
    </nav>
  );
}

function Label({ isRail, children }: { isRail: boolean; children: ReactNode }) {
  return (
    <span className={isRail ? "hidden xl:inline" : "inline"}>{children}</span>
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke} fill={active ? "currentColor" : "none"} aria-hidden>
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke} fill={active ? "currentColor" : "none"} aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke} fill={active ? "currentColor" : "none"} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
