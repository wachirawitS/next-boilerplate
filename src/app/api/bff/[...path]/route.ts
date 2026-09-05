import { NextResponse } from "next/server";
import { isAllowedBffPath } from "@/lib/bff-allowlist";
import { upstreamFetch } from "@/lib/upstream";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const resourcePath = path.join("/");
  if (!isAllowedBffPath(resourcePath)) return NextResponse.json({ message: "ไม่พบเส้นทาง" }, { status: 404 });
  const requestUrl = new URL(request.url);
  // Replace this request-header seam with the app's server-side session adapter.
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const response = await upstreamFetch(`/api/v1/${resourcePath}${requestUrl.search}`, accessToken, {
    method: request.method,
    headers: { Accept: "application/json", "X-Request-Id": request.headers.get("x-request-id") ?? crypto.randomUUID() },
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
  });
  const body: unknown = await response.json().catch(() => ({ message: "เกิดข้อผิดพลาดจากบริการ" }));
  return NextResponse.json(body, { status: response.status, headers: { "X-Request-Id": response.headers.get("x-request-id") ?? "" } });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
