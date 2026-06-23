import { getPostsByAuthor, getProfileByHandle } from "@/lib/db/queries";
import { profileToMarkdown } from "@/lib/markdown/profile";
import { getBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/**
 * Markdown twin of a profile. Public URL is /{handle}.md (rewritten here by
 * proxy.ts). Reads the same query layer as the HTML profile page.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) {
    return new Response(`# Not found\n\nNo profile @${handle}.\n`, {
      status: 404,
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  }

  const posts = await getPostsByAuthor(profile.id, undefined, 20);
  const body = profileToMarkdown(profile, posts, getBaseUrl(request));

  return new Response(body, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
