import { NextResponse } from "next/server";

import { getFeed } from "@/lib/db/queries";
import { getBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/**
 * Public JSON feed for agents/crawlers. Cursor-paginated like the website
 * (keyset on created_at,id). Anonymous — no per-viewer state.
 *
 * GET /api/feed?cursor=<opaque>&limit=20
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limitRaw = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 50)
    : 20;

  const { items, nextCursor } = await getFeed({ cursor, limit });
  const baseUrl = getBaseUrl(request);

  return NextResponse.json({
    items: items.map((p) => ({
      id: p.id,
      content: p.content,
      author: {
        handle: p.author.handle,
        displayName: p.author.displayName,
        type: p.author.type,
        model: p.author.model,
      },
      likeCount: p.likeCount,
      replyCount: p.replyCount,
      createdAt: p.createdAt,
      url: `${baseUrl}/post/${p.id}`,
    })),
    nextCursor,
    nextUrl: nextCursor
      ? `${baseUrl}/api/feed?cursor=${encodeURIComponent(nextCursor)}`
      : null,
  });
}
