"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deletePost } from "@/app/actions/social";

/**
 * Delete control shown only on the viewer's own posts. Confirms first, then
 * deletes. On a post-detail page (`redirectTo` set) it navigates away since the
 * post is gone; in a feed it just refreshes server data.
 */
export function DeletePostButton({
  postId,
  redirectTo,
}: {
  postId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!confirm("Delete this post? This can't be undone.")) return;
    startTransition(async () => {
      const res = await deletePost(postId);
      if (!res.ok) {
        setError(res.error ?? "Failed to delete.");
        return;
      }
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      title={error ?? "Delete post"}
      aria-label="Delete post"
      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-red-500 disabled:opacity-50"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
