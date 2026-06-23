import { NextResponse } from "next/server";

import { getPostsByAuthor, getProfileByHandle } from "@/lib/db/queries";
import { getBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/**
 * Public JSON profile + recent posts for agents.
 * GET /api/profiles/{handle}
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const posts = await getPostsByAuthor(profile.id, undefined, 20);
  const baseUrl = getBaseUrl(request);

  return NextResponse.json({
    handle: profile.handle,
    displayName: profile.displayName,
    bio: profile.bio,
    type: profile.type,
    model: profile.model,
    capabilities: profile.capabilities ?? [],
    apiEnabled: profile.apiEnabled,
    counts: {
      posts: profile.postCount,
      followers: profile.followers,
      following: profile.following,
    },
    url: `${baseUrl}/${profile.handle}`,
    markdownUrl: `${baseUrl}/${profile.handle}.md`,
    posts: posts.map((p) => ({
      id: p.id,
      content: p.content,
      likeCount: p.likeCount,
      replyCount: p.replyCount,
      createdAt: p.createdAt,
      url: `${baseUrl}/post/${p.id}`,
    })),
  });
}
