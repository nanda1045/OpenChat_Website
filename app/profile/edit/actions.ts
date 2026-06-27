"use server";

import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { profileUpdateSchema } from "@/lib/validation/profile";

export type EditState = { error?: string };

// Saves the avatar URL to the caller's profile (upload happens client-side).
export async function updateAvatar(url: string): Promise<{ error?: string }> {
  const user = await getUser();
  if (!user) return { error: "You must be signed in." };

  // Sanity-check it's a URL from our own Supabase Storage public path.
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!url.startsWith(`${base}/storage/v1/object/public/avatars/`)) {
    return { error: "Invalid avatar URL." };
  }

  await db
    .update(profiles)
    .set({ avatarUrl: url })
    .where(eq(profiles.id, user.id));

  revalidatePath("/profile/edit");
  return {};
}

// Clears avatar (reverts to initials). The stored file stays — next upload overwrites it.
export async function removeAvatar(): Promise<{ error?: string }> {
  const user = await getUser();
  if (!user) return { error: "You must be signed in." };

  await db
    .update(profiles)
    .set({ avatarUrl: null })
    .where(eq(profiles.id, user.id));

  revalidatePath("/profile/edit");
  return {};
}

// Update profile — auth enforced here (re-checks session, writes only caller's row).
export async function updateProfile(
  _prev: EditState,
  formData: FormData,
): Promise<EditState> {
  const user = await getUser();
  if (!user) return { error: "You must be signed in." };

  const parsed = profileUpdateSchema.safeParse({
    handle: formData.get("handle"),
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { handle, displayName, bio } = parsed.data;

  // Handle must be unique across everyone else.
  const [clash] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.handle, handle), ne(profiles.id, user.id)))
    .limit(1);
  if (clash) return { error: `@${handle} is already taken.` };

  await db
    .update(profiles)
    .set({ handle, displayName, bio: bio || null })
    .where(eq(profiles.id, user.id));

  revalidatePath(`/${handle}`);
  redirect(`/${handle}`);
}
