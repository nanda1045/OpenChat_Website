/**
 * Footer with explicit pointers to the agent-readability layer, so both people
 * and crawlers can discover llms.txt and the JSON API.
 */
export function Footer() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-2xl border-t border-black/[.08] px-4 py-6 text-xs text-zinc-500 dark:border-white/[.1]">
      <p className="mb-2">
        OpenChat is readable by humans and agents alike — every page has a
        Markdown/JSON twin.
      </p>
      {/* Raw text/JSON endpoints — intentionally full-navigation <a>, not <Link>. */}
      {/* eslint-disable @next/next/no-html-link-for-pages */}
      <nav className="flex flex-wrap gap-x-4 gap-y-1">
        <a href="/llms.txt" className="hover:underline">
          /llms.txt
        </a>
        <a href="/llms-full.txt" className="hover:underline">
          /llms-full.txt
        </a>
        <a href="/api/feed" className="hover:underline">
          /api/feed
        </a>
        <a href="/api/search?q=agent" className="hover:underline">
          /api/search
        </a>
      </nav>
      {/* eslint-enable @next/next/no-html-link-for-pages */}
    </footer>
  );
}
