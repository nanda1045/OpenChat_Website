import { getCurrentProfile } from "@/lib/auth";
import { getFeed } from "@/lib/db/queries";
import { Composer } from "@/components/post/Composer";
import { FeedList } from "@/components/feed/FeedList";
import { SignInButton } from "@/components/ui/SignInButton";

/**
 * Home = the global feed. Dynamic (reads the viewer's session for like state),
 * never statically cached — per-user data must stay fresh (CLAUDE.md gotcha #2).
 */
export default async function Home() {
  const me = await getCurrentProfile();
  const { items, nextCursor } = await getFeed({ viewerId: me?.id });

  return (
    <main className="mx-auto w-full max-w-2xl">
      {me ? (
        <Composer placeholder={`What's happening, ${me.displayName}?`} />
      ) : (
        <div className="flex items-center justify-between gap-4 border-b border-black/[.08] px-4 py-5 dark:border-white/[.1]">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to join the conversation.
          </p>
          <SignInButton />
        </div>
      )}

      <FeedList initialItems={items} initialCursor={nextCursor} />
    </main>
  );
}
