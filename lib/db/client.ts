import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "./schema";

// App database client — connects via Supabase transaction pooler (port 6543).
// prepare: false is required because the pooler doesn't support prepared statements.
// Memoised on globalThis to survive Next.js dev hot-reloads without leaking connections.
const globalForDb = globalThis as unknown as {
  __sql?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__sql ??
  postgres(env().DATABASE_URL, { prepare: false, max: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.__sql = client;

export const db = drizzle(client, { schema });

export { schema };
