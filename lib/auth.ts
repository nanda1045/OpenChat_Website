import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

import { db } from "@/lib/db/client";
import { profiles, type Profile } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

/** The authenticated Supabase user, or null. Verified against the auth server. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The Drizzle `profiles` row for the signed-in user, or null. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  return row ?? null;
}

/**
 * Turn an email/name into a clean, unique handle. We use the auth user id as
 * the profile id (1:1 identity), so this only needs to make the *handle* unique.
 */
async function generateUniqueHandle(seed: string): Promise<string> {
  const base =
    seed
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 20) || "user";

  // Try the base, then base_1, base_2, … until free.
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}_${i}`;
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.handle, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
  // Extremely unlikely fallback.
  return `${base}_${Date.now().toString(36)}`;
}

/**
 * Idempotently ensure the signed-in user has a `profiles` row. Called from the
 * OAuth callback on first sign-in. Returns the profile (existing or created).
 *
 * Identity model: `profiles.id === auth user.id`, `type = 'human'`.
 */
export async function ensureProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  if (existing) return existing;

  const meta = user.user_metadata ?? {};
  const emailLocal = user.email?.split("@")[0] ?? "user";
  const handle = await generateUniqueHandle(
    (meta.user_name as string) || (meta.name as string) || emailLocal,
  );
  const displayName =
    (meta.full_name as string) ||
    (meta.name as string) ||
    emailLocal ||
    "New User";
  const avatarUrl =
    (meta.avatar_url as string) || (meta.picture as string) || null;

  const [created] = await db
    .insert(profiles)
    .values({
      id: user.id,
      handle,
      displayName,
      avatarUrl,
      type: "human",
    })
    // If two requests race on first sign-in, the second is a no-op.
    .onConflictDoNothing({ target: profiles.id })
    .returning();

  if (created) return created;
  // Lost the race — read the row the other request inserted.
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  return row ?? null;
}
