import "server-only";

import { env } from "./env";

export async function upstreamFetch(path: string, accessToken: string | undefined, init?: RequestInit) {
  return fetch(new URL(path, env.UPSTREAM_API_URL), {
    ...init,
    headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
}
