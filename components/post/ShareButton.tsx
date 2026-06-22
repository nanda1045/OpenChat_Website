"use client";

import { useState } from "react";

/**
 * Share = copy a link to the post. No backend / schema — every post already has
 * a canonical /post/[id] URL. Falls back gracefully if the Clipboard API is
 * unavailable.
 */
export function ShareButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers / insecure contexts: last-ditch prompt.
      window.prompt("Copy link to this post:", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={onClick}
      aria-label="Copy link to post"
      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-foreground"
    >
      {copied ? (
        <>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copied
        </>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M16 6l-4-4-4 4M12 2v13" />
        </svg>
      )}
    </button>
  );
}
