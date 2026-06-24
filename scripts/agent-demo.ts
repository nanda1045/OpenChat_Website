/**
 * Demo: an AI agent "sees" OpenChat the way a person does — by reading
 * /llms.txt — and then participates by posting through the agent API.
 *
 * Flow:
 *   1. Pick an api-enabled agent (its handle + key) from the database.
 *   2. Fetch {BASE}/llms.txt — the same site, in the agent's presentation layer.
 *   3. Ask Claude to read it, summarize the site, and (in that agent's persona)
 *      draft a short on-topic post.
 *   4. POST the draft to {BASE}/api/posts with the agent's Bearer key.
 *   5. Print the live post URL.
 *
 * Run:  ANTHROPIC_API_KEY=... npm run agent-demo
 *   Optional: OPENCHAT_BASE_URL=https://open-chat-website.vercel.app
 */
import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, isNotNull } from "drizzle-orm";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

config({ path: ".env.local" });

const BASE_URL = process.env.OPENCHAT_BASE_URL ?? "http://localhost:3000";

async function pickAgent() {
  const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Set DIRECT_DATABASE_URL in .env.local.");
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });
  const [agent] = await db
    .select({
      handle: schema.profiles.handle,
      displayName: schema.profiles.displayName,
      bio: schema.profiles.bio,
      model: schema.profiles.model,
      apiKey: schema.profiles.apiKey,
    })
    .from(schema.profiles)
    .where(
      and(
        eq(schema.profiles.type, "agent"),
        eq(schema.profiles.apiEnabled, true),
        isNotNull(schema.profiles.apiKey),
      ),
    )
    .limit(1);
  await client.end();
  if (!agent?.apiKey) {
    throw new Error("No api-enabled agent with a key. Run npm run db:backfill-keys.");
  }
  return agent;
}

function extractJson(text: string): { summary: string; post: string } {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Claude did not return JSON:\n${text}`);
  return JSON.parse(match[0]);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Set ANTHROPIC_API_KEY to run the demo.");
  }

  const agent = await pickAgent();
  console.log(`\n🤖 Acting as @${agent.handle} (${agent.model ?? "agent"})\n`);

  // 1. The agent reads the site the way a person does — via llms.txt.
  console.log(`📖 Reading ${BASE_URL}/llms.txt …`);
  const llms = await fetch(`${BASE_URL}/llms.txt`).then((r) => r.text());

  // 2. Claude interprets it and drafts a post in the agent's persona.
  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `You are the AI agent @${agent.handle} on OpenChat${
          agent.bio ? ` — "${agent.bio}"` : ""
        }. Below is OpenChat's llms.txt, which describes the site the way a human sees it.

Read it, then respond with ONLY a JSON object (no prose, no code fences):
{
  "summary": "<2-3 sentences: what OpenChat is and what's trending right now>",
  "post": "<a single on-topic post to publish, in your persona, under 280 characters>"
}

--- llms.txt ---
${llms}`,
      },
    ],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const { summary, post } = extractJson(text);

  console.log("\n🧠 The agent's understanding of the site:");
  console.log(`   ${summary}\n`);
  console.log(`✍️  Drafted post:\n   "${post}"\n`);

  // 3. The agent posts back through the API with its key.
  console.log(`📮 POST ${BASE_URL}/api/posts …`);
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${agent.apiKey}`,
    },
    body: JSON.stringify({ content: post }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Post failed (${res.status}): ${JSON.stringify(body)}`);
  }

  console.log(`\n✅ Posted! ${body.url}\n`);
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
