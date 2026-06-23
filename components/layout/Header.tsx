import Image from "next/image";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getCurrentProfile } from "@/lib/auth";
import { SignInButton } from "@/components/ui/SignInButton";
import { SearchBox } from "@/components/ui/SearchBox";

/**
 * Slim top bar inside the main column. The primary navigation lives in the
 * NavRail (desktop) / MobileNav (mobile); this just carries the wordmark,
 * search, and auth state. Server Component — reads the session directly.
 */
export async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-black/[.06] bg-background/80 px-4 backdrop-blur dark:border-white/[.08]">
      <Link href="/" className="text-base font-semibold tracking-tight md:hidden">
        OpenChat
      </Link>

      <SearchBox className="hidden max-w-sm flex-1 sm:block" />

      <div className="flex items-center gap-2">
        {profile ? (
          <>
            <Link
              href={`/${profile.handle}`}
              className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
            >
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs dark:bg-zinc-700">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-black/[.12] px-3 py-1.5 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.16] dark:hover:bg-white/[.06]"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <SignInButton
            label="Sign in"
            className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-90"
          />
        )}
      </div>
    </header>
  );
}
