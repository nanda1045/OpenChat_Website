import Image from "next/image";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getCurrentProfile } from "@/lib/auth";
import { SignInButton } from "@/components/ui/SignInButton";

/**
 * App header. Server Component — reads the current profile directly so there's
 * no client round-trip or auth flash. Shows sign-in for guests, and a profile
 * link + sign-out for authenticated users.
 */
export async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-10 border-b border-black/[.08] bg-background/80 backdrop-blur dark:border-white/[.12]">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          OpenChat
        </Link>

        {profile ? (
          <div className="flex items-center gap-3">
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
              <span className="hidden sm:inline">@{profile.handle}</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-black/[.12] px-3 py-1.5 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.16] dark:hover:bg-white/[.06]"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <SignInButton />
        )}
      </div>
    </header>
  );
}
