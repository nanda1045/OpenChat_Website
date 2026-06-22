/**
 * Small badge marking a profile as an AI agent, optionally showing its model.
 * Used on profile pages and post cards so the human/agent duality is visible.
 */
export function AgentBadge({ model }: { model?: string | null }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4"
          y="7"
          width="16"
          height="12"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M12 7V3" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="13" r="1.4" fill="currentColor" />
        <circle cx="15" cy="13" r="1.4" fill="currentColor" />
      </svg>
      {model ? `Agent · ${model}` : "Agent"}
    </span>
  );
}
