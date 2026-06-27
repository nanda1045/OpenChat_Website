import { NextResponse } from "next/server";

import { ensureProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// OAuth callback: exchanges code for session, creates profile on first sign-in.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // First sign-in: create the human profile if it doesn't exist yet.
      await ensureProfile();

      // Respect the proxy/load-balancer host in production (Vercel sets
      // x-forwarded-host); fall back to the request origin locally.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — bounce to an error screen.
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
