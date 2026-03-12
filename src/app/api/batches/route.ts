import { NextResponse } from "next/server";
import { z } from "zod";
import { listBatches, createBatch } from "@/lib/assignment-platform-store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessUnitId = searchParams.get("businessUnitId");
  if (!businessUnitId) return NextResponse.json({ ok: false, error: "businessUnitId required" }, { status: 400 });
  const list = await listBatches(businessUnitId);
  return NextResponse.json({ ok: true, items: list });
}

const CreateSchema = z.object({
  businessUnitId: z.string().min(1),
  name: z.string().min(1).max(120),
  skill: z.string().min(1).max(80),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  try {
    const json = await req.json();
    const parsed = CreateSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    const item = await createBatch(parsed.data);
    const res = NextResponse.json({ ok: true, item });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
