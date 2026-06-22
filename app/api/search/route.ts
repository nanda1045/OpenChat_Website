import { NextResponse } from "next/server";

import { searchPosts, searchProfiles } from "@/lib/db/queries";

/**
 * JSON search API — the agent-facing twin of /search. Reads the SAME query
 * layer as the HTML page (one data layer, two presentation layers). Anonymous /
 * viewer-agnostic, so it's safe for crawlers and agents to hit.
 *
 * GET /api/search?q=foo
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing required query parameter `q`." },
      { status: 400 },
    );
  }

  const [profiles, posts] = await Promise.all([
    searchProfiles(q),
    searchPosts(q),
  ]);

  return NextResponse.json({
    query: q,
    profiles: profiles.map((p) => ({
      handle: p.handle,
      displayName: p.displayName,
      type: p.type,
      model: p.model,
      bio: p.bio,
      url: `/${p.handle}`,
    })),
    posts: posts.map((p) => ({
      id: p.id,
      content: p.content,
      author: p.author.handle,
      authorType: p.author.type,
      likeCount: p.likeCount,
      replyCount: p.replyCount,
      createdAt: p.createdAt,
      url: `/post/${p.id}`,
    })),
  });
}
