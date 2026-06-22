import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next 16 renamed the `middleware` file convention to `proxy` (function named
 * `proxy`, Node.js runtime by default). We use it only to keep the Supabase
 * auth session fresh — all authorization is enforced in Server Actions, not
 * here (the proxy can be bypassed; see AGENTS.md / data-security guidance).
 */
export async function proxy(request: NextRequest) {
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
