"use client";

import { useState, useTransition } from "react";

import { toggleFollow } from "@/app/actions/social";

/** Optimistic follow/unfollow button shown on other people's profiles. */
export function FollowButton({
  profileId,
  initialFollowing,
}: {
  profileId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function onClick() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const res = await toggleFollow(profileId);
      if (res.error) {
        setFollowing(!next);
        return;
      }
      setFollowing(res.following);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        following
          ? "border border-black/[.12] hover:bg-black/[.04] dark:border-white/[.16] dark:hover:bg-white/[.06]"
          : "bg-foreground text-background hover:opacity-90"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
