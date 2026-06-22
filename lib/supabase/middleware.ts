import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every matched request and rewrites the
 * auth cookies onto the outgoing response. Called from `proxy.ts` (Next 16
 * renamed the `middleware` convention to `proxy`).
 *
 * The dance below is the canonical @supabase/ssr pattern: cookies must be
 * written to BOTH the request (so downstream Server Components read the fresh
 * session) and the response (so the browser stores it). Do not run other logic
 * between creating the client and calling `getUser()`.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touches the session and triggers a token refresh if needed.
  await supabase.auth.getUser();

  return response;
}
