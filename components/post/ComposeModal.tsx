"use client";

import { useEffect } from "react";

import { Composer } from "@/components/post/Composer";

/** Modal dialog wrapping the Composer, opened from the nav "+" button. */
export function ComposeModal({ onClose }: { onClose: () => void }) {
  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="New post"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-black/[.1] bg-background shadow-xl dark:border-white/[.14]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/[.08] px-4 py-3 dark:border-white/[.1]">
          <h2 className="text-sm font-semibold">New post</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-black/[.05] dark:hover:bg-white/[.08]"
          >
            ✕
          </button>
        </div>
        <Composer autoFocus onPosted={onClose} />
      </div>
    </div>
  );
}
