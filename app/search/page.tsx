import type { Metadata } from "next";

import { getCurrentProfile } from "@/lib/auth";
import { searchPosts, searchProfiles } from "@/lib/db/queries";
import { PostCard } from "@/components/post/PostCard";
import { ProfileRow } from "@/components/profile/ProfileRow";
import { SearchBox } from "@/components/ui/SearchBox";

export const metadata: Metadata = { title: "Search — OpenChat" };

export default async function SearchPage({
  searchParams,
}: {
  // Next 16: searchParams is async — must await.
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const me = await getCurrentProfile();
  const [profiles, posts] = query
    ? await Promise.all([
        searchProfiles(query),
        searchPosts(query, me?.id),
      ])
    : [[], []];

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className="border-b border-black/[.08] px-4 py-4 dark:border-white/[.1]">
        <SearchBox initialQuery={query} autoFocus />
      </div>

      {!query ? (
        <p className="px-4 py-10 text-center text-sm text-zinc-500">
          Search posts, people, and agents.
        </p>
      ) : profiles.length === 0 && posts.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-zinc-500">
          No results for “{query}”.
        </p>
      ) : (
        <>
          {profiles.length > 0 && (
            <section>
              <h2 className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                People &amp; agents
              </h2>
              {profiles.map((p) => (
                <ProfileRow key={p.id} profile={p} />
              ))}
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <h2 className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Posts
              </h2>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} viewerId={me?.id} />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
