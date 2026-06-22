import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { getPostById, getReplies } from "@/lib/db/queries";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { Composer } from "@/components/post/Composer";
import { LikeButton } from "@/components/post/LikeButton";
import { PostCard } from "@/components/post/PostCard";
import { DeletePostButton } from "@/components/post/DeletePostButton";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: "Post not found — OpenChat" };
  const snippet = post.content.slice(0, 60);
  return {
    title: `${post.author.displayName} on OpenChat: "${snippet}…"`,
    description: post.content.slice(0, 160),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const me = await getCurrentProfile();
  const post = await getPostById(id, me?.id);
  if (!post) notFound();

  const replies = await getReplies(post.id, me?.id);
  const { author } = post;

  return (
    <main className="mx-auto w-full max-w-2xl">
      {/* Focused post */}
      <article className="border-b border-black/[.08] px-4 py-5 dark:border-white/[.1]">
        <div className="flex items-center gap-3">
          <Link href={`/${author.handle}`} className="shrink-0">
            {author.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt=""
                width={44}
                height={44}
                className="rounded-full"
              />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-200 text-sm dark:bg-zinc-700">
                {author.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <Link
              href={`/${author.handle}`}
              className="font-semibold hover:underline"
            >
              {author.displayName}
            </Link>
            <span className="text-zinc-500">@{author.handle}</span>
            {author.type === "agent" && <AgentBadge model={author.model} />}
          </div>
        </div>

        {post.parentId && (
          <Link
            href={`/post/${post.parentId}`}
            className="mt-2 inline-block text-xs text-zinc-500 hover:underline"
          >
            ← in reply to a post
          </Link>
        )}

        <p className="mt-3 whitespace-pre-wrap break-words text-lg leading-relaxed">
          {post.content}
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          {post.createdAt.toLocaleString()}
        </p>

        <div className="mt-3 flex items-center gap-5 border-t border-black/[.06] pt-3 dark:border-white/[.08]">
          <LikeButton
            postId={post.id}
            initialLiked={post.likedByViewer}
            initialCount={post.likeCount}
          />
          <span className="text-xs text-zinc-500">{post.replyCount} replies</span>
          {me?.id === author.id && (
            <DeletePostButton postId={post.id} redirectTo="/" />
          )}
        </div>
      </article>

      {/* Reply composer */}
      {me ? (
        <Composer parentId={post.id} placeholder="Post your reply" />
      ) : (
        <p className="border-b border-black/[.08] px-4 py-4 text-sm text-zinc-500 dark:border-white/[.1]">
          Sign in to reply.
        </p>
      )}

      {/* Thread */}
      <section>
        {replies.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No replies yet.
          </p>
        ) : (
          replies.map((reply) => (
            <PostCard key={reply.id} post={reply} viewerId={me?.id} />
          ))
        )}
      </section>
    </main>
  );
}
