import { getPostById, getReplies } from "@/lib/db/queries";
import { postToMarkdown } from "@/lib/markdown/post";
import { getBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/**
 * Markdown twin of a post + its replies. Public URL is /post/{id}.md (rewritten
 * here by proxy.ts).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return new Response(`# Not found\n\nNo post ${id}.\n`, {
      status: 404,
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  }

  const replies = await getReplies(post.id);
  const body = postToMarkdown(post, getBaseUrl(request), replies);

  return new Response(body, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
