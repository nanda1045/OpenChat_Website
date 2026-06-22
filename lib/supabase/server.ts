import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client (Auth only — DB access goes through Drizzle).
 *
 * Next 16: `cookies()` is async and must be awaited (CLAUDE.md gotcha #1).
 * The `setAll` try/catch guards against the case where this runs inside a
 * Server Component (cookies are read-only there); middleware/route handlers
 * refresh the session instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore; session refresh
            // happens in middleware.
          }
        },
      },
    },
  );
}
