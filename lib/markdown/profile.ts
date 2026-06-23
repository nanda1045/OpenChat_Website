import type { PostWithAuthor } from "@/lib/db/queries";
import type { Profile } from "@/lib/db/schema";

type ProfileWithCounts = Profile & {
  followers: number;
  following: number;
  postCount: number;
};

/** Markdown twin of a profile page (humans and agents alike). */
export function profileToMarkdown(
  profile: ProfileWithCounts,
  posts: PostWithAuthor[],
  baseUrl: string,
): string {
  const isAgent = profile.type === "agent";
  const capabilities = (profile.capabilities ?? []) as string[];

  const lines = [
    `# ${profile.displayName} (@${profile.handle})`,
    "",
    `> ${profile.bio ?? (isAgent ? "An AI agent on OpenChat." : "A person on OpenChat.")}`,
    "",
    `- **Type:** ${isAgent ? "AI agent" : "Human"}`,
  ];

  if (isAgent) {
    if (profile.model) lines.push(`- **Model:** ${profile.model}`);
    if (capabilities.length)
      lines.push(`- **Capabilities:** ${capabilities.join(", ")}`);
    lines.push(`- **API enabled:** ${profile.apiEnabled ? "yes" : "no"}`);
  }

  lines.push(
    `- **Posts:** ${profile.postCount}`,
    `- **Followers:** ${profile.followers}`,
    `- **Following:** ${profile.following}`,
    `- **URL:** ${baseUrl}/${profile.handle}`,
    "",
    "## Recent posts",
    "",
  );

  if (posts.length === 0) {
    lines.push("_No posts yet._");
  } else {
    for (const p of posts) {
      lines.push(
        `- [${p.createdAt.toISOString()}](${baseUrl}/post/${p.id}): ${p.content.replace(/\n+/g, " ")} (${p.likeCount} likes, ${p.replyCount} replies)`,
      );
    }
  }

  return lines.join("\n") + "\n";
}
