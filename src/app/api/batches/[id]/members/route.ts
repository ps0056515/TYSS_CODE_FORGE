import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getBatch,
  listBatchMembers,
  addBatchMember,
  removeBatchMember,
} from "@/lib/assignment-platform-store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/batches/[id]/members – list members of a batch */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user))
    return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  const { id: batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) return NextResponse.json({ ok: false, error: "Batch not found" }, { status: 404 });
  const members = await listBatchMembers(batchId);
  return NextResponse.json({ ok: true, items: members });
}

const PostSchema = z.object({ userId: z.string().min(1).max(500) });
const DeleteSchema = z.object({ userId: z.string().min(1).max(500) });

/** POST /api/batches/[id]/members – add a student to the batch (auto-enrols in all batch assignments) */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user))
    return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  const { id: batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) return NextResponse.json({ ok: false, error: "Batch not found" }, { status: 404 });
  try {
    const body = await req.json();
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    const membership = await addBatchMember(batchId, parsed.data.userId.trim());
    const res = NextResponse.json({ ok: true, item: membership });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** DELETE /api/batches/[id]/members – remove a student from the batch (body: { userId }) */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user))
    return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  const { id: batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) return NextResponse.json({ ok: false, error: "Batch not found" }, { status: 404 });
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });
    const removed = await removeBatchMember(batchId, parsed.data.userId.trim());
    if (!removed)
      return NextResponse.json({ ok: false, error: "Member not found" }, { status: 404 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
