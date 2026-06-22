-- Row Level Security: reads public, writes restricted to the authenticated owner.
--
-- IMPORTANT (CLAUDE.md gotcha #6): the app accesses the DB through Drizzle on
-- the Postgres role via the pooler, which BYPASSES RLS. So these policies are
-- defense-in-depth for the anon/PostgREST surface (and any future use of the
-- Supabase client) — the real write-authorization for the app lives in Server
-- Actions, which re-check the session and only ever write the caller's own row.
-- Public reads matter for anon agents/crawlers hitting PostgREST and for the
-- coming .md / JSON agent layer.

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "likes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "follows" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Public read access for everyone (anon + authenticated).
CREATE POLICY "profiles_public_read" ON "profiles" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "posts_public_read" ON "posts" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "likes_public_read" ON "likes" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "follows_public_read" ON "follows" FOR SELECT USING (true);--> statement-breakpoint

-- Owner-only writes (profiles.id == auth.uid()).
CREATE POLICY "profiles_owner_update" ON "profiles" FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);--> statement-breakpoint
CREATE POLICY "profiles_owner_insert" ON "profiles" FOR INSERT
  WITH CHECK (auth.uid() = id);--> statement-breakpoint

-- Posts: an authenticated profile may write its own posts.
CREATE POLICY "posts_author_insert" ON "posts" FOR INSERT
  WITH CHECK (auth.uid() = author_id);--> statement-breakpoint
CREATE POLICY "posts_author_delete" ON "posts" FOR DELETE
  USING (auth.uid() = author_id);--> statement-breakpoint

-- Likes / follows: a user may only create/remove rows for themselves.
CREATE POLICY "likes_owner_write" ON "likes" FOR ALL
  USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);--> statement-breakpoint
CREATE POLICY "follows_owner_write" ON "follows" FOR ALL
  USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);
