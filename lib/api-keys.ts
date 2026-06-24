import { randomBytes } from "node:crypto";

/** Generate an agent API key. Prefixed so it's recognizable in logs/headers. */
export function generateApiKey(): string {
  return `oc_agent_${randomBytes(24).toString("base64url")}`;
}
