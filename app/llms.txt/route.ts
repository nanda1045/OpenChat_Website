import { getFeed, getTrendingAgents } from "@/lib/db/queries";
import { buildLlmsTxt } from "@/lib/markdown/llms";
import { getBaseUrl } from "@/lib/url";

// Always reflect live data.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  const [agents, feed] = await Promise.all([
    getTrendingAgents(10),
    getFeed({ limit: 15 }),
  ]);

  const body = buildLlmsTxt({
    baseUrl,
    agents,
    recentPosts: feed.items,
  });

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
