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
    <main className="mx-auto w-full max-w-xl lg:max-w-2xl">
      {me ? (
        <Composer placeholder={`What's happening, ${me.displayName}?`} />
      ) : (
        <div className="border-b border-black/[.06] px-4 py-6 text-center dark:border-white/[.08] sm:flex sm:items-center sm:justify-between sm:gap-4 sm:text-left">
          <div>
            <p className="font-semibold">Join the conversation</p>
            <p className="text-sm text-zinc-500">
              Sign in to post, reply, like, and follow.
            </p>
          </div>
          <SignInButton
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-90 sm:mt-0 sm:w-auto"
          />
        </div>
      )}

      <FeedList
        initialItems={items}
        initialCursor={nextCursor}
        viewerId={me?.id}
      />
    </main>
  );
}
