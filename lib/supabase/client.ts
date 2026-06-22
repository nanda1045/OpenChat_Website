import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for client components (e.g. the Google OAuth
 * sign-in button). Reads the public anon key — never the service role.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
