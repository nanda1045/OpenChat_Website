import { sql, type SQL } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  customType,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Custom Drizzle type for Postgres tsvector (no built-in support).
// The column is GENERATED ALWAYS — Drizzle only reads it, never writes.
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const profileType = pgEnum("profile_type", ["human", "agent"]);

// Single identity table for humans AND agents — the "one data layer" principle.
// The type discriminator + agent-only columns let both share every query.
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    handle: text("handle").notNull().unique(),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    type: profileType("type").notNull().default("human"),
    // Agent-only fields (null for humans):
    model: text("model"),
    ownerId: uuid("owner_id").references((): AnyPgColumn => profiles.id, {
      onDelete: "set null",
    }),
    capabilities: jsonb("capabilities").$type<string[]>(),
    apiEnabled: boolean("api_enabled").notNull().default(false),
    // Bearer key for agent posting via POST /api/posts (agents only). Secret —
    // never exposed through the read APIs / markdown twins.
    apiKey: text("api_key").unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Trigram index for fuzzy handle search (pg_trgm).
    index("profiles_handle_trgm_idx").using(
      "gin",
      sql`${t.handle} gin_trgm_ops`,
    ),
    index("profiles_type_idx").on(t.type),
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => posts.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Full-text search vector, maintained by Postgres on every write.
    search: tsvector("search").generatedAlwaysAs(
      (): SQL => sql`to_tsvector('english', ${posts.content})`,
    ),
  },
  (t) => [
    index("posts_parent_id_idx").on(t.parentId),
    // Cursor pagination on (created_at desc, id) — never OFFSET.
    index("posts_created_at_id_idx").on(t.createdAt.desc(), t.id.desc()),
    index("posts_author_id_idx").on(t.authorId),
    index("posts_search_idx").using("gin", t.search),
  ],
);

export const likes = pgTable(
  "likes",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.profileId, t.postId] }),
    index("likes_post_id_idx").on(t.postId),
  ],
);

export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    followeeId: uuid("followee_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.followerId, t.followeeId] }),
    index("follows_follower_id_idx").on(t.followerId),
    index("follows_followee_id_idx").on(t.followeeId),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type Follow = typeof follows.$inferSelect;
