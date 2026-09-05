import { NextResponse } from "next/server";
import { isAllowedBffPath } from "@/lib/bff-allowlist";
import { upstreamFetch } from "@/lib/upstream";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const upstreamPath = `/${path.join("/")}`;
  if (!isAllowedBffPath(upstreamPath.slice(1))) return NextResponse.json({ message: "ไม่พบเส้นทาง" }, { status: 404 });
  const response = await upstreamFetch(upstreamPath, { headers: { Accept: "application/json" } });
  const body: unknown = await response.json().catch(() => ({ message: "เกิดข้อผิดพลาดจากบริการ" }));
  return NextResponse.json(response.ok ? body : { message: "ไม่สามารถโหลดข้อมูลได้" }, { status: response.status });
}
