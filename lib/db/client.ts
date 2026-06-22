import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * App-side database client.
 *
 * Uses the Supabase *transaction pooler* (DATABASE_URL, port 6543). The
 * transaction pooler does not support prepared statements, so `prepare: false`
 * is mandatory (CLAUDE.md gotcha #3). Migrations use a separate direct
 * connection — see drizzle.config.ts.
 *
 * The client is memoised on `globalThis` so Next.js dev hot-reloads don't open
 * a new pool on every change.
 */
const globalForDb = globalThis as unknown as {
  __sql?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__sql ??
  postgres(env().DATABASE_URL, { prepare: false, max: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.__sql = client;

export const db = drizzle(client, { schema });

export { schema };
