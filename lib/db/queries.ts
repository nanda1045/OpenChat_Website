import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { follows, likes, posts, profiles, type Profile } from "@/lib/db/schema";

/**
 * Typed query layer — the single source of truth both presentation layers (HTML
 * for humans, Markdown/JSON for agents) read from. Keep all DB access here.
 */

export type PostWithAuthor = {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  author: Pick<
    Profile,
    "id" | "handle" | "displayName" | "avatarUrl" | "type" | "model"
  >;
  likeCount: number;
  replyCount: number;
};

/** A profile plus the counts shown on its page. */
export async function getProfileByHandle(handle: string) {
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.handle, handle))
    .limit(1);
  if (!row) return null;

  const [{ followers }] = await db
    .select({ followers: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followeeId, row.id));
  const [{ following }] = await db
    .select({ following: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followerId, row.id));
  const [{ postCount }] = await db
    .select({ postCount: sql<number>`count(*)::int` })
    .from(posts)
    .where(eq(posts.authorId, row.id));

  return { ...row, followers, following, postCount };
}

const authorColumns = {
  id: profiles.id,
  handle: profiles.handle,
  displayName: profiles.displayName,
  avatarUrl: profiles.avatarUrl,
  type: profiles.type,
  model: profiles.model,
};

const likeCountSql = sql<number>`(select count(*)::int from ${likes} where ${likes.postId} = ${posts.id})`;
const replyCountSql = sql<number>`(select count(*)::int from ${posts} as r where r.parent_id = ${posts.id})`;

/** Top-level posts by an author (no replies), newest first. */
export async function getPostsByAuthor(
  authorId: string,
  limit = 30,
): Promise<PostWithAuthor[]> {
  const rows = await db
    .select({
      id: posts.id,
      content: posts.content,
      parentId: posts.parentId,
      createdAt: posts.createdAt,
      author: authorColumns,
      likeCount: likeCountSql,
      replyCount: replyCountSql,
    })
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.id))
    .where(and(eq(posts.authorId, authorId), isNull(posts.parentId)))
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit);
  return rows;
}

/**
 * Trending agents — agents ranked by recent post volume. Used by the home feed
 * and (Day 5) the llms.txt agent section.
 */
export async function getTrendingAgents(limit = 10) {
  return db
    .select({
      id: profiles.id,
      handle: profiles.handle,
      displayName: profiles.displayName,
      bio: profiles.bio,
      model: profiles.model,
      avatarUrl: profiles.avatarUrl,
      postCount: sql<number>`(select count(*)::int from ${posts} where ${posts.authorId} = ${profiles.id})`,
    })
    .from(profiles)
    .where(eq(profiles.type, "agent"))
    .orderBy(
      desc(
        sql`(select count(*) from ${posts} where ${posts.authorId} = ${profiles.id})`,
      ),
    )
    .limit(limit);
}
