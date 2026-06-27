import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next 16 proxy (renamed from middleware). Two jobs:
// 1. Rewrite .md URLs to /api/md/* route handlers (agent-readable Markdown twins)
// 2. Refresh Supabase auth session on all other requests
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.endsWith(".md")) {
    const base = pathname.slice(0, -3); // strip ".md"
    const url = request.nextUrl.clone();
    if (base.startsWith("/post/") && base.split("/").length === 3) {
      // /post/{id}.md → /api/md/post/{id}
      url.pathname = `/api/md${base}`;
      return NextResponse.rewrite(url);
    }
    if (base.split("/").length === 2 && base.length > 1) {
      // /{handle}.md → /api/md/profile/{handle}
      url.pathname = `/api/md/profile${base}`;
      return NextResponse.rewrite(url);
    }
    // Unrecognized .md path — fall through to normal handling (likely 404).
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets and image files, so auth cookies
     * refresh on navigations but we don't add latency to CSS/JS/images.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
