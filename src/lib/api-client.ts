import { ApiError } from "./errors";

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw ApiError.fromResponse(response.status, body);
  return body as T;
}
