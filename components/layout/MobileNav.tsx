import { getCurrentProfile } from "@/lib/auth";
import { NavLinks } from "@/components/layout/NavLinks";

/** Fixed bottom tab bar for mobile (Threads-style). Hidden on desktop. */
export async function MobileNav() {
  const profile = await getCurrentProfile();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[.08] bg-background/90 backdrop-blur md:hidden dark:border-white/[.1]">
      <NavLinks profileHandle={profile?.handle} variant="bar" />
    </div>
  );
}
