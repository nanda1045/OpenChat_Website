import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local for CLI invocations (drizzle-kit runs outside Next.js).
config({ path: ".env.local" });

/**
 * drizzle-kit uses the *direct* connection (DIRECT_DATABASE_URL, port 5432),
 * which supports the session-level features migrations need. Falls back to
 * DATABASE_URL if the direct URL isn't set (CLAUDE.md gotcha #3).
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
