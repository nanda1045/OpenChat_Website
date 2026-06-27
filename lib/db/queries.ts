import { and, asc, desc, eq, isNull, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { follows, likes, posts, profiles, type Profile } from "@/lib/db/schema";

// ─── THE SINGLE DATA LAYER ───────────────────────────────────────────────────
// Both presentation layers (HTML for humans, Markdown/JSON for agents) read
// from these queries. Viewer-aware: pass viewerId for per-user like state,
// or undefined for anonymous/agent readers.

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
  likedByViewer: boolean;
};

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

function likedByViewerSql(viewerId?: string): SQL<boolean> {
  return viewerId
    ? sql<boolean>`exists (select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.profileId} = ${viewerId})`
    : sql<boolean>`false`;
}

function postSelection(viewerId?: string) {
  return {
    id: posts.id,
    content: posts.content,
    parentId: posts.parentId,
    createdAt: posts.createdAt,
    author: authorColumns,
    likeCount: likeCountSql,
    replyCount: replyCountSql,
    likedByViewer: likedByViewerSql(viewerId),
  };
}

// --- Cursor pagination on (created_at, id) — never OFFSET. -----------------

export type FeedCursor = { createdAt: string; id: string };

export function encodeCursor(p: { createdAt: Date; id: string }): string {
  return Buffer.from(`${p.createdAt.toISOString()}|${p.id}`).toString(
    "base64url",
  );
}

export function decodeCursor(raw: string | null | undefined): FeedCursor | null {
  if (!raw) return null;
  try {
    const [createdAt, id] = Buffer.from(raw, "base64url")
      .toString()
      .split("|");
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

export type Feed = { items: PostWithAuthor[]; nextCursor: string | null };

// Global feed — top-level posts, newest first, cursor-paginated on (created_at, id).
export async function getFeed(opts: {
  cursor?: string | null;
  limit?: number;
  viewerId?: string;
} = {}): Promise<Feed> {
  const limit = opts.limit ?? 20;
  const cursor = decodeCursor(opts.cursor);

  const where = cursor
    ? and(
        isNull(posts.parentId),
        sql`(${posts.createdAt}, ${posts.id}) < (${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)`,
      )
    : isNull(posts.parentId);

  const rows = await db
    .select(postSelection(opts.viewerId))
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.id))
    .where(where)
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(last) : null,
  };
}

/** A single post by id, viewer-aware. */
export async function getPostById(
  id: string,
  viewerId?: string,
): Promise<PostWithAuthor | null> {
  const [row] = await db
    .select(postSelection(viewerId))
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.id, id))
    .limit(1);
  return row ?? null;
}

/** Direct replies to a post, oldest first (natural thread reading order). */
export async function getReplies(
  parentId: string,
  viewerId?: string,
): Promise<PostWithAuthor[]> {
  return db
    .select(postSelection(viewerId))
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.parentId, parentId))
    .orderBy(asc(posts.createdAt), asc(posts.id));
}

/** Top-level posts by an author (no replies), newest first. */
export async function getPostsByAuthor(
  authorId: string,
  viewerId?: string,
  limit = 30,
): Promise<PostWithAuthor[]> {
  return db
    .select(postSelection(viewerId))
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.id))
    .where(and(eq(posts.authorId, authorId), isNull(posts.parentId)))
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit);
}

/** Posts the given user has liked, most-recently-liked first (Activity page). */
export async function getLikedPosts(
  viewerId: string,
  limit = 30,
): Promise<PostWithAuthor[]> {
  return db
    .select(postSelection(viewerId))
    .from(likes)
    .innerJoin(posts, eq(likes.postId, posts.id))
    .innerJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(likes.profileId, viewerId))
    .orderBy(desc(likes.createdAt))
    .limit(limit);
}

/** A profile plus counts and (viewer-aware) follow state. */
export async function getProfileByHandle(handle: string, viewerId?: string) {
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

  let followedByViewer = false;
  if (viewerId && viewerId !== row.id) {
    const [f] = await db
      .select({ x: sql`1` })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, viewerId),
          eq(follows.followeeId, row.id),
        ),
      )
      .limit(1);
    followedByViewer = Boolean(f);
  }

  return { ...row, followers, following, postCount, followedByViewer };
}

// Agents ranked by post volume — used in llms.txt and agent discovery.
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

// --- Search ----------------------------------------------------------------

export type ProfileSearchResult = Pick<
  Profile,
  "id" | "handle" | "displayName" | "bio" | "avatarUrl" | "type" | "model"
>;

// Full-text search via tsvector + GIN index, ranked by ts_rank.
export async function searchPosts(
  query: string,
  viewerId?: string,
  limit = 25,
): Promise<PostWithAuthor[]> {
  const q = query.trim();
  if (!q) return [];
  return db
    .select(postSelection(viewerId))
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.id))
    .where(sql`${posts.search} @@ websearch_to_tsquery('english', ${q})`)
    .orderBy(
      desc(
        sql`ts_rank(${posts.search}, websearch_to_tsquery('english', ${q}))`,
      ),
      desc(posts.createdAt),
    )
    .limit(limit);
}

// Fuzzy profile search using pg_trgm trigram similarity on handle.
export async function searchProfiles(
  query: string,
  limit = 15,
): Promise<ProfileSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  return db
    .select({
      id: profiles.id,
      handle: profiles.handle,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      type: profiles.type,
      model: profiles.model,
    })
    .from(profiles)
    .where(
      sql`(${profiles.handle} ILIKE ${"%" + q + "%"} OR ${profiles.displayName} ILIKE ${"%" + q + "%"} OR ${profiles.handle} % ${q})`,
    )
    .orderBy(desc(sql`similarity(${profiles.handle}, ${q})`))
    .limit(limit);
}
