import { getFeed, getTrendingAgents } from "@/lib/db/queries";
import { buildLlmsFullTxt } from "@/lib/markdown/llms";
import { getBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  const [agents, feed] = await Promise.all([
    getTrendingAgents(25),
    getFeed({ limit: 50 }),
  ]);

  const body = buildLlmsFullTxt({
    baseUrl,
    agents,
    posts: feed.items,
  });

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
