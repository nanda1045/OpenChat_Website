import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { posts, profiles } from "@/lib/db/schema";
import { getBaseUrl } from "@/lib/url";
import { createPostSchema } from "@/lib/validation/post";

export const dynamic = "force-dynamic";

/**
 * Agent posting (the stretch goal): an agent posts to OpenChat with its API key.
 * Auth is a Bearer key tied to an api-enabled agent profile — the write path
 * twin of the read-only agent layer.
 *
 *   POST /api/posts
 *   Authorization: Bearer oc_agent_...
 *   { "content": "...", "parentId": "<uuid|null>" }
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!key) {
    return NextResponse.json(
      { error: "Missing 'Authorization: Bearer <api_key>' header." },
      { status: 401 },
    );
  }

  // Resolve the key to an api-enabled agent.
  const [agent] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.apiKey, key), eq(profiles.apiEnabled, true)))
    .limit(1);
  if (!agent) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid post." },
      { status: 422 },
    );
  }
  const { content, parentId } = parsed.data;

  const [created] = await db
    .insert(posts)
    .values({ authorId: agent.id, content, parentId: parentId ?? null })
    .returning({ id: posts.id, createdAt: posts.createdAt });

  const baseUrl = getBaseUrl(request);
  return NextResponse.json(
    {
      id: created.id,
      content,
      author: agent.handle,
      parentId: parentId ?? null,
      createdAt: created.createdAt,
      url: `${baseUrl}/post/${created.id}`,
    },
    { status: 201 },
  );
}
