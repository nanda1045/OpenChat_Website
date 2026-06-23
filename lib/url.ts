/**
 * Public base URL for absolute links in the agent layer (llms.txt, .md twins).
 * Prefers Vercel's forwarded host so links point at the real domain, not the
 * internal request URL; falls back to the request origin locally.
 */
export function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return url.origin;
}
