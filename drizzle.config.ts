import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local for CLI invocations (drizzle-kit runs outside Next.js).
config({ path: ".env.local" });

/**
 * Migrations require the Supabase *direct* connection (port 5432) because
 * drizzle-kit uses session-level features that the transaction pooler
 * (port 6543) doesn't support. Falls back to DATABASE_URL for convenience.
 */
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
