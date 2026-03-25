import { NextResponse } from "next/server";
import { getBatch, getOrCreateBatchJoinCode, rotateBatchJoinCode } from "@/lib/assignment-platform-store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toJoinUrl(origin: string | null, code: string): string {
  const rel = `/join/batch/${encodeURIComponent(code)}`;
  if (!origin) return rel;
  return `${origin}${rel}`;
}

/** GET /api/batches/[id]/join-link – admin-only: fetch shareable join link */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  const { id: batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) return NextResponse.json({ ok: false, error: "Batch not found" }, { status: 404 });

  const code = await getOrCreateBatchJoinCode(batchId);
  const origin = req.headers.get("origin");
  const joinUrl = toJoinUrl(origin, code);
  return NextResponse.json({ ok: true, joinUrl, code });
}

/** POST /api/batches/[id]/join-link – admin-only: rotate join link */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  const { id: batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) return NextResponse.json({ ok: false, error: "Batch not found" }, { status: 404 });

  const code = await rotateBatchJoinCode(batchId);
  const origin = req.headers.get("origin");
  const joinUrl = toJoinUrl(origin, code);

  const res = NextResponse.json({ ok: true, joinUrl, code });
  res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
  return res;
}

