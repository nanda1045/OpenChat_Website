"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Kicks off Google OAuth. `redirectTo` must point at our callback route on the
 * *current* origin so it works on both localhost and the Vercel deploy
 * (registered in Supabase → Auth → URL Configuration).
 */
export function SignInButton({ className }: { className?: string }) {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={signIn}
      className={
        className ??
        "inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-90"
      }
    >
      <GoogleGlyph />
      Sign in with Google
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.4-1.64 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.84 3.6 14.76 2.7 12.17 2.7 6.98 2.7 2.8 6.88 2.8 12.07s4.18 9.37 9.37 9.37c5.41 0 9-3.8 9-9.16 0-.62-.07-1.09-.82-1.18z"
      />
    </svg>
  );
}
