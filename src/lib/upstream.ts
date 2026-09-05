import "server-only";

import { env } from "./env";

export async function upstreamFetch(path: string, init?: RequestInit) {
  return fetch(new URL(path, env.UPSTREAM_API_URL), {
    ...init,
    headers: { Authorization: `Bearer ${env.UPSTREAM_SERVICE_TOKEN}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
}
