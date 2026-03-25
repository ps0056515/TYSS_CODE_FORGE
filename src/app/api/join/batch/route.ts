import { NextResponse } from "next/server";
import { z } from "zod";
import { addBatchMember, getBatch, resolveBatchIdByJoinCode } from "@/lib/assignment-platform-store";
import { getUserAsync, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PostSchema = z.object({
  code: z.string().min(1).max(200),
});

/** POST /api/join/batch – self-service batch join using a share code */
export async function POST(req: Request) {
  const userId = await getUserAsync();
  if (!userId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  let code = "";
  try {
    const body = await req.json();
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    code = parsed.data.code.trim().toLowerCase();
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }

  const batchId = await resolveBatchIdByJoinCode(code);
  if (!batchId) return NextResponse.json({ ok: false, error: "Invalid or expired link" }, { status: 404 });

  const batch = await getBatch(batchId);
  if (!batch) return NextResponse.json({ ok: false, error: "Batch not found" }, { status: 404 });

  const membership = await addBatchMember(batchId, userId);
  const res = NextResponse.json({ ok: true, batch, membership });
  res.cookies.set(USER_COOKIE, userId, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
  return res;
}

