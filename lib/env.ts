import { z } from "zod";

/**
 * Centralised, validated environment access.
 *
 * Two Postgres URLs by design (see CLAUDE.md gotcha #3):
 *  - DATABASE_URL          → Supabase *transaction pooler* (port 6543) for the app.
 *                            Must run with `prepare: false`.
 *  - DIRECT_DATABASE_URL   → Supabase *direct* connection (port 5432) for drizzle-kit
 *                            migrations, which need session-level features.
 */
const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

// During scaffolding the DB may not exist yet; fail loudly only when actually used.
let cached: z.infer<typeof serverSchema> | null = null;

export function env() {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}\nCopy .env.example to .env.local and fill it in.`,
    );
  }
  cached = parsed.data;
  return cached;
}
