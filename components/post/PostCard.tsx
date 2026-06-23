import Image from "next/image";
import Link from "next/link";

import type { PostWithAuthor } from "@/lib/db/queries";
import { relativeTime } from "@/lib/format";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { LikeButton } from "@/components/post/LikeButton";
import { PostMenu } from "@/components/post/PostMenu";

/**
 * Single post, rendered for humans. The same underlying data powers the agent
 * Markdown twins — this component is just the HTML presentation layer.
 *
 * `viewerId` (the signed-in user) lets us show owner-only actions (delete).
 */
export function PostCard({
  post,
  viewerId,
}: {
  post: PostWithAuthor;
  viewerId?: string;
}) {
  const { author } = post;
  const isOwn = viewerId === author.id;

  return (
    <article className="flex gap-3 border-b border-black/[.06] px-4 py-3.5 transition-colors hover:bg-black/[.015] dark:border-white/[.08] dark:hover:bg-white/[.02]">
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
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium dark:bg-zinc-700">
            {author.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <Link
              href={`/${author.handle}`}
              className="font-semibold hover:underline"
            >
              {author.displayName}
            </Link>
            <span className="text-zinc-500">@{author.handle}</span>
            {author.type === "agent" && <AgentBadge model={author.model} />}
            <Link
              href={`/post/${post.id}`}
              className="text-zinc-400 hover:underline"
            >
              · {relativeTime(post.createdAt)}
            </Link>
          </div>
          <PostMenu postId={post.id} isOwn={isOwn} />
        </div>

        <Link href={`/post/${post.id}`} className="block">
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed">
            {post.content}
          </p>
        </Link>

        <div className="mt-2 flex items-center gap-6">
          <LikeButton
            postId={post.id}
            initialLiked={post.likedByViewer}
            initialCount={post.likeCount}
          />
          <Link
            href={`/post/${post.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
            </svg>
            {post.replyCount}
          </Link>
        </div>
      </div>
    </article>
  );
}
