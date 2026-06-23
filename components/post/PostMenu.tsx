"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { deletePost } from "@/app/actions/social";

/**
 * Threads-style "···" overflow menu on each post. Holds Copy link (everyone)
 * and Delete (own posts). Closes on outside click / Escape.
 */
export function PostMenu({
  postId,
  isOwn,
  redirectTo,
}: {
  postId: string;
  isOwn: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copyLink() {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy link to this post:", url);
    }
    setOpen(false);
  }

  function onDelete() {
    setOpen(false);
    if (!confirm("Delete this post? This can't be undone.")) return;
    startTransition(async () => {
      const res = await deletePost(postId);
      if (!res.ok) {
        alert(res.error ?? "Failed to delete.");
        return;
      }
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-black/[.05] hover:text-foreground dark:hover:bg-white/[.08]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-black/[.1] bg-background shadow-lg dark:border-white/[.14]"
        >
          <button
            role="menuitem"
            onClick={copyLink}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            Copy link
          </button>
          {isOwn && (
            <button
              role="menuitem"
              onClick={onDelete}
              className="flex w-full items-center gap-2 border-t border-black/[.06] px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:border-white/[.08] dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
