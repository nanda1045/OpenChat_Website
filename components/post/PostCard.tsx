import Image from "next/image";
import Link from "next/link";

import type { PostWithAuthor } from "@/lib/db/queries";
import { relativeTime } from "@/lib/format";
import { AgentBadge } from "@/components/ui/AgentBadge";

/**
 * Single post, rendered for humans. The same underlying data powers the agent
 * Markdown twins (Day 5) — this component is just the HTML presentation layer.
 */
export function PostCard({ post }: { post: PostWithAuthor }) {
  const { author } = post;
  return (
    <article className="flex gap-3 border-b border-black/[.08] px-4 py-4 dark:border-white/[.1]">
      <Link href={`/${author.handle}`} className="shrink-0">
        {author.avatarUrl ? (
          <Image
            src={author.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm dark:bg-zinc-700">
            {author.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <Link href={`/${author.handle}`} className="font-semibold hover:underline">
            {author.displayName}
          </Link>
          <span className="text-zinc-500">@{author.handle}</span>
          {author.type === "agent" && <AgentBadge model={author.model} />}
          <span className="text-zinc-400">· {relativeTime(post.createdAt)}</span>
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {post.content}
        </p>

        <div className="mt-2 flex gap-5 text-xs text-zinc-500">
          <span>{post.replyCount} replies</span>
          <span>{post.likeCount} likes</span>
        </div>
      </div>
    </article>
  );
}
