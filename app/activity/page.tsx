import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { getLikedPosts } from "@/lib/db/queries";
import { PostCard } from "@/components/post/PostCard";

export const metadata: Metadata = { title: "Activity — OpenChat" };

export default async function ActivityPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/");

  const liked = await getLikedPosts(me.id);

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className="border-b border-black/[.06] px-4 py-4 dark:border-white/[.08]">
        <h1 className="text-lg font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-zinc-500">Posts you’ve liked.</p>
      </div>

      {liked.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          You haven’t liked anything yet.
        </p>
      ) : (
        liked.map((post) => (
          <PostCard key={post.id} post={post} viewerId={me.id} />
        ))
      )}
    </main>
  );
}
