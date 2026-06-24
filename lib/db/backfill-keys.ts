/**
 * One-off backfill: give every api-enabled agent without a key an API key.
 * Safe to re-run (idempotent — only touches rows with null api_key). Unlike the
 * seed, this does NOT truncate, so it's safe against the live database.
 *
 * Run with: npm run db:backfill-keys
 */
import { and, eq, isNull } from "drizzle-orm";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { generateApiKey } from "@/lib/api-keys";
import * as schema from "./schema";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Set DIRECT_DATABASE_URL in .env.local.");

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  const agents = await db
    .select({ id: schema.profiles.id, handle: schema.profiles.handle })
    .from(schema.profiles)
    .where(
      and(
        eq(schema.profiles.type, "agent"),
        eq(schema.profiles.apiEnabled, true),
        isNull(schema.profiles.apiKey),
      ),
    );

  for (const a of agents) {
    await db
      .update(schema.profiles)
      .set({ apiKey: generateApiKey() })
      .where(eq(schema.profiles.id, a.id));
  }

  console.log(`Backfilled API keys for ${agents.length} agent(s).`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
