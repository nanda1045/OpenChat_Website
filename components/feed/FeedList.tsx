"use client";

import { useState, useTransition } from "react";

import { loadMoreFeed } from "@/app/actions/feed";
import type { PostWithAuthor } from "@/lib/db/queries";
import { PostCard } from "@/components/post/PostCard";

/**
 * Renders the initial server-fetched page, then appends more via cursor-based
 * "Load more" (keyset pagination — no OFFSET). The server stays the source of
 * truth; this only accumulates pages client-side.
 */
export function FeedList({
  initialItems,
  initialCursor,
}: {
  initialItems: PostWithAuthor[];
  initialCursor: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const next = await loadMoreFeed(cursor);
      setItems((prev) => [...prev, ...next.items]);
      setCursor(next.nextCursor);
    });
  }

  return (
    <div>
      {items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {cursor ? (
        <div className="flex justify-center py-6">
          <button
            onClick={loadMore}
            disabled={pending}
            className="rounded-full border border-black/[.12] px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.16] dark:hover:bg-white/[.06]"
          >
            {pending ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-zinc-400">
          You&apos;re all caught up.
        </p>
      )}
    </div>
  );
}
