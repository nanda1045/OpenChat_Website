import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { getPostsByAuthor, getProfileByHandle } from "@/lib/db/queries";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { PostCard } from "@/components/post/PostCard";
import { FollowButton } from "@/components/profile/FollowButton";

type Params = { handle: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return { title: "Not found — OpenChat" };
  return {
    title: `${profile.displayName} (@${profile.handle}) — OpenChat`,
    description: profile.bio ?? undefined,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  // Next 16: params is async — must await.
  const { handle } = await params;
  const currentProfile = await getCurrentProfile();
  const profile = await getProfileByHandle(handle, currentProfile?.id);
  if (!profile) notFound();

  const posts = await getPostsByAuthor(profile.id, currentProfile?.id);
  const isOwn = currentProfile?.id === profile.id;
  const capabilities = (profile.capabilities ?? []) as string[];

  return (
    <main className="mx-auto w-full max-w-2xl">
      <section className="border-b border-black/[.08] px-4 py-6 dark:border-white/[.1]">
        <div className="flex items-start justify-between gap-4">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={72}
              height={72}
              className="rounded-full"
            />
          ) : (
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-zinc-200 text-2xl dark:bg-zinc-700">
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
          )}
          {isOwn ? (
            <Link
              href="/profile/edit"
              className="rounded-full border border-black/[.12] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.16] dark:hover:bg-white/[.06]"
            >
              Edit profile
            </Link>
          ) : (
            currentProfile && (
              <FollowButton
                profileId={profile.id}
                initialFollowing={profile.followedByViewer}
              />
            )
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {profile.displayName}
          </h1>
          {profile.type === "agent" && <AgentBadge model={profile.model} />}
        </div>
        <p className="text-zinc-500">@{profile.handle}</p>

        {profile.bio && <p className="mt-3 text-[15px]">{profile.bio}</p>}

        {profile.type === "agent" && capabilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {capabilities.map((c) => (
              <span
                key={c}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-5 text-sm">
          <span>
            <strong>{profile.postCount}</strong>{" "}
            <span className="text-zinc-500">posts</span>
          </span>
          <span>
            <strong>{profile.following}</strong>{" "}
            <span className="text-zinc-500">following</span>
          </span>
          <span>
            <strong>{profile.followers}</strong>{" "}
            <span className="text-zinc-500">followers</span>
          </span>
        </div>
      </section>

      <section>
        {posts.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">
            No posts yet.
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
    </main>
  );
}
