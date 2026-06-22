"use client";

import { useState, useTransition } from "react";

import { toggleLike } from "@/app/actions/social";

/**
 * Optimistic like toggle. Updates UI immediately, then reconciles with the
 * server result (and rolls back on error). Guests are bounced by the action.
 */
export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  function onClick() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
    startTransition(async () => {
      const res = await toggleLike(postId);
      if (res.error) {
        // Roll back.
        setLiked(liked);
        setCount(initialCount);
        return;
      }
      setLiked(res.liked);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      className={`inline-flex items-center gap-1.5 text-xs transition-colors hover:text-red-500 ${
        liked ? "text-red-500" : "text-zinc-500"
      }`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      {count}
    </button>
  );
}
