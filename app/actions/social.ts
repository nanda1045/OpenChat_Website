"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { follows, likes, posts } from "@/lib/db/schema";
import { createPostSchema } from "@/lib/validation/post";

/**
 * All social writes. Authorization is enforced HERE (not in the proxy): every
 * action re-reads the session and only writes rows the caller owns. Drizzle
 * bypasses RLS, so this is the real gate (CLAUDE.md gotcha #6).
 */

export type PostActionState = { error?: string };

/** Create a top-level post or a reply (when parentId is set). */
export async function createPost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const me = await getCurrentProfile();
  if (!me) return { error: "You must be signed in to post." };

  const parsed = createPostSchema.safeParse({
    content: formData.get("content"),
    parentId: (formData.get("parentId") as string) || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post." };
  }
  const { content, parentId } = parsed.data;

  await db.insert(posts).values({
    authorId: me.id,
    content,
    parentId: parentId ?? null,
  });

  // Refresh the surfaces this post can appear on.
  revalidatePath("/");
  if (parentId) revalidatePath(`/post/${parentId}`);
  revalidatePath(`/${me.handle}`);
  return {};
}

/** Like or unlike a post. Returns the new state for optimistic UIs. */
export async function toggleLike(
  postId: string,
): Promise<{ liked: boolean; error?: string }> {
  const me = await getCurrentProfile();
  if (!me) return { liked: false, error: "Sign in to like posts." };

  const [existing] = await db
    .select({ x: sql`1` })
    .from(likes)
    .where(and(eq(likes.profileId, me.id), eq(likes.postId, postId)))
    .limit(1);

  if (existing) {
    await db
      .delete(likes)
      .where(and(eq(likes.profileId, me.id), eq(likes.postId, postId)));
    return { liked: false };
  }

  await db
    .insert(likes)
    .values({ profileId: me.id, postId })
    .onConflictDoNothing();
  return { liked: true };
}

/** Follow or unfollow a profile. No self-follows. */
export async function toggleFollow(
  followeeId: string,
): Promise<{ following: boolean; error?: string }> {
  const me = await getCurrentProfile();
  if (!me) return { following: false, error: "Sign in to follow." };
  if (me.id === followeeId)
    return { following: false, error: "You can't follow yourself." };

  const [existing] = await db
    .select({ x: sql`1` })
    .from(follows)
    .where(
      and(eq(follows.followerId, me.id), eq(follows.followeeId, followeeId)),
    )
    .limit(1);

  if (existing) {
    await db
      .delete(follows)
      .where(
        and(eq(follows.followerId, me.id), eq(follows.followeeId, followeeId)),
      );
    return { following: false };
  }

  await db
    .insert(follows)
    .values({ followerId: me.id, followeeId })
    .onConflictDoNothing();
  return { following: true };
}
