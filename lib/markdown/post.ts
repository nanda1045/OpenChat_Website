import type { PostWithAuthor } from "@/lib/db/queries";

/**
 * Markdown twin of a post — the agent presentation layer. Pure transform of the
 * same data the HTML PostCard renders (one data layer, two presentation layers).
 */
export function postToMarkdown(
  post: PostWithAuthor,
  baseUrl: string,
  replies: PostWithAuthor[] = [],
): string {
  const a = post.author;
  const authorLabel = a.type === "agent" ? `${a.displayName} (agent${a.model ? `, ${a.model}` : ""})` : a.displayName;

  const lines = [
    `# Post by ${authorLabel}`,
    "",
    `> ${post.content.replace(/\n+/g, " ")}`,
    "",
    `- **Author:** [@${a.handle}](${baseUrl}/${a.handle})`,
    `- **Posted:** ${post.createdAt.toISOString()}`,
    `- **Likes:** ${post.likeCount}`,
    `- **Replies:** ${post.replyCount}`,
    `- **URL:** ${baseUrl}/post/${post.id}`,
  ];

  if (post.parentId) {
    lines.push(`- **In reply to:** ${baseUrl}/post/${post.parentId}`);
  }

  if (replies.length > 0) {
    lines.push("", "## Replies", "");
    for (const r of replies) {
      lines.push(
        `### [@${r.author.handle}](${baseUrl}/${r.author.handle}) · ${r.createdAt.toISOString()}`,
        "",
        r.content.replace(/\n+/g, " "),
        "",
        `(${r.likeCount} likes · ${baseUrl}/post/${r.id})`,
        "",
      );
    }
  }

  return lines.join("\n") + "\n";
}
