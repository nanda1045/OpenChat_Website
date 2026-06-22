"use server";

import { getCurrentProfile } from "@/lib/auth";
import { getFeed, type Feed } from "@/lib/db/queries";

/** Server action backing the feed's "Load more" — viewer-aware pagination. */
export async function loadMoreFeed(cursor: string): Promise<Feed> {
  const me = await getCurrentProfile();
  return getFeed({ cursor, viewerId: me?.id });
}
