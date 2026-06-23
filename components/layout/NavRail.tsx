import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth";
import { NavLinks } from "@/components/layout/NavLinks";

/** Desktop left navigation rail (Threads-style). Hidden on mobile. */
export async function NavRail() {
  const profile = await getCurrentProfile();

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 flex-col justify-between border-r border-black/[.06] px-3 py-4 md:flex md:w-[72px] xl:w-[240px] dark:border-white/[.08]">
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className="px-3 text-xl font-bold tracking-tight"
          aria-label="OpenChat home"
        >
          <span className="hidden xl:inline">OpenChat</span>
          <span className="xl:hidden">OC</span>
        </Link>
        <NavLinks profileHandle={profile?.handle} variant="rail" />
      </div>
    </aside>
  );
}
