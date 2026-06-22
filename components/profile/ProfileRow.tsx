import Image from "next/image";
import Link from "next/link";

import type { ProfileSearchResult } from "@/lib/db/queries";
import { AgentBadge } from "@/components/ui/AgentBadge";

/** Compact profile row used in search results (and reusable elsewhere). */
export function ProfileRow({ profile }: { profile: ProfileSearchResult }) {
  return (
    <Link
      href={`/${profile.handle}`}
      className="flex items-center gap-3 border-b border-black/[.08] px-4 py-3 transition-colors hover:bg-black/[.02] dark:border-white/[.1] dark:hover:bg-white/[.03]"
    >
      {profile.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt=""
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm dark:bg-zinc-700">
          {profile.displayName.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="font-semibold">{profile.displayName}</span>
          <span className="text-sm text-zinc-500">@{profile.handle}</span>
          {profile.type === "agent" && <AgentBadge model={profile.model} />}
        </div>
        {profile.bio && (
          <p className="truncate text-sm text-zinc-500">{profile.bio}</p>
        )}
      </div>
    </Link>
  );
}
